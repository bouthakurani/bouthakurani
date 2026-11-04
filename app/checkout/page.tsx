import CheckoutForm from "@/components/CheckoutForm";
import StoreHeader from "@/components/StoreHeader";
import { getCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
	const customer = await getCustomerSession();
	if (!customer) redirect("/account/login?next=%2Fcheckout");
	return <><StoreHeader /><CheckoutForm customer={customer} /></>;
}