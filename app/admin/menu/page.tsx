import { prisma } from "@/lib/prisma";
import MenuAdmin from "@/components/MenuAdmin";
import MenuCategoryAdmin from "@/components/MenuCategoryAdmin";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
	const [items, categories] = await Promise.all([
		prisma.menuItem.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
		prisma.menuCategory.findMany({ include: { _count: { select: { items: true } } }, orderBy: { sortOrder: "asc" } }),
	]);

	return <>
		<h1 style={{ fontSize: 30 }}>Menu Management</h1>
		<p className="muted">Manage menu sections, dish details, images and availability.</p>
		<MenuCategoryAdmin categories={categories.map((category) => ({
			id: category.id,
			name: category.name,
			sortOrder: category.sortOrder,
			active: category.active,
			itemCount: category._count.items,
		}))} />
		<MenuAdmin items={items.map((item) => ({ ...item, price: Number(item.price) }))} categories={categories} />
	</>;
}