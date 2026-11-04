"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "@/components/CartProvider";

type MenuProduct = Omit<CartItem, "quantity">;

export default function MenuAddButton({ item }: { item: MenuProduct }) {
	const { addItem } = useCart();
	const [added, setAdded] = useState(false);
	const canOrder = item.price > 0;

	function add() {
		addItem(item);
		setAdded(true);
		window.setTimeout(() => setAdded(false), 1200);
	}

	return <button className="menu-add-button" type="button" onClick={add} disabled={!canOrder} title={canOrder ? `Add ${item.name} to cart` : "Set a price in menu management before ordering"}>
		{added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
		{canOrder ? added ? "Added" : "Add to cart" : "Price needed"}
	</button>;
}