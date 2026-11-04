import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const items = await prisma.menuItem.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
	return NextResponse.json(items);
}

export async function POST(request: Request) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const body = await request.json();
		const price = Number(body.price);
		if (!body.name || !body.categoryId || !Number.isFinite(price) || price < 0) {
			return NextResponse.json({ error: "Name, category and valid price are required." }, { status: 400 });
		}

		let imageUrl: string | null = null;
		if (typeof body.imageUrl === "string" && body.imageUrl.trim()) {
			try {
				const parsedImageUrl = new URL(body.imageUrl.trim());
				if (parsedImageUrl.protocol !== "https:" && parsedImageUrl.protocol !== "http:") {
					return NextResponse.json({ error: "Image URL must use HTTP or HTTPS." }, { status: 400 });
				}
				imageUrl = parsedImageUrl.toString();
			} catch {
				return NextResponse.json({ error: "Enter a valid image URL." }, { status: 400 });
			}
		}

		const item = await prisma.menuItem.create({
			data: {
				name: String(body.name),
				description: body.description || null,
				imageUrl,
				price,
				categoryId: body.categoryId,
				isVeg: !!body.isVeg,
				available: body.available !== false,
			},
		});
		return NextResponse.json(item, { status: 201 });
	} catch {
		return NextResponse.json({ error: "Could not create menu item." }, { status: 400 });
	}
}