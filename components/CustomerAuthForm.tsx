"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, LockKeyhole, LogIn, UserPlus } from "lucide-react";

export default function CustomerAuthForm({ mode, nextPath = "/" }: { mode: "login" | "register"; nextPath?: string }) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const destination = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch(`/api/customer/auth/${mode}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not sign in. Please try again.");
				return;
			}
			router.replace(destination);
			router.refresh();
		} catch {
			setMessage("Could not connect. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	return <form className="card customer-auth-form" onSubmit={submit}>
		{mode === "register" && <label>Full name<input className="field" name="name" autoComplete="name" maxLength={100} required /></label>}
		<label>Mobile number<input className="field" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="10–15 digits" maxLength={24} required /></label>
		{mode === "register" && <label>Email (optional)<input className="field" name="email" type="email" autoComplete="email" maxLength={254} /></label>}
		<label>Password<input className="field" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 10 : 1} maxLength={100} required /></label>
		{message && <p className="customer-auth-message" role="alert">{message}</p>}
		<button className="btn gold form-submit" type="submit" disabled={busy} aria-busy={busy}>
			{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : mode === "register" ? <UserPlus size={17} aria-hidden="true" /> : <LogIn size={17} aria-hidden="true" />}
			{busy ? "Please wait" : mode === "register" ? "Create customer account" : "Sign in"}
		</button>
		<p className="customer-auth-switch">{mode === "register" ? <>Already registered? <Link href={`/account/login?next=${encodeURIComponent(destination)}`}>Sign in</Link></> : <>New customer? <Link href={`/account/register?next=${encodeURIComponent(destination)}`}>Create an account</Link></>}</p>
		<p className="customer-auth-note"><LockKeyhole size={14} aria-hidden="true" /> Customer accounts are separate from CRM admin access.</p>
	</form>;
}