"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, LogOut, MapPin, ShoppingBag, UserRound } from "lucide-react";
import type { CustomerSession } from "@/lib/customer-auth";

export default function CustomerAccountView({ customer }: { customer: CustomerSession }) {
	const router = useRouter();

	async function logout() {
		await fetch("/api/customer/auth/logout", { method: "POST" });
		router.replace("/");
		router.refresh();
	}

	return <main className="container public-page customer-account-page">
		<div className="public-page-heading"><span className="eyebrow"><UserRound size={14} aria-hidden="true" /> CUSTOMER ACCOUNT</span><h1>Hello, {customer.name}</h1><p className="muted">Your customer account is separate from CRM administration.</p></div>
		<section className="card customer-account-details">
			<div><span>Mobile</span><strong>{customer.phone}</strong></div>
			{customer.email && <div><span>Email</span><strong>{customer.email}</strong></div>}
			<div><span>Delivery address</span><strong>{customer.address || "Add an address during checkout"}</strong></div>
		</section>
		<div className="customer-account-actions">
			<Link className="btn gold form-submit" href="/menu"><ShoppingBag size={17} aria-hidden="true" />Browse menu</Link>
			<Link className="btn light form-submit" href="/account/orders"><ClipboardList size={17} aria-hidden="true" />My orders</Link>
			<button className="btn light form-submit" type="button" onClick={logout}><LogOut size={17} aria-hidden="true" />Sign out</button>
			<Link className="customer-account-reserve" href="/reserve"><MapPin size={16} aria-hidden="true" />Reservations are available without signing in</Link>
		</div>
	</main>;
}