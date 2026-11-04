import PublicForm from "@/components/PublicForm";
import Link from "next/link";
import { ArrowLeft, PartyPopper } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";

export default function Catering() {
	return <>
		<StoreHeader />
		<main className="container public-page form-page">
			<Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Home</Link>
			<div className="public-page-heading"><span className="eyebrow"><PartyPopper size={14} aria-hidden="true" /> GATHER AROUND THE TABLE</span><h1>Catering Enquiry</h1><p className="muted">Tell us about your event and our catering team will get in touch.</p></div>
			<PublicForm endpoint="/api/catering" kind="catering" />
		</main>
	</>;
}