"use client";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";

type AddOnItem = { id: string; name: string; category: string; price: number };
type ReservationSlot = { time: string; startsAt: string; booked: number; capacity: number; available: boolean };

function businessDate() {
	const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
	const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
	return `${part("year")}-${part("month")}-${part("day")}`;
}

export default function PublicForm({ endpoint, kind, addOnItems = [] }: { endpoint: string; kind: "reservation" | "catering"; addOnItems?: AddOnItem[] }) {
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);
	const [today] = useState(businessDate);
	const [bookingDate, setBookingDate] = useState(businessDate);
	const [bookingTime, setBookingTime] = useState("");
	const [slots, setSlots] = useState<ReservationSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [slotError, setSlotError] = useState("");

	useEffect(() => {
		loadSlots(bookingDate);
	}, [kind, bookingDate]);

	function loadSlots(date: string) {
		setSlotsLoading(true);
		setSlotError("");
		setSlots([]);
		setBookingTime("");
		const availabilityEndpoint = kind === "reservation" ? "/api/reservations/availability" : "/api/catering/availability";
		fetch(`${availabilityEndpoint}?date=${encodeURIComponent(date)}`)
			.then(async (response) => {
				const result = await response.json();
				if (!response.ok) throw new Error(result.error || "Could not load time slots.");
				setSlots(result.slots);
				setBookingTime(result.slots.find((slot: ReservationSlot) => slot.available)?.time ?? "");
			})
			.catch((error: unknown) => setSlotError(error instanceof Error ? error.message : "Could not load time slots."))
			.finally(() => setSlotsLoading(false));
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const formData = new FormData(form);
			const data: Record<string, FormDataEntryValue | string[]> = Object.fromEntries(formData.entries());
			data.addOnIds = formData.getAll("addOns").map(String);
			delete data.addOns;
			delete data.bookingDate;
			delete data.bookingTime;
			if (kind === "reservation") {
				data.bookingAt = new Date(`${bookingDate}T${bookingTime}:00+05:30`).toISOString();
			} else {
				data.eventDate = new Date(`${bookingDate}T${bookingTime}:00+05:30`).toISOString();
				data.eventExtras = formData.getAll("eventExtras").map(String);
				delete data.eventExtras;
			}
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await response.json();

			if (!response.ok) {
				setMessage(result.error || "Please try again.");
				return;
			}

			setMessage(kind === "reservation" ? "Your table request has been received. We’ll confirm your selected slot shortly." : "Your event enquiry has been received. Our team will contact you about the menu and extras.");
			form.reset();
		} catch {
			setMessage("We could not send your request. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form className="card public-form" onSubmit={submit}>
			<label>Name<input className="field" name="name" autoComplete="name" required /></label>
			<label>Mobile number<input className="field" name="phone" type="tel" autoComplete="tel" required /></label>
			<label>Email (optional)<input className="field" name="email" type="email" autoComplete="email" /></label>
			{kind === "reservation" ? <>
				<label>Booking date<input className="field" type="date" name="bookingDate" min={today} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required /></label>
				<label>Available time slot<select className="field" name="bookingTime" value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} disabled={slotsLoading || !slots.some((slot) => slot.available)} required><option value="">{slotsLoading ? "Loading available slots…" : "Choose a time"}</option>{slots.map((slot) => <option value={slot.time} key={slot.time} disabled={!slot.available}>{slot.time} · {slot.available ? `${slot.capacity - slot.booked} tables left` : "Fully booked"}</option>)}</select></label>
				{slotError && <p className="public-form-error" role="alert">{slotError}</p>}
				<label>Number of guests<input className="field" type="number" min="1" name="guests" required /></label>
			</> : <>
				<label>Event type<select className="field" name="eventType"><option>Wedding</option><option>Birthday</option><option>Corporate Event</option><option>Anniversary</option><option>Private Party</option><option>Other</option></select></label>
				<label>Event date<input className="field" type="date" name="bookingDate" min={today} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required /></label>
				<label>Available event start (4-hour block)<select className="field" name="bookingTime" value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} disabled={slotsLoading || !slots.some((slot) => slot.available)} required><option value="">{slotsLoading ? "Loading available slots…" : "Choose a time"}</option>{slots.map((slot) => <option value={slot.time} key={slot.time} disabled={!slot.available}>{slot.time} · {slot.available ? "Available" : "Booked"}</option>)}</select></label>
				{slotError && <p className="public-form-error" role="alert">{slotError}</p>}
				<label>Number of guests<input className="field" type="number" min="1" name="guests" required /></label>
				<label>Event location<input className="field" name="location" autoComplete="street-address" maxLength={300} required /></label>
				<fieldset className="booking-addon-group"><legend>Entertainment add-ons</legend><p className="booking-addon-help">Availability and final pricing will be confirmed by the events team.</p><label className="booking-addon-option"><input type="checkbox" name="eventExtras" value="DJ" /><span>DJ</span></label><label className="booking-addon-option"><input type="checkbox" name="eventExtras" value="Live music" /><span>Live music</span></label></fieldset>
			</>}
			<fieldset className="booking-addon-group"><legend>{kind === "reservation" ? "Food and drink add-ons" : "Food, drink and dessert add-ons"}</legend><p className="booking-addon-help">Selected dishes are requests; our team will confirm availability and the final booking total.</p>{addOnItems.length ? addOnItems.map((item) => <label className="booking-addon-option" key={item.id}><input type="checkbox" name="addOns" value={item.id} /><span>{item.name}<small>{item.category}</small></span><strong>₹{item.price.toFixed(2)}</strong></label>) : <p className="muted booking-addon-empty">Menu add-ons will appear here once they have an active price.</p>}</fieldset>
			<label>Additional notes<textarea className="field" name="notes" rows={3} /></label>
			{message && <p role="status" className="muted">{message}</p>}
			<button className="btn gold form-submit" type="submit" disabled={busy} aria-busy={busy}>
				{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
				{busy ? "Sending request" : "Submit request"}
			</button>
		</form>
	);
}