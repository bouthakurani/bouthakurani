"use client";

import { useState } from "react";

const statuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];

export default function AdminOrderStatus({ orderId, status }: { orderId: string; status: string }) {
	const [currentStatus, setCurrentStatus] = useState(status);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function update(nextStatus: string) {
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus }),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not update.");
				return;
			}
			setCurrentStatus(result.status);
		} catch {
			setMessage("Could not connect.");
		} finally {
			setBusy(false);
		}
	}

	return <span className="admin-order-status-control">
		<select className="field" aria-label="Order status" value={currentStatus} disabled={busy} onChange={(event) => update(event.target.value)}>
			{statuses.map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}
		</select>
		{message && <small role="alert">{message}</small>}
	</span>;
}