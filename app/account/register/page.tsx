import StoreHeader from "@/components/StoreHeader";
import CustomerAuthForm from "@/components/CustomerAuthForm";
import { getCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

type PageProps = { searchParams: Promise<{ next?: string | string[] }> };

export default async function CustomerRegisterPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
	const nextPath = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
	if (await getCustomerSession()) redirect(nextPath);

	return <>
		<StoreHeader />
		<main className="container public-page customer-auth-page">
			<div className="public-page-heading"><span className="eyebrow">A PLACE AT THE TABLE</span><h1>Create your account</h1><p className="muted">Sign in before placing an order; reservations and event enquiries remain open.</p></div>
			<CustomerAuthForm mode="register" nextPath={nextPath} />
		</main>
	</>;
}