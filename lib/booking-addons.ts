import { prisma } from "@/lib/prisma";

export type BookingAddOn = { menuItemId: string; name: string; category: string; price: number };

export async function resolveBookingAddOns(value: unknown): Promise<{ items: BookingAddOn[] } | { error: string }> {
	if (value === undefined) return { items: [] };
	if (!Array.isArray(value) || value.length > 20 || value.some((id) => typeof id !== "string" || !id)) {
		return { error: "Choose up to 20 valid menu add-ons." };
	}

	const ids = [...new Set(value as string[])];
	if (!ids.length) return { items: [] };

	const menuItems = await prisma.menuItem.findMany({
		where: { id: { in: ids }, available: true, price: { gt: 0 }, category: { active: true } },
		include: { category: { select: { name: true } } },
	});
	if (menuItems.length !== ids.length) return { error: "A selected add-on is unavailable or has no active price." };

	return {
		items: menuItems.map((item) => ({
			menuItemId: item.id,
			name: item.name,
			category: item.category.name,
			price: Number(item.price),
		})),
	};
}