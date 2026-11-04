import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function addOnSummary(value: Prisma.JsonValue | null) {
	if (typeof value !== "object" || !value || Array.isArray(value)) return "—";
	const details = value as Prisma.JsonObject;
	const menuItems = Array.isArray(details.menuItems) ? details.menuItems.map((item) => {
		if (typeof item !== "object" || !item || Array.isArray(item) || !("name" in item)) return "";
		return String(item.name);
	}).filter(Boolean) : [];
	const entertainment = Array.isArray(details.entertainment) ? details.entertainment.filter((item): item is string => typeof item === "string") : [];
	return [...menuItems, ...entertainment].join(", ") || "—";
}

export default async function Catering() {
	const rows = await prisma.cateringEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
	return <>
		<h1 style={{ fontSize: 30 }}>Catering CRM</h1>
		<p className="muted">Manage event enquiries, food add-ons and entertainment requests.</p>
		<div className="tablewrap"><table>
			<thead><tr><th>Name</th><th>Phone</th><th>Event</th><th>Date &amp; Time</th><th>Guests</th><th>Location</th><th>Add-ons</th><th>Status</th></tr></thead>
			<tbody>{rows.map((enquiry) => <tr key={enquiry.id}>
				<td>{enquiry.name}</td><td>{enquiry.phone}</td><td>{enquiry.eventType}</td>
				<td>{enquiry.eventDate?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) || "—"}</td>
				<td>{enquiry.guests}</td><td>{enquiry.location || "—"}</td><td>{addOnSummary(enquiry.addOns)}</td><td>{enquiry.status}</td>
			</tr>)}{!rows.length && <tr><td colSpan={8}>No catering enquiries yet.</td></tr>}</tbody>
		</table></div>
	</>;
}