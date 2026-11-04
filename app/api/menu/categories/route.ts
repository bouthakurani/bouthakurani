import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	return NextResponse.json(await prisma.menuCategory.findMany({ orderBy: { sortOrder: "asc" } }));
}

export async function POST(request: Request) {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const body = await request.json();
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const sortOrder = Number(body.sortOrder);
		if (!name || name.length > 60 || !Number.isInteger(sortOrder) || sortOrder < 0) {
			return NextResponse.json({ error: "Enter a category name and a valid display order." }, { status: 400 });
		}

		const category = await prisma.menuCategory.create({ data: { name, sortOrder, active: true } });
		return NextResponse.json(category, { status: 201 });
	} catch {
		return NextResponse.json({ error: "A category with this name may already exist." }, { status: 409 });
	}
}