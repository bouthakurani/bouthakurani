"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Send, Star } from "lucide-react";

export default function ReviewForm() {
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch("/api/reviews", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
			});
			const result = await response.json();

			if (!response.ok) {
				setMessage(result.error || "Please try again.");
				return;
			}

			setMessage("Thank you! Your review has been submitted for approval.");
			form.reset();
		} catch {
			setMessage("We could not send your review. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form className="card review-form" onSubmit={submit}>
			<h2><Star size={20} aria-hidden="true" />Share your experience</h2>
			<input className="field" name="customerName" placeholder="Your name" autoComplete="name" required />
			<input className="field" name="phone" type="tel" placeholder="Mobile (optional)" autoComplete="tel" />
			<label className="review-rating-label" htmlFor="review-rating">Your rating</label>
			<select className="field" id="review-rating" name="rating" defaultValue="5">
				<option value="5">5 - Excellent</option>
				<option value="4">4 - Very good</option>
				<option value="3">3 - Good</option>
				<option value="2">2 - Fair</option>
				<option value="1">1 - Poor</option>
			</select>
			<textarea className="field" name="message" placeholder="Write your feedback" rows={4} required />
			{message && <p className="muted" role="status">{message}</p>}
			<button className="btn gold form-submit" type="submit" disabled={busy} aria-busy={busy}>
				{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
				{busy ? "Sending review" : "Submit review"}
			</button>
		</form>
	);
}