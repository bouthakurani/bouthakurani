import StoreHeader from "@/components/StoreHeader";
import CustomerAuthForm from "@/components/CustomerAuthForm";
import { getCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

type PageProps = { searchParams: Promise<{ next?: string | string[] }> };

export default async function CustomerLoginPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
	const nextPath = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
	if (await getCustomerSession()) redirect(nextPath);

	return <>
		<StoreHeader />
		<main className="container public-page customer-auth-page">
			<div className="public-page-heading"><span className="eyebrow">WELCOME BACK</span><h1>Customer sign in</h1><p className="muted">Sign in to continue to your order.</p></div>
			<CustomerAuthForm mode="login" nextPath={nextPath} />
		</main>
	</>;
}