import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const customer = await getCustomerSession();
	if (!customer) return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });

	const orders = await prisma.order.findMany({
		where: { customerId: customer.id },
		include: { items: true },
		orderBy: { createdAt: "desc" },
		take: 100,
	});
	return NextResponse.json(orders);
}