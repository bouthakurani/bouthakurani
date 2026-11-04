import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set(["NEW", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]);
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { id } = await params;
		const body = await request.json();
		if (typeof body.status !== "string" || !allowedStatuses.has(body.status)) {
			return NextResponse.json({ error: "Choose a valid order status." }, { status: 400 });
		}

		const order = await prisma.order.findUnique({ where: { id }, select: { id: true, paymentMethod: true, paymentStatus: true } });
		if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
		if (order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID" && !["CANCELLED", "NEW"].includes(body.status)) {
			return NextResponse.json({ error: "Payment must be verified before preparing or dispatching this order." }, { status: 409 });
		}

		const updated = await prisma.order.update({ where: { id }, data: { status: body.status } });
		return NextResponse.json({ id: updated.id, status: updated.status });
	} catch {
		return NextResponse.json({ error: "Could not update order status." }, { status: 400 });
	}
}