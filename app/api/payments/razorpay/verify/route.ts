import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	const keySecret = process.env.RAZORPAY_KEY_SECRET;
	if (!keySecret) return NextResponse.json({ error: "Online payment verification is not configured." }, { status: 503 });

	try {
		const body = await request.json();
		const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
		const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
		const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
		if (!orderId || !paymentId || !/^[a-f0-9]{64}$/i.test(signature)) {
			return NextResponse.json({ error: "Payment response was incomplete." }, { status: 400 });
		}

		const order = await prisma.order.findUnique({ where: { paymentOrderId: orderId } });
		if (!order) return NextResponse.json({ error: "The order for this payment was not found." }, { status: 404 });
		if (order.paymentStatus === "PAID") {
			if (order.paymentId === paymentId) return NextResponse.json({ verified: true, orderNumber: order.orderNumber });
			return NextResponse.json({ error: "This order has already been paid with another payment reference." }, { status: 409 });
		}

		const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest();
		const received = Buffer.from(signature, "hex");
		if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
			return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
		}

		await prisma.order.update({
			where: { id: order.id },
			data: { paymentId, paymentStatus: "PAID", status: "CONFIRMED" },
		});
		return NextResponse.json({ verified: true, orderNumber: order.orderNumber });
	} catch {
		return NextResponse.json({ error: "Could not verify this payment." }, { status: 400 });
	}
}