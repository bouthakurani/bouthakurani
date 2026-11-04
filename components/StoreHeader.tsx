"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Heart,
  House,
  LayoutGrid,
  MapPin,
  Menu,
  PartyPopper,
  Search,
  ShoppingBag,
  Utensils,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";

const navigation = [
  { href: "/menu", label: "Order Food", Icon: Utensils },
  { href: "/reserve", label: "Book a Table", Icon: CalendarDays },
  { href: "/catering", label: "Catering", Icon: PartyPopper },
  { href: "/reviews", label: "Reviews", Icon: ArrowUpRight },
];

const locationStorageKey = "bouthakurani-delivery-location";

export default function StoreHeader({ showSearch = false, searchQuery = "" }: { showSearch?: boolean; searchQuery?: string }) {
  const { itemCount } = useCart();
  const [location, setLocation] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setLocation(window.localStorage.getItem(locationStorageKey) ?? "");
  }, []);

  useEffect(() => {
    fetch("/api/customer/auth/session").then((response) => response.json()).then((result) => {
      setCustomerName(typeof result.customer?.name === "string" ? result.customer.name : "");
    }).catch(() => setCustomerName(""));
  }, []);

  useEffect(() => {
    if (!locationOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLocationOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [locationOpen]);

  function openLocationPicker() {
    setLocationDraft(location);
    setMobileMenuOpen(false);
    setLocationOpen(true);
  }

  function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLocation = locationDraft.trim();
    if (nextLocation.length < 3) return;

    window.localStorage.setItem(locationStorageKey, nextLocation);
    setLocation(nextLocation);
    setLocationOpen(false);
  }

  function clearLocation() {
    window.localStorage.removeItem(locationStorageKey);
    setLocation("");
    setLocationDraft("");
  }

  return (
    <header className="store-header">
      <div className={`container header-inner${showSearch ? " search-header-inner" : ""}`}>
        <Link href="/" className="brand" aria-label="Bouthakurani home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span><strong>BOUTHAKURANI</strong><small>FOOD · PEOPLE · MOMENTS</small></span>
        </Link>

        {!showSearch && <button
          className="delivery-location"
          type="button"
          onClick={openLocationPicker}
          aria-haspopup="dialog"
          aria-expanded={locationOpen}
        >
          <MapPin className="location-pin" size={20} aria-hidden="true" />
          <span className="location-copy"><b>Delivering to</b><small>{location || "Choose your location"}</small></span>
          <ChevronDown className="chevron" size={17} aria-hidden="true" />
        </button>}

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ href, label }) => <Link href={href} key={href}>{label}</Link>)}
        </nav>

        <div className="header-actions">
          <Link href={customerName ? "/account" : "/account/login"} className="signin-link">{customerName || "Sign in"}</Link>
          <Link href="/cart" className="cart-link" aria-label={`Shopping bag, ${itemCount} items`}>
            <ShoppingBag size={18} aria-hidden="true" /><span>Bag</span><span className="cart-count">{itemCount}</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation">
          {navigation.map(({ href, label, Icon }) => (
            <Link href={href} key={href} onClick={() => setMobileMenuOpen(false)}>
              <Icon size={18} aria-hidden="true" />{label}<ArrowUpRight className="mobile-nav-arrow" size={16} aria-hidden="true" />
            </Link>
          ))}
          <Link href={customerName ? "/account" : "/account/login"} onClick={() => setMobileMenuOpen(false)}>
							<UserRound size={18} aria-hidden="true" />{customerName || "Sign in"}<ArrowUpRight className="mobile-nav-arrow" size={16} aria-hidden="true" />
          </Link>
        </nav>
      )}

      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {[
          { href: "/", label: "Home", Icon: House },
          { href: "/menu", label: "Menu", Icon: LayoutGrid },
          { href: "/cart", label: "Cart", Icon: ShoppingBag },
          { href: "/reserve", label: "Reserve", Icon: CalendarDays },
          { href: "/catering", label: "Catering", Icon: PartyPopper },
        ].map(({ href, label, Icon }) => (
          <Link href={href} key={href} title={label} aria-label={label} aria-current={pathname === href || (href === "/cart" && pathname === "/checkout") ? "page" : undefined}>
            <Icon size={20} strokeWidth={pathname === href ? 2.4 : 1.8} aria-hidden="true" />
          </Link>
        ))}
      </nav>

      {showSearch && <section className="delivery-search-band">
        <div className="container delivery-search-inner">
          <h1>Good food for every kind of gathering.</h1>
          <form action="/menu" method="get" className="delivery-search-form">
            <button
              className="delivery-search-location"
              type="button"
              onClick={openLocationPicker}
              aria-haspopup="dialog"
              aria-expanded={locationOpen}
            >
              <MapPin size={22} aria-hidden="true" />
              <span>{location || "Enter your delivery location"}</span>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <label className="menu-search-field">
              <span className="sr-only">Search the menu</span>
              <input type="search" name="q" defaultValue={searchQuery} placeholder="Search for a dish, drink or dessert" />
              <button type="submit" aria-label="Search menu"><Search size={22} aria-hidden="true" /></button>
            </label>
          </form>
        </div>
      </section>}

      {locationOpen && createPortal(
        <div className="location-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setLocationOpen(false);
        }}>
          <section className="location-dialog" role="dialog" aria-modal="true" aria-labelledby="location-title">
            <div className="location-dialog-top">
              <span className="location-dialog-icon"><MapPin size={21} aria-hidden="true" /></span>
              <button className="location-dialog-close" type="button" onClick={() => setLocationOpen(false)} aria-label="Close location picker">
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <h2 id="location-title">Choose your location</h2>
            <p>Enter your area or PIN code to set your delivery destination.</p>
            <form onSubmit={saveLocation}>
              <label htmlFor="delivery-location-input">Area or PIN code</label>
              <input
                id="delivery-location-input"
                className="field"
                type="text"
                autoFocus
                autoComplete="address-level2"
                maxLength={80}
                minLength={3}
                placeholder="Enter a city, area or PIN code"
                value={locationDraft}
                onChange={(event) => setLocationDraft(event.target.value)}
                required
              />
              <button className="location-submit" type="submit" disabled={locationDraft.trim().length < 3}>
                <MapPin size={17} aria-hidden="true" />Set delivery location
              </button>
            </form>
            {location && <button className="location-clear" type="button" onClick={clearLocation}>Remove saved location</button>}
          </section>
        </div>,
        document.body,
      )}
    </header>
  );
}