import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const cookieName = "bouthakurani_customer_session";
const customerSecret = process.env.JWT_SECRET
	? `${process.env.JWT_SECRET}:customer-session`
	: "development-only-change-this-secret-123456:customer-session";
const secret = new TextEncoder().encode(customerSecret);
const sessionDuration = 60 * 60 * 24 * 14;

export type CustomerSession = {
	id: string;
	name: string;
	phone: string;
	email: string | null;
	address: string | null;
};

export async function createCustomerSession(customerId: string) {
	const token = await new SignJWT({ kind: "customer" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(customerId)
		.setAudience("bouthakurani-customer")
		.setIssuedAt()
		.setExpirationTime(`${sessionDuration}s`)
		.sign(secret);

	(await cookies()).set(cookieName, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: sessionDuration,
	});
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
	try {
		const token = (await cookies()).get(cookieName)?.value;
		if (!token) return null;
		const { payload } = await jwtVerify(token, secret, { audience: "bouthakurani-customer" });
		if (payload.kind !== "customer" || !payload.sub) return null;

		return await prisma.customer.findUnique({
			where: { id: String(payload.sub) },
			select: { id: true, name: true, phone: true, email: true, address: true },
		});
	} catch {
		return null;
	}
}

export async function clearCustomerSession() {
	(await cookies()).delete(cookieName);
}