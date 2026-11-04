"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Category = { id: string; name: string; sortOrder: number; active: boolean; itemCount: number };

export default function MenuCategoryAdmin({ categories }: { categories: Category[] }) {
	const router = useRouter();
	const [editing, setEditing] = useState<Category | null>(null);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch(editing ? `/api/menu/categories/${encodeURIComponent(editing.id)}` : "/api/menu/categories", {
				method: editing ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not save this category.");
				return;
			}

			setEditing(null);
			setMessage(editing ? "Category updated." : "Category added.");
			router.refresh();
		} catch {
			setMessage("Could not connect to save this category.");
		} finally {
			setBusy(false);
		}
	}

	async function updateCategory(category: Category, changes: Partial<Pick<Category, "active">>) {
		setBusy(true);
		setMessage("");

		try {
			const response = await fetch(`/api/menu/categories/${encodeURIComponent(category.id)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...category, ...changes }),
			});
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not update this category.");
				return;
			}

			setMessage(changes.active === undefined ? "Category updated." : changes.active ? "Category is visible in the menu." : "Category is hidden from the menu.");
			router.refresh();
		} catch {
			setMessage("Could not connect to update this category.");
		} finally {
			setBusy(false);
		}
	}

	async function remove(category: Category) {
		if (category.itemCount > 0) {
			setMessage(`Move or delete the ${category.itemCount} menu items in ${category.name} before deleting the category.`);
			return;
		}
		if (!window.confirm(`Delete the empty ${category.name} category?`)) return;

		setBusy(true);
		setMessage("");
		try {
			const response = await fetch(`/api/menu/categories/${encodeURIComponent(category.id)}`, { method: "DELETE" });
			const result = await response.json();
			if (!response.ok) {
				setMessage(result.error || "Could not delete this category.");
				return;
			}

			setMessage("Category deleted.");
			router.refresh();
		} catch {
			setMessage("Could not connect to delete this category.");
		} finally {
			setBusy(false);
		}
	}

	return <section className="category-admin-section" aria-labelledby="category-admin-title">
		<div className="category-admin-heading">
			<div><h2 id="category-admin-title">Menu categories</h2><p className="muted">Hidden categories and their items stay in admin, but do not appear publicly. Move or delete items before deleting a category.</p></div>
			<span className="category-admin-count">{categories.filter((category) => category.active).length} visible / {categories.length} total</span>
		</div>

		<form key={editing?.id ?? "new-category"} className="card category-admin-form" onSubmit={save}>
			<label>Category name<input className="field" name="name" defaultValue={editing?.name ?? ""} placeholder="e.g. Seasonal Specials" maxLength={60} required /></label>
			<label>Display order<input className="field" name="sortOrder" type="number" min="0" step="1" defaultValue={editing?.sortOrder ?? categories.length} required /></label>
			<div className="category-admin-form-actions">
				<button className="btn gold form-submit" type="submit" disabled={busy}>
					{busy ? <LoaderCircle className="icon-spin" size={17} aria-hidden="true" /> : editing ? <Save size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
					{editing ? "Save category" : "Add category"}
				</button>
				{editing && <button className="btn light form-submit" type="button" onClick={() => setEditing(null)}><X size={17} aria-hidden="true" />Cancel</button>}
			</div>
			{message && <p className="muted category-admin-message" role="status">{message}</p>}
		</form>

		<div className="category-admin-list">
			{categories.map((category) => <article className="category-admin-row" key={category.id}>
				<div className="category-admin-info"><strong>{category.name}</strong><span>{category.itemCount} items · {category.active ? "Visible" : "Hidden"}</span></div>
				<div className="category-admin-actions">
					<button className="admin-icon-button" type="button" title={`Edit ${category.name}`} aria-label={`Edit ${category.name}`} disabled={busy} onClick={() => { setMessage(""); setEditing(category); }}><Pencil size={17} aria-hidden="true" /></button>
					<button className="admin-icon-button" type="button" title={category.active ? `Hide ${category.name}` : `Show ${category.name}`} aria-label={category.active ? `Hide ${category.name}` : `Show ${category.name}`} disabled={busy} onClick={() => updateCategory(category, { active: !category.active })}>{category.active ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button>
					<button className="admin-icon-button danger" type="button" title={`Delete ${category.name}`} aria-label={`Delete ${category.name}`} disabled={busy || category.itemCount > 0} onClick={() => remove(category)}><Trash2 size={17} aria-hidden="true" /></button>
				</div>
			</article>)}
		</div>
	</section>;
}