import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import OrderTracker from "@/components/OrderTracker";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function CustomerOrderDetailPage({ params }: PageProps) {
	const customer = await getCustomerSession();
	if (!customer) redirect("/account/login?next=%2Faccount%2Forders");
	const { id } = await params;
	const order = await prisma.order.findFirst({ where: { id, customerId: customer.id }, include: { items: true } });
	if (!order) redirect("/account/orders");

	return <><StoreHeader /><OrderTracker initialOrder={{
	id: order.id,
	orderNumber: order.orderNumber,
	status: order.status,
	paymentStatus: order.paymentStatus,
	scheduledAt: order.scheduledAt?.toISOString() ?? null,
	createdAt: order.createdAt.toISOString(),
	total: Number(order.total),
	items: order.items.map((item) => ({ id: item.id, itemName: item.itemName, quantity: item.quantity })),
}} /></>;
}