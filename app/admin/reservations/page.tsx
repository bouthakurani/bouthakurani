import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function addOnNames(value: Prisma.JsonValue | null) {
	if (!Array.isArray(value)) return "—";
	const names = value.map((entry) => {
		if (typeof entry !== "object" || !entry || Array.isArray(entry) || !("name" in entry)) return "";
		return String(entry.name);
	}).filter(Boolean);
	return names.join(", ") || "—";
}

export default async function Reservations() {
	const rows = await prisma.reservation.findMany({ orderBy: { bookingAt: "asc" }, take: 200 });
	return <>
		<h1 style={{ fontSize: 30 }}>Reservations</h1>
		<p className="muted">Manage table requests, hourly slots and selected food add-ons.</p>
		<div className="tablewrap"><table>
			<thead><tr><th>Guest</th><th>Phone</th><th>Guests</th><th>Date &amp; Time</th><th>Add-ons</th><th>Status</th><th>Notes</th></tr></thead>
			<tbody>{rows.map((reservation) => <tr key={reservation.id}>
				<td>{reservation.name}</td><td>{reservation.phone}</td><td>{reservation.guests}</td>
				<td>{reservation.bookingAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
				<td>{addOnNames(reservation.addOns)}</td><td>{reservation.status}</td><td>{reservation.notes || "—"}</td>
			</tr>)}{!rows.length && <tr><td colSpan={7}>No reservations yet.</td></tr>}</tbody>
		</table></div>
	</>;
}