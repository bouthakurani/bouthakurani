import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Orders() {
	const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 });
	return <>
		<h1 style={{ fontSize: 30 }}>Orders</h1>
		<p className="muted">Online and restaurant orders, including scheduled deliveries and payment status.</p>
		<div className="tablewrap"><table>
			<thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Address</th><th>Delivery time</th><th>Payment</th><th>Status</th><th>Total</th><th>Created</th></tr></thead>
			<tbody>{orders.map((order) => <tr key={order.id}>
				<td>{order.orderNumber}</td>
				<td>{order.customerName}</td>
				<td>{order.customerPhone}</td>
				<td>{order.deliveryAddress || "-"}</td>
				<td>{order.scheduledAt?.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) || "Not scheduled"}</td>
				<td>{order.paymentMethod} · {order.paymentStatus}</td>
				<td>{order.status}</td>
				<td>₹{Number(order.total).toFixed(2)}</td>
				<td>{order.createdAt.toLocaleString("en-IN")}</td>
			</tr>)}{!orders.length && <tr><td colSpan={9}>No orders found.</td></tr>}</tbody>
		</table></div>
	</>;
}