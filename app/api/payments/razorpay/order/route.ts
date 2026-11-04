import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const minimumScheduleDelay = 60 * 60 * 1000;
const maximumScheduleDelay = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
	const customerSession = await getCustomerSession();
	if (!customerSession) return NextResponse.json({ error: "Sign in to your customer account before placing an order." }, { status: 401 });

	const keyId = process.env.RAZORPAY_KEY_ID;
	const keySecret = process.env.RAZORPAY_KEY_SECRET;
	if (!keyId || !keySecret) {
		return NextResponse.json({ error: "Online payments are not configured yet. Please contact the restaurant." }, { status: 503 });
	}

	try {
		const body = await request.json();
		const customerName = customerSession.name;
		const customerPhone = customerSession.phone;
		const customerEmail = customerSession.email ?? "";
		const deliveryAddress = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
		const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";
		const phoneDigits = customerPhone.replace(/\D/g, "");
		if (customerName.length < 2 || customerName.length > 100 || phoneDigits.length < 8 || phoneDigits.length > 15 || deliveryAddress.length < 8 || deliveryAddress.length > 500) {
			return NextResponse.json({ error: "Enter a valid name, mobile number, and delivery address." }, { status: 400 });
		}
		if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail)) {
			return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
		}

		const scheduledAt = new Date(body.scheduledAt);
		const scheduleDelay = scheduledAt.getTime() - Date.now();
		if (Number.isNaN(scheduledAt.getTime()) || scheduleDelay < minimumScheduleDelay || scheduleDelay > maximumScheduleDelay) {
			return NextResponse.json({ error: "Choose a delivery time at least one hour from now and within the next 30 days." }, { status: 400 });
		}

		if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
			return NextResponse.json({ error: "Your cart is empty or contains too many different items." }, { status: 400 });
		}

		const quantities = new Map<string, number>();
		for (const line of body.items) {
			const menuItemId = typeof line.menuItemId === "string" ? line.menuItemId : "";
			const quantity = Number(line.quantity);
			if (!menuItemId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
				return NextResponse.json({ error: "One or more cart quantities are invalid." }, { status: 400 });
			}
			quantities.set(menuItemId, (quantities.get(menuItemId) ?? 0) + quantity);
			if ((quantities.get(menuItemId) ?? 0) > 99) return NextResponse.json({ error: "A dish quantity cannot exceed 99." }, { status: 400 });
		}

		const menuItems = await prisma.menuItem.findMany({
			where: { id: { in: [...quantities.keys()] }, available: true, price: { gt: 0 }, category: { active: true } },
		});
		if (menuItems.length !== quantities.size) {
			return NextResponse.json({ error: "A cart item is unavailable, hidden, or still needs a price." }, { status: 400 });
		}

		const orderLines = menuItems.map((menuItem) => {
			const quantity = quantities.get(menuItem.id)!;
			const unitPricePaise = Math.round(Number(menuItem.price) * 100);
			return {
				menuItemId: menuItem.id,
				itemName: menuItem.name,
				quantity,
				unitPricePaise,
				lineTotalPaise: unitPricePaise * quantity,
			};
		});
		const subtotalPaise = orderLines.reduce((sum, line) => sum + line.lineTotalPaise, 0);
		if (subtotalPaise < 100) return NextResponse.json({ error: "The order total is below the minimum online payment amount." }, { status: 400 });

		const customer = await prisma.customer.update({ where: { id: customerSession.id }, data: { address: deliveryAddress } });
		const orderNumber = `BTK-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
		const paymentResponse = await fetch("https://api.razorpay.com/v1/orders", {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: subtotalPaise,
				currency: "INR",
				receipt: orderNumber,
				notes: { orderNumber, scheduledAt: scheduledAt.toISOString() },
			}),
			cache: "no-store",
		});
		if (!paymentResponse.ok) return NextResponse.json({ error: "The payment provider could not start checkout. Please try again." }, { status: 502 });
		const paymentOrder = await paymentResponse.json();

		const order = await prisma.order.create({
			data: {
				orderNumber,
				type: "DELIVERY",
				customerId: customer.id,
				customerName,
				customerPhone,
				deliveryAddress,
				scheduledAt,
				subtotal: subtotalPaise / 100,
				total: subtotalPaise / 100,
				tax: 0,
				deliveryFee: 0,
				paymentMethod: "RAZORPAY",
				paymentStatus: "PENDING",
				paymentOrderId: paymentOrder.id,
				notes: notes || null,
				items: { create: orderLines.map(({ unitPricePaise, lineTotalPaise, ...line }) => ({ ...line, unitPrice: unitPricePaise / 100, lineTotal: lineTotalPaise / 100 })) },
			},
		});

		return NextResponse.json({
			orderId: order.id,
			orderNumber: order.orderNumber,
			keyId,
			razorpayOrderId: paymentOrder.id,
			amount: subtotalPaise,
			currency: "INR",
		});
	} catch {
		return NextResponse.json({ error: "Could not prepare your order. Please check your details and try again." }, { status: 400 });
	}
}