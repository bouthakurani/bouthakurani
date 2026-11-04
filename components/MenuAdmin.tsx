"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type MenuCategory = { id: string; name: string };
type MenuItem = {
	id: string;
	name: string;
	description: string | null;
	imageUrl: string | null;
	price: number;
	isVeg: boolean;
	available: boolean;
	category: MenuCategory;
};

export default function MenuAdmin({ items, categories }: { items: MenuItem[]; categories: MenuCategory[] }) {
	const router = useRouter();
	const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch(editingItem ? `/api/menu/${encodeURIComponent(editingItem.id)}` : "/api/menu", {
				method: editingItem ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not save this menu item.");
				return;
			}

			form.reset();
			setEditingItem(null);
			setMessage(editingItem ? "Menu item updated." : "Menu item added.");
			router.refresh();
		} catch {
			setMessage("Could not connect to save this menu item.");
		} finally {
			setBusy(false);
		}
	}

	async function remove(item: MenuItem) {
		if (!window.confirm(`Delete ${item.name} from the menu?`)) return;
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch(`/api/menu/${encodeURIComponent(item.id)}`, { method: "DELETE" });
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not delete this menu item.");
				return;
			}

			if (editingItem?.id === item.id) setEditingItem(null);
			setMessage(result.archived ? "Item appears in past orders, so it was marked unavailable instead." : "Menu item deleted.");
			router.refresh();
		} catch {
			setMessage("Could not connect to delete this menu item.");
		} finally {
			setBusy(false);
		}
	}

	return <>
		<form key={editingItem?.id ?? "new-menu-item"} className="card admin-menu-form" onSubmit={save}>
			<label>Item name<input className="field" name="name" defaultValue={editingItem?.name ?? ""} required /></label>
			<label>Price (₹)<input className="field" name="price" type="number" step="0.01" min="0" defaultValue={editingItem?.price ?? ""} required /></label>
			<label>Category<select className="field" name="categoryId" defaultValue={editingItem?.category.id ?? ""} required><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
			<label>Description<input className="field" name="description" defaultValue={editingItem?.description ?? ""} /></label>
			<label>Image URL<input className="field" name="imageUrl" type="url" maxLength={2048} defaultValue={editingItem?.imageUrl ?? ""} placeholder="https://..." /></label>
			<label className="admin-veg-field"><input type="checkbox" name="isVeg" value="true" defaultChecked={editingItem?.isVeg ?? false} />Vegetarian</label>
			<label className="admin-veg-field"><input type="checkbox" name="available" value="true" defaultChecked={editingItem?.available ?? true} />Available to order</label>
			<div className="admin-menu-form-actions">
				<button className="btn gold form-submit" type="submit" disabled={busy}>
					{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : editingItem ? <Save size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
					{editingItem ? "Save changes" : "Add menu item"}
				</button>
				{editingItem && <button className="btn light form-submit" type="button" onClick={() => setEditingItem(null)}><X size={17} aria-hidden="true" />Cancel</button>}
			</div>
			{message && <p className="muted admin-menu-message" role="status">{message}</p>}
		</form>

		<div className="admin-menu-grid">
			{items.map((item) => <article className="admin-menu-card" key={item.id}>
				<div className="admin-menu-card-image">
					{item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : <ImageOff size={24} aria-hidden="true" />}
					<span className={item.available ? "admin-item-status" : "admin-item-status unavailable"}>{item.available ? "Available" : "Unavailable"}</span>
				</div>
				<div className="admin-menu-card-content">
					<div className="admin-menu-card-title"><h2>{item.name}</h2><span>{item.isVeg ? "Veg" : "Non-veg"}</span></div>
					<p className="muted">{item.description || "No description added."}</p>
					<div className="admin-menu-card-meta"><span>{item.category.name}</span><strong>{item.price > 0 ? `₹${item.price.toFixed(2)}` : "Price on request"}</strong></div>
					<div className="admin-menu-card-actions">
						<button type="button" className="admin-icon-button" title={`Edit ${item.name}`} aria-label={`Edit ${item.name}`} onClick={() => { setMessage(""); setEditingItem(item); }}><Pencil size={17} aria-hidden="true" /></button>
						<button type="button" className="admin-icon-button danger" title={`Delete ${item.name}`} aria-label={`Delete ${item.name}`} disabled={busy} onClick={() => remove(item)}><Trash2 size={17} aria-hidden="true" /></button>
					</div>
				</div>
			</article>)}
			{!items.length && <p className="muted">No menu items yet. Add the first item above or run the menu seed.</p>}
		</div>
	</>;
}