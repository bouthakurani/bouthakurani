import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSlotCapacity, eventSlotDurationMilliseconds, eventSlotTimes, getReservationDateParts, reservationDateStart } from "@/lib/reservation-schedule";

export async function GET(request: Request) {
	const date = new URL(request.url).searchParams.get("date") ?? "";
	const start = reservationDateStart(date);
	if (!start) return NextResponse.json({ error: "Choose a valid event date." }, { status: 400 });

	const today = reservationDateStart(getReservationDateParts(new Date()).date)!;
	if (start < today || start.getTime() - today.getTime() > 90 * 24 * 60 * 60 * 1000) {
		return NextResponse.json({ error: "Events can be requested for the next 90 days." }, { status: 400 });
	}

	const bookings = await prisma.cateringEnquiry.findMany({
		where: {
			eventDate: { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) },
			status: { not: "CANCELLED" },
		},
		select: { eventDate: true },
	});
	const counts = new Map<string, number>();
	for (const booking of bookings) {
		if (!booking.eventDate) continue;
		const slot = getReservationDateParts(booking.eventDate).time;
		counts.set(slot, (counts.get(slot) ?? 0) + 1);
	}

	return NextResponse.json({
		date,
		slots: eventSlotTimes.map((time) => {
			const slotStart = new Date(`${date}T${time}:00+05:30`);
			const booked = counts.get(time) ?? 0;
			return {
				time,
				startsAt: slotStart.toISOString(),
					endsAt: new Date(slotStart.getTime() + eventSlotDurationMilliseconds).toISOString(),
					booked,
					capacity: eventSlotCapacity,
					available: slotStart.getTime() >= Date.now() + 60 * 60 * 1000 && booked < eventSlotCapacity,
				};
			}),
	});
}