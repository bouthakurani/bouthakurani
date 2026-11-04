import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import CartProvider from "@/components/CartProvider";
export const metadata: Metadata = { title: "Bouthakurani | Restaurant & Hospitality", description: "Bouthakurani restaurant ordering, reservations and catering." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><CartProvider>{children}</CartProvider></body></html>; }