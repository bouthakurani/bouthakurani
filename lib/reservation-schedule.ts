export const reservationTimeZone = "Asia/Kolkata";
export const reservationSlotCapacity = 8;
export const reservationSlotTimes = Array.from({ length: 10 }, (_, index) => `${String(index + 12).padStart(2, "0")}:00`);
export const eventSlotCapacity = 1;
export const eventSlotDurationMilliseconds = 4 * 60 * 60 * 1000;
export const eventSlotTimes = ["10:00", "14:00", "18:00"];

export function reservationDateStart(date: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
	const start = new Date(`${date}T00:00:00+05:30`);
	return Number.isNaN(start.getTime()) || getReservationDateParts(start).date !== date ? null : start;
}

export function getReservationDateParts(value: Date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: reservationTimeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(value);
	const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
	return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}

export function getReservationSlotStart(bookingAt: Date) {
	const { date, time } = getReservationDateParts(bookingAt);
	if (!reservationSlotTimes.includes(time)) return null;
	return new Date(`${date}T${time}:00+05:30`);
}

export function getEventSlotStart(eventDate: Date) {
	const { date, time } = getReservationDateParts(eventDate);
	if (!eventSlotTimes.includes(time)) return null;
	return new Date(`${date}T${time}:00+05:30`);
}