import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ phone: z.string().trim().min(10).max(24), password: z.string().min(1).max(100) });

export async function POST(request: Request) {
	try {
		const input = schema.parse(await request.json());
		const phone = input.phone.replace(/\D/g, "");
		const customer = await prisma.customer.findUnique({ where: { phone } });
		if (!customer?.passwordHash || !(await bcrypt.compare(input.password, customer.passwordHash))) {
			return NextResponse.json({ error: "Invalid mobile number or password." }, { status: 401 });
		}

		await createCustomerSession(customer.id);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Invalid mobile number or password." }, { status: 400 });
	}
}