import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
	name: z.string().trim().min(2).max(100),
	phone: z.string().trim().min(10).max(24),
	email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
	password: z.string().min(10).max(100),
});

export async function POST(request: Request) {
	try {
		const input = schema.parse(await request.json());
		const phone = input.phone.replace(/\D/g, "");
		if (phone.length < 10 || phone.length > 15) {
			return NextResponse.json({ error: "Enter a valid mobile number with country code if needed." }, { status: 400 });
		}

		const existing = await prisma.customer.findUnique({ where: { phone } });
		if (existing) {
			return NextResponse.json({ error: "This number is already linked to a customer record. Contact the restaurant to link your account." }, { status: 409 });
		}

		const passwordHash = await bcrypt.hash(input.password, 12);
		const customer = await prisma.customer.create({
			data: {
				name: input.name,
				phone,
				email: input.email || null,
				passwordHash,
			},
		});
		await createCustomerSession(customer.id);
		return NextResponse.json({ ok: true });
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
			return NextResponse.json({ error: "An account already uses these details." }, { status: 409 });
		}
		return NextResponse.json({ error: "Enter valid details. Passwords must be at least 10 characters." }, { status: 400 });
	}
}