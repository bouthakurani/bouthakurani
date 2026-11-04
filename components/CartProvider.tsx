"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
	menuItemId: string;
	name: string;
	price: number;
	imageUrl: string | null;
	isVeg: boolean;
	quantity: number;
};

type CartContextValue = {
	items: CartItem[];
	itemCount: number;
	subtotal: number;
	addItem: (item: Omit<CartItem, "quantity">) => void;
	setQuantity: (menuItemId: string, quantity: number) => void;
	removeItem: (menuItemId: string) => void;
	clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "bouthakurani-cart";

export default function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		try {
			const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as CartItem[];
			if (Array.isArray(stored)) {
				setItems(stored.filter((item) => typeof item.menuItemId === "string" && typeof item.price === "number" && item.price > 0 && Number.isInteger(item.quantity) && item.quantity > 0));
			}
		} catch {
			window.localStorage.removeItem(storageKey);
		}
		setReady(true);
	}, []);

	useEffect(() => {
		if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items));
	}, [items, ready]);

	function addItem(item: Omit<CartItem, "quantity">) {
		if (!Number.isFinite(item.price) || item.price <= 0) return;
		setItems((current) => {
			const existing = current.find((entry) => entry.menuItemId === item.menuItemId);
			if (existing) return current.map((entry) => entry.menuItemId === item.menuItemId ? { ...entry, quantity: Math.min(99, entry.quantity + 1) } : entry);
			return [...current, { ...item, quantity: 1 }];
		});
	}

	function setQuantity(menuItemId: string, quantity: number) {
		if (quantity <= 0) {
			removeItem(menuItemId);
			return;
		}
		setItems((current) => current.map((item) => item.menuItemId === menuItemId ? { ...item, quantity: Math.min(99, Math.floor(quantity)) } : item));
	}

	function removeItem(menuItemId: string) {
		setItems((current) => current.filter((item) => item.menuItemId !== menuItemId));
	}

	const value = {
		items,
		itemCount: items.reduce((count, item) => count + item.quantity, 0),
		subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
		addItem,
		setQuantity,
		removeItem,
		clearCart: () => setItems([]),
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const cart = useContext(CartContext);
	if (!cart) throw new Error("useCart must be used within CartProvider.");
	return cart;
}