import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveBookingAddOns } from "@/lib/booking-addons";
import { getReservationDateParts, getReservationSlotStart, reservationSlotCapacity } from "@/lib/reservation-schedule";
import { prisma } from "@/lib/prisma";

export async function GET() {
	if (!await getSessionUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	return NextResponse.json(await prisma.reservation.findMany({ orderBy: { bookingAt: "asc" }, take: 300 }));
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const phone = typeof body.phone === "string" ? body.phone.trim() : "";
		const phoneDigits = phone.replace(/\D/g, "");
		const guests = Number(body.guests);
		const bookingAt = new Date(body.bookingAt);
		if (name.length < 2 || name.length > 100 || phoneDigits.length < 10 || phoneDigits.length > 15 || !Number.isInteger(guests) || guests < 1 || guests > 40 || Number.isNaN(bookingAt.getTime())) {
			return NextResponse.json({ error: "Please provide a valid name, mobile, booking slot, and guest count." }, { status: 400 });
		}

		const slotStart = getReservationSlotStart(bookingAt);
		if (!slotStart || slotStart.getTime() !== bookingAt.getTime()) {
			return NextResponse.json({ error: "Choose one of the available hourly table slots." }, { status: 400 });
		}
		const slotDelay = slotStart.getTime() - Date.now();
		if (slotDelay < 60 * 60 * 1000 || slotDelay > 90 * 24 * 60 * 60 * 1000) {
			return NextResponse.json({ error: "Reservations must be at least one hour ahead and within the next 90 days." }, { status: 400 });
		}

		const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
		if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
		const addOns = await resolveBookingAddOns(body.addOnIds);
		if ("error" in addOns) return NextResponse.json({ error: addOns.error }, { status: 400 });

		const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
		const reservation = await prisma.$transaction(async (transaction) => {
			const booked = await transaction.reservation.count({
				where: {
					bookingAt: { gte: slotStart, lt: slotEnd },
					status: { notIn: ["CANCELLED", "NO_SHOW"] },
				},
			});
			if (booked >= reservationSlotCapacity) throw new Error("RESERVATION_SLOT_FULL");

			return transaction.reservation.create({
				data: {
					name,
				phone: phoneDigits,
					email,
					guests,
					bookingAt,
					addOns: addOns.items.length ? addOns.items : undefined,
					notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) || null : null,
				},
			});
		}, { isolationLevel: "Serializable" });

		return NextResponse.json({ id: reservation.id, bookingAt: reservation.bookingAt }, { status: 201 });
	} catch (error) {
		if (error instanceof Error && (error.message === "RESERVATION_SLOT_FULL" || ("code" in error && error.code === "P2034"))) {
			return NextResponse.json({ error: "That time just filled up. Please choose another available slot." }, { status: 409 });
		}
		return NextResponse.json({ error: "Unable to create reservation. Please check the details and try again." }, { status: 400 });
	}
}