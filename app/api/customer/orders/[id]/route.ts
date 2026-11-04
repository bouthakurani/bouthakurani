import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
	const customer = await getCustomerSession();
	if (!customer) return NextResponse.json({ error: "Sign in to track this order." }, { status: 401 });
	const { id } = await params;
	const order = await prisma.order.findFirst({
		where: { id, customerId: customer.id },
		select: { id: true, orderNumber: true, status: true, paymentStatus: true, scheduledAt: true, createdAt: true, total: true, items: true },
	});
	if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
	return NextResponse.json(order);
}