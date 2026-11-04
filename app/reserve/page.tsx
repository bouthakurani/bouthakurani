import PublicForm from "@/components/PublicForm";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { prisma } from "@/lib/prisma";

export default async function Reserve() {
	const addOnItems = await prisma.menuItem.findMany({
		where: { available: true, price: { gt: 0 }, category: { active: true } },
		include: { category: { select: { name: true } } },
		orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
	}).catch(() => []);

	return <>
		<StoreHeader />
		<main className="container public-page form-page">
			<Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Home</Link>
			<div className="public-page-heading"><span className="eyebrow"><CalendarDays size={14} aria-hidden="true" /> MAKE TIME FOR A GOOD MEAL</span><h1>Reserve a Table</h1><p className="muted">Send your reservation request. Our team will confirm availability.</p></div>
			<PublicForm endpoint="/api/reservations" kind="reservation" addOnItems={addOnItems.map((item) => ({ id: item.id, name: item.name, category: item.category.name, price: Number(item.price) }))} />
		</main>
	</>;
}