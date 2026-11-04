"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarClock, CreditCard, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/CartProvider";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
	key: string;
	amount: number;
	currency: string;
	name: string;
	description: string;
	order_id: string;
	prefill: { name: string; email: string; contact: string };
	theme: { color: string };
	modal: { ondismiss: () => void };
	handler: (response: RazorpaySuccess) => void;
};
type RazorpayInstance = {
	open: () => void;
	on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
	interface Window {
		Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
	}
}

function localDateTime(date: Date) {
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function loadRazorpay() {
	if (window.Razorpay) return Promise.resolve(true);
	return new Promise<boolean>((resolve) => {
		const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay-checkout]");
		const script = existing ?? document.createElement("script");
		script.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
		script.addEventListener("error", () => resolve(false), { once: true });
		if (!existing) {
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.async = true;
			script.dataset.razorpayCheckout = "true";
			document.body.appendChild(script);
		}
	});
}

export default function CheckoutForm() {
	const router = useRouter();
	const { items, subtotal, clearCart } = useCart();
	const [scheduledAt, setScheduledAt] = useState("");
	const [minimumScheduledAt, setMinimumScheduledAt] = useState("");
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);
	const [confirmedOrder, setConfirmedOrder] = useState("");

	useEffect(() => {
		const earliest = new Date(Date.now() + 60 * 60 * 1000);
		earliest.setMinutes(Math.ceil(earliest.getMinutes() / 15) * 15, 0, 0);
		const minimum = localDateTime(earliest);
		setMinimumScheduledAt(minimum);
		setScheduledAt(minimum);
	}, []);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!items.length || busy) return;
		setBusy(true);
		setMessage("");

		try {
			const form = new FormData(event.currentTarget);
			const response = await fetch("/api/payments/razorpay/order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					customerName: form.get("customerName"),
					customerPhone: form.get("customerPhone"),
					customerEmail: form.get("customerEmail"),
					deliveryAddress: form.get("deliveryAddress"),
					scheduledAt,
					notes: form.get("notes"),
					items: items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
				}),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not start checkout.");
				setBusy(false);
				return;
			}

			if (!await loadRazorpay() || !window.Razorpay) {
				setMessage("Secure payment could not load. Check your connection and try again.");
				setBusy(false);
				return;
			}

			const razorpay = new window.Razorpay({
				key: result.keyId,
				amount: result.amount,
				currency: result.currency,
				name: "Bouthakurani",
				description: `Delivery order ${result.orderNumber}`,
				order_id: result.razorpayOrderId,
				prefill: {
					name: String(form.get("customerName")),
					email: String(form.get("customerEmail") ?? ""),
					contact: String(form.get("customerPhone")),
				},
				theme: { color: "#f45b24" },
				modal: { ondismiss: () => setBusy(false) },
				handler: async (payment) => {
					try {
						const verification = await fetch("/api/payments/razorpay/verify", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(payment),
						});
						const verificationResult = await verification.json();
						if (!verification.ok) {
							setMessage(verificationResult.error || "Payment verification failed. Contact the restaurant with your payment reference.");
							return;
						}

						clearCart();
						setConfirmedOrder(verificationResult.orderNumber);
					} catch {
						setMessage("Payment was received, but confirmation could not be checked. Contact the restaurant with your payment reference.");
					} finally {
						setBusy(false);
					}
				},
			});
			razorpay.on("payment.failed", (failure) => {
				setMessage(failure.error?.description || "Payment did not complete. Please try again.");
				setBusy(false);
			});
			razorpay.open();
		} catch {
			setMessage("We could not connect to checkout. Please try again.");
			setBusy(false);
		}
	}

	if (confirmedOrder) return <main className="container public-page checkout-page">
		<section className="card checkout-success"><ShieldCheck size={34} aria-hidden="true" /><h1>Order confirmed</h1><p>Your payment was verified. Order <strong>{confirmedOrder}</strong> is scheduled for delivery.</p><Link className="btn gold form-submit" href="/menu">Continue browsing</Link></section>
	</main>;

	return <main className="container public-page checkout-page">
		<Link href="/cart" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to cart</Link>
		<div className="public-page-heading"><span className="eyebrow"><CreditCard size={14} aria-hidden="true" /> SECURE CHECKOUT</span><h1>Delivery details</h1><p className="muted">Choose where and when your order should arrive.</p></div>
		{items.length === 0 ? <section className="card checkout-empty"><p className="muted">Your cart is empty.</p><Link href="/menu" className="btn gold form-submit">Explore the menu</Link></section> : <div className="checkout-layout">
			<form className="card checkout-form" onSubmit={submit}>
				<label>Name<input className="field" name="customerName" autoComplete="name" maxLength={100} required /></label>
				<label>Mobile number<input className="field" name="customerPhone" type="tel" autoComplete="tel" maxLength={24} required /></label>
				<label>Email (optional)<input className="field" name="customerEmail" type="email" autoComplete="email" maxLength={254} /></label>
				<label>Delivery address<textarea className="field" name="deliveryAddress" autoComplete="street-address" rows={3} maxLength={500} required /></label>
				<label>Delivery date and time<input className="field" name="scheduledAt" type="datetime-local" min={minimumScheduledAt} value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required /></label>
				<label>Delivery notes (optional)<textarea className="field" name="notes" rows={2} maxLength={500} placeholder="Gate, floor or delivery instructions" /></label>
				{message && <p className="checkout-message" role="alert">{message}</p>}
				<button className="btn gold form-submit checkout-submit" type="submit" disabled={busy || items.length === 0} aria-busy={busy}>
					{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : <CreditCard size={17} aria-hidden="true" />}
					{busy ? "Preparing secure payment" : "Pay securely with Razorpay"}
				</button>
				<p className="checkout-security"><ShieldCheck size={15} aria-hidden="true" />Payment is processed securely by Razorpay.</p>
			</form>
			<aside className="cart-summary checkout-summary">
				<h2>Order summary</h2>
				{items.map((item) => <div className="checkout-summary-item" key={item.menuItemId}><span>{item.quantity} × {item.name}</span><strong>₹{(item.price * item.quantity).toFixed(2)}</strong></div>)}
				<div className="cart-summary-total"><span>Items subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
				<div className="checkout-time-note"><CalendarClock size={16} aria-hidden="true" /><span>Delivery scheduled for the selected time</span></div>
				<div className="checkout-time-note"><MapPin size={16} aria-hidden="true" /><span>Delivery fee is not configured; payment covers the item subtotal only.</span></div>
			</aside>
		</div>}
	</main>;
}