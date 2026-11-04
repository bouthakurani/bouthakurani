import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CustomerOrdersPage() {
	const customer = await getCustomerSession();
	if (!customer) redirect("/account/login?next=%2Faccount%2Forders");
	const orders = await prisma.order.findMany({
		where: { customerId: customer.id },
		orderBy: { createdAt: "desc" },
		take: 100,
	});

	return <>
		<StoreHeader />
		<main className="container public-page customer-orders-page">
			<Link href="/account" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Account</Link>
			<div className="public-page-heading"><span className="eyebrow"><PackageCheck size={14} aria-hidden="true" /> CUSTOMER ORDERS</span><h1>My orders</h1><p className="muted">Track order status and scheduled delivery times.</p></div>
			{orders.length ? <div className="customer-order-list">{orders.map((order) => <Link className="customer-order-card" href={`/account/orders/${encodeURIComponent(order.id)}`} key={order.id}>
				<span><strong>{order.orderNumber}</strong><small>{order.createdAt.toLocaleDateString("en-IN")}</small></span>
				<span><strong>{order.status.replaceAll("_", " ")}</strong><small>Delivery: {order.scheduledAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(order.scheduledAt) : "Not scheduled"}</small></span>
				<strong>₹{Number(order.total).toFixed(2)}</strong>
			</Link>)}</div> : <section className="card cart-empty"><PackageCheck size={28} aria-hidden="true" /><h2>No orders yet</h2><p className="muted">Your placed orders will appear here.</p><Link className="btn gold form-submit" href="/menu">Browse menu</Link></section>}
		</main>
	</>;
}