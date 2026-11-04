import PublicForm from "@/components/PublicForm";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";

export default function Reserve() {
	return <>
		<StoreHeader />
		<main className="container public-page form-page">
			<Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Home</Link>
			<div className="public-page-heading"><span className="eyebrow"><CalendarDays size={14} aria-hidden="true" /> MAKE TIME FOR A GOOD MEAL</span><h1>Reserve a Table</h1><p className="muted">Send your reservation request. Our team will confirm availability.</p></div>
			<PublicForm endpoint="/api/reservations" kind="reservation" />
		</main>
	</>;
}