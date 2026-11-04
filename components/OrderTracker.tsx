"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Circle, Clock3, PackageCheck, Truck } from "lucide-react";

type TrackedOrder = {
	id: string;
	orderNumber: string;
	status: string;
	paymentStatus: string;
	scheduledAt: string | null;
	createdAt: string;
	total: number;
	items: { id: string; itemName: string; quantity: number }[];
};

const steps = [
	{ status: "NEW", label: "Order placed", Icon: Circle },
	{ status: "CONFIRMED", label: "Confirmed", Icon: Check },
	{ status: "PREPARING", label: "Being prepared", Icon: Clock3 },
	{ status: "READY", label: "Ready for dispatch", Icon: PackageCheck },
	{ status: "OUT_FOR_DELIVERY", label: "On the way", Icon: Truck },
	{ status: "COMPLETED", label: "Delivered", Icon: Check },
];

function formatTime(value: string | null) {
	if (!value) return "Not scheduled";
	return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export default function OrderTracker({ initialOrder }: { initialOrder: TrackedOrder }) {
	const [order, setOrder] = useState(initialOrder);

	useEffect(() => {
		let mounted = true;
		async function refresh() {
			try {
				const response = await fetch(`/api/customer/orders/${encodeURIComponent(order.id)}`, { cache: "no-store" });
				if (!response.ok) return;
				const result = await response.json();
				if (mounted) setOrder((current) => ({ ...current, status: result.status, paymentStatus: result.paymentStatus }));
			} catch {
				return;
			}
		}

		const timer = window.setInterval(refresh, 15000);
		return () => { mounted = false; window.clearInterval(timer); };
	}, [order.id]);

	const currentStep = steps.findIndex((step) => step.status === order.status);
	return <main className="container public-page order-tracker-page">
		<Link href="/account/orders" className="back-link"><ArrowLeft size={16} aria-hidden="true" />My orders</Link>
		<div className="public-page-heading"><span className="eyebrow">ORDER {order.orderNumber}</span><h1>{order.status === "CANCELLED" ? "Order cancelled" : "Order progress"}</h1><p className="muted">Scheduled delivery: {formatTime(order.scheduledAt)}</p></div>
		<section className="card order-tracker-card" aria-live="polite">
			<div className="order-tracker-header"><div><span className="muted">Payment</span><strong>{order.paymentStatus}</strong></div><div><span className="muted">Total</span><strong>₹{Number(order.total).toFixed(2)}</strong></div></div>
			{order.status === "CANCELLED" ? <p>This order was cancelled. Contact the restaurant if you need help.</p> : <ol className="order-progress-list">
				{steps.map(({ status, label, Icon }, index) => <li className={index < currentStep ? "complete" : index === currentStep ? "current" : ""} key={status}>
					<span className="order-progress-icon"><Icon size={17} aria-hidden="true" /></span><span>{label}</span>{index < currentStep && <span className="sr-only">Completed</span>}
				</li>)}
			</ol>}
			<p className="order-tracker-note">Status is updated by the restaurant team. Live courier GPS is not available in this app.</p>
			<div className="order-tracker-items"><h2>Items</h2>{order.items.map((item) => <div key={item.id}><span>{item.quantity} × {item.itemName}</span></div>)}</div>
		</section>
	</main>;
}