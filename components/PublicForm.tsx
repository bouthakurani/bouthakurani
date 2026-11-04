"use client";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";

export default function PublicForm({ endpoint, kind }: { endpoint: string; kind: "reservation" | "catering" }) {
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const data = Object.fromEntries(new FormData(form).entries());
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

			setMessage("Thank you! Your request has been received. Our team will contact you.");
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
				<label>Booking date and time<input className="field" type="datetime-local" name="bookingAt" required /></label>
				<label>Number of guests<input className="field" type="number" min="1" name="guests" required /></label>
			</> : <>
				<label>Event type<select className="field" name="eventType"><option>Wedding</option><option>Birthday</option><option>Corporate Event</option><option>Anniversary</option><option>Private Party</option><option>Other</option></select></label>
				<label>Event date<input className="field" type="date" name="eventDate" /></label>
				<label>Number of guests<input className="field" type="number" min="1" name="guests" required /></label>
				<label>Event location<input className="field" name="location" autoComplete="street-address" /></label>
			</>}
			<label>Additional notes<textarea className="field" name="notes" rows={3} /></label>
			{message && <p role="status" className="muted">{message}</p>}
			<button className="btn gold form-submit" type="submit" disabled={busy} aria-busy={busy}>
				{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
				{busy ? "Sending request" : "Submit request"}
			</button>
		</form>
	);
}