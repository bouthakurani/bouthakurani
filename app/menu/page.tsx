import Link from "next/link";
import { ArrowLeft, ImageOff, Leaf, Utensils } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import MenuAddButton from "@/components/MenuAddButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; category?: string | string[] }> }) {
	const params = await searchParams;
	const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
	const selectedCategory = (Array.isArray(params.category) ? params.category[0] : params.category)?.trim() ?? "";
	const itemSearch = query ? {
		OR: [
			{ name: { contains: query, mode: "insensitive" as const } },
			{ description: { contains: query, mode: "insensitive" as const } },
		],
	} : {};
	const itemWhere = { available: true, ...itemSearch };
	const [allCategories, categories] = await Promise.all([
		prisma.menuCategory.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
		prisma.menuCategory.findMany({
			where: {
				active: true,
				...(selectedCategory ? { name: selectedCategory } : {}),
				...(query ? { items: { some: itemWhere } } : {}),
			},
			include: { items: { where: itemWhere, orderBy: { name: "asc" } } },
			orderBy: { sortOrder: "asc" },
		}).catch(() => []),
	]);
	const categoryHref = (category?: string) => {
		const search = new URLSearchParams();
		if (query) search.set("q", query);
		if (category) search.set("category", category);
		return search.size ? `/menu?${search.toString()}` : "/menu";
	};

	return <>
		<StoreHeader showSearch searchQuery={query} />
		<main className="container public-page menu-page">
			<Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Home</Link>
			<div className="public-page-heading">
				<span className="eyebrow">FRESH FROM OUR KITCHEN</span>
				<h1>Our Menu</h1>
				<p className="muted">{query ? `Showing menu results for “${query}”.` : "Bengali favourites and comfort food, prepared with care."}</p>
			</div>
			<nav className="menu-category-pills" aria-label="Filter by category">
				<Link href={categoryHref()} className={!selectedCategory ? "active" : ""}>All</Link>
				{allCategories.map((category) => <Link href={categoryHref(category.name)} className={selectedCategory === category.name ? "active" : ""} key={category.id}>{category.name}</Link>)}
			</nav>
			{categories.length === 0 ? <div className="card">{query ? `No dishes found for “${query}”. Try another search.` : selectedCategory ? `No available items in ${selectedCategory}.` : "Our menu is being updated. Please check back soon."}</div> : categories.map((category) => (
				<section className="menu-category" key={category.id}>
					<div className="menu-category-heading"><h2>{category.name}</h2><span>{category.items.length} items</span></div>
					<div className="menu-item-grid">
						{category.items.map((item) => (
							<article className="menu-item-card" key={item.id}>
								<div className="menu-item-image">
									{item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : (
										<div className="menu-image-placeholder" aria-label={`No image for ${item.name}`}>
											<ImageOff size={22} aria-hidden="true" />
										</div>
									)}
								</div>
								<div className="menu-item-content">
									<div className="menu-item-heading">
										<h3>{item.name}</h3>
										{item.isVeg && <span className="menu-veg-label"><Leaf size={14} aria-hidden="true" />Veg</span>}
									</div>
									{item.description && <p>{item.description}</p>}
									<div className="menu-item-footer"><span><Utensils size={15} aria-hidden="true" />Freshly prepared</span><strong>{Number(item.price) > 0 ? `₹${Number(item.price).toFixed(2)}` : "Price on request"}</strong></div>
									<MenuAddButton item={{ menuItemId: item.id, name: item.name, price: Number(item.price), imageUrl: item.imageUrl, isVeg: item.isVeg }} />
								</div>
							</article>
						))}
					</div>
				</section>
			))}
		</main>
	</>;
}