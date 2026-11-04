import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

function parseImageUrl(value: unknown): { imageUrl?: string | null; error?: string } {
	if (typeof value !== "string" || !value.trim()) return { imageUrl: null };

	try {
		const imageUrl = new URL(value.trim());
		if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") return { error: "Image URL must use HTTP or HTTPS." };
		return { imageUrl: imageUrl.toString() };
	} catch {
		return { error: "Enter a valid image URL." };
	}
}

export async function PATCH(request: Request, { params }: RouteContext) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { id } = await params;
		const body = await request.json();
		const price = Number(body.price);
		if (!body.name || !body.categoryId || !Number.isFinite(price) || price < 0) {
			return NextResponse.json({ error: "Name, category and valid price are required." }, { status: 400 });
		}

		const parsedImage = parseImageUrl(body.imageUrl);
		if (parsedImage.error) return NextResponse.json({ error: parsedImage.error }, { status: 400 });

		const item = await prisma.menuItem.update({
			where: { id },
			data: {
				name: String(body.name).trim(),
				description: typeof body.description === "string" ? body.description.trim() || null : null,
				imageUrl: parsedImage.imageUrl ?? null,
				price,
				categoryId: String(body.categoryId),
				isVeg: body.isVeg === true || body.isVeg === "true",
				available: body.available === true || body.available === "true",
			},
		});
		return NextResponse.json(item);
	} catch {
		return NextResponse.json({ error: "Could not update this menu item." }, { status: 400 });
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { id } = await params;
		const orderItemCount = await prisma.orderItem.count({ where: { menuItemId: id } });
		if (orderItemCount > 0) {
			await prisma.menuItem.update({ where: { id }, data: { available: false } });
			return NextResponse.json({ ok: true, archived: true });
		}
		await prisma.menuItem.delete({ where: { id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Could not delete this menu item." }, { status: 400 });
	}
}