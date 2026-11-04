import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveBookingAddOns } from "@/lib/booking-addons";
import { eventSlotCapacity, eventSlotDurationMilliseconds, getEventSlotStart } from "@/lib/reservation-schedule";
import { prisma } from "@/lib/prisma";

const allowedEventExtras = new Set(["DJ", "Live music"]);

export async function GET() {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	return NextResponse.json(await prisma.cateringEnquiry.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const phone = typeof body.phone === "string" ? body.phone.trim().replace(/\D/g, "") : "";
		const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
		const location = typeof body.location === "string" ? body.location.trim() : "";
		const guests = Number(body.guests);
		const eventDate = new Date(body.eventDate);
		if (name.length < 2 || name.length > 100 || phone.length < 10 || phone.length > 15 || !eventType || eventType.length > 80 || location.length < 3 || location.length > 300 || !Number.isInteger(guests) || guests < 1 || guests > 1000 || Number.isNaN(eventDate.getTime()) || eventDate.getTime() < Date.now()) {
			return NextResponse.json({ error: "Enter valid contact details, event type, future date, location and guest count." }, { status: 400 });
		}
		const slotStart = getEventSlotStart(eventDate);
		if (!slotStart || slotStart.getTime() !== eventDate.getTime()) return NextResponse.json({ error: "Choose an available event start time." }, { status: 400 });
		const slotDelay = slotStart.getTime() - Date.now();
		if (slotDelay < 60 * 60 * 1000 || slotDelay > 90 * 24 * 60 * 60 * 1000) {
			return NextResponse.json({ error: "Events must be scheduled at least one hour ahead and within the next 90 days." }, { status: 400 });
		}

		const addOns = await resolveBookingAddOns(body.addOnIds);
		if ("error" in addOns) return NextResponse.json({ error: addOns.error }, { status: 400 });
		const requestedExtras = body.eventExtras === undefined ? [] : body.eventExtras;
		if (!Array.isArray(requestedExtras) || requestedExtras.some((extra) => typeof extra !== "string" || !allowedEventExtras.has(extra))) {
			return NextResponse.json({ error: "Choose valid event entertainment add-ons." }, { status: 400 });
		}

		const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
		if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

		const slotEnd = new Date(slotStart.getTime() + eventSlotDurationMilliseconds);
		const enquiry = await prisma.$transaction(async (transaction) => {
			const booked = await transaction.cateringEnquiry.count({
				where: { eventDate: { gte: slotStart, lt: slotEnd }, status: { not: "CANCELLED" } },
			});
			if (booked >= eventSlotCapacity) throw new Error("EVENT_SLOT_FULL");

			return transaction.cateringEnquiry.create({
				data: {
					name,
					phone,
					email,
					eventType,
					eventDate,
					location,
					guests,
					addOns: { menuItems: addOns.items, entertainment: [...new Set(requestedExtras)] },
					notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) || null : null,
				},
			});
		}, { isolationLevel: "Serializable" });
		return NextResponse.json(enquiry, { status: 201 });
	} catch (error) {
		if (error instanceof Error && (error.message === "EVENT_SLOT_FULL" || ("code" in error && error.code === "P2034"))) {
			return NextResponse.json({ error: "That event slot just filled up. Please choose another time." }, { status: 409 });
		}
		return NextResponse.json({ error: "Unable to submit event enquiry. Please check the details and try again." }, { status: 400 });
	}
}