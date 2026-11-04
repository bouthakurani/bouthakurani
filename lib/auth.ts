import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-this-secret-123456");
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
  (await cookies()).set("bouthakurani_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}
export async function getSessionUser() {
  try {
    const token = (await cookies()).get("bouthakurani_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return await prisma.user.findUnique({ where: { id: String(payload.sub) }, select: { id: true, email: true, name: true, role: true, mustChangePassword: true } });
  } catch { return null; }
}
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}