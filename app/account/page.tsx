import StoreHeader from "@/components/StoreHeader";
import CustomerAccountView from "@/components/CustomerAccountView";
import { getCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function CustomerAccountPage() {
	const customer = await getCustomerSession();
	if (!customer) redirect("/account/login");
	return <><StoreHeader /><CustomerAccountView customer={customer} /></>;
}