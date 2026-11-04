import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getReservationDateParts, reservationDateStart, reservationSlotCapacity, reservationSlotTimes } from "@/lib/reservation-schedule";

export async function GET(request: Request) {
	const date = new URL(request.url).searchParams.get("date") ?? "";
	const start = reservationDateStart(date);
	if (!start) return NextResponse.json({ error: "Choose a valid reservation date." }, { status: 400 });

	const earliestDate = reservationDateStart(getReservationDateParts(new Date()).date)!;
	if (start < earliestDate || start.getTime() - earliestDate.getTime() > 90 * 24 * 60 * 60 * 1000) {
		return NextResponse.json({ error: "Reservations are available for the next 90 days." }, { status: 400 });
	}

	const bookings = await prisma.reservation.findMany({
		where: {
			bookingAt: { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) },
			status: { notIn: ["CANCELLED", "NO_SHOW"] },
		},
		select: { bookingAt: true },
	});
	const counts = new Map<string, number>();
	for (const booking of bookings) {
		const slot = getReservationDateParts(booking.bookingAt).time;
		counts.set(slot, (counts.get(slot) ?? 0) + 1);
	}

	return NextResponse.json({
		date,
		slots: reservationSlotTimes.map((time) => {
			const slotStart = new Date(`${date}T${time}:00+05:30`);
			const booked = counts.get(time) ?? 0;
			return { time, startsAt: slotStart.toISOString(), booked, capacity: reservationSlotCapacity, available: slotStart.getTime() >= Date.now() + 60 * 60 * 1000 && booked < reservationSlotCapacity };
		}),
	});
}