import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Bouthakurani | Restaurant & Hospitality", description: "Bouthakurani restaurant ordering, reservations and catering." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }