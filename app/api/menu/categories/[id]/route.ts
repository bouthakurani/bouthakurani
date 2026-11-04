import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { id } = await params;
		const body = await request.json();
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const sortOrder = Number(body.sortOrder);
		if (!name || name.length > 60 || !Number.isInteger(sortOrder) || sortOrder < 0 || typeof body.active !== "boolean") {
			return NextResponse.json({ error: "Enter a category name, valid display order, and visibility." }, { status: 400 });
		}

		const category = await prisma.menuCategory.update({ where: { id }, data: { name, sortOrder, active: body.active } });
		return NextResponse.json(category);
	} catch {
		return NextResponse.json({ error: "Could not update this category. Check for a duplicate name." }, { status: 400 });
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { id } = await params;
		const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
		if (itemCount > 0) {
			return NextResponse.json({ error: `This category still has ${itemCount} menu items. Move or delete them first.` }, { status: 409 });
		}

		await prisma.menuCategory.delete({ where: { id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Could not delete this category." }, { status: 400 });
	}
}