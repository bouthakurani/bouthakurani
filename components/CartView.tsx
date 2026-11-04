"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function CartView() {
	const { items, subtotal, setQuantity, removeItem } = useCart();

	return <main className="container public-page cart-page">
		<Link href="/menu" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Continue shopping</Link>
		<div className="public-page-heading"><span className="eyebrow"><ShoppingBag size={14} aria-hidden="true" /> YOUR ORDER</span><h1>Your cart</h1><p className="muted">Review your items before choosing a delivery time.</p></div>
		{items.length === 0 ? <section className="card cart-empty">
			<ShoppingBag size={28} aria-hidden="true" />
			<h2>Your cart is empty</h2>
			<p className="muted">Browse the menu and add dishes to get started.</p>
			<Link href="/menu" className="btn gold form-submit">Explore the menu</Link>
		</section> : <div className="cart-layout">
			<div className="cart-items">
				{items.map((item) => <article className="cart-item" key={item.menuItemId}>
					{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span className="cart-item-placeholder"><ShoppingBag size={18} aria-hidden="true" /></span>}
					<div className="cart-item-info"><h2>{item.name}</h2><p>₹{item.price.toFixed(2)} each</p></div>
					<div className="cart-quantity" aria-label={`${item.name} quantity`}>
						<button type="button" title="Decrease quantity" aria-label={`Decrease ${item.name} quantity`} onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}><Minus size={15} aria-hidden="true" /></button>
						<span>{item.quantity}</span>
						<button type="button" title="Increase quantity" aria-label={`Increase ${item.name} quantity`} onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}><Plus size={15} aria-hidden="true" /></button>
					</div>
					<strong className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</strong>
					<button className="cart-remove" type="button" title={`Remove ${item.name}`} aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.menuItemId)}><Trash2 size={17} aria-hidden="true" /></button>
				</article>)}
			</div>
			<aside className="cart-summary">
				<h2>Order summary</h2>
				<div><span>Items ({items.reduce((count, item) => count + item.quantity, 0)})</span><strong>₹{subtotal.toFixed(2)}</strong></div>
				<div><span>Delivery fee</span><span>Not configured</span></div>
				<div className="cart-summary-total"><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
				<Link href="/checkout" className="btn gold form-submit">Choose delivery time</Link>
				<p className="muted">Online payment currently covers the item subtotal only. Delivery charges are not configured in this app.</p>
			</aside>
		</div>}
	</main>;
}