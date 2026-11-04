import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

const dishes = [
  { name: "Kolkata Chicken Biryani", desc: "Fragrant basmati, tender chicken and classic Kolkata flavours", price: "₹249", tag: "Bestseller", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=85" },
  { name: "Chicken Reshmi Kebab", desc: "Silky, smoky kebabs with a creamy marinade", price: "₹289", tag: "Chef's pick", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=85" },
  { name: "Crispy Fish Fry", desc: "Golden crumb-coated fish, crisp outside and tender inside", price: "₹229", tag: "Popular", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=85" },
  { name: "Bhetki Paturi", desc: "Bhetki wrapped in banana leaf with mustard and spices", price: "₹329", tag: "Bengali special", image: "https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?w=800&q=85" },
  { name: "Kasha Mangsho", desc: "Slow-cooked mutton in a rich Bengali-style gravy", price: "₹369", tag: "Signature", image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=85" },
  { name: "Basanti Pulao", desc: "Aromatic sweet saffron rice with whole spices", price: "₹199", tag: "Vegetarian", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=85" },
];
const categories = ["All", "Biryani", "Starters", "Kebabs", "Bengali Specials", "Main Course", "Desserts", "Beverages"];

export default async function Home() {
  const categoriesFromDb = await prisma.menuCategory.findMany({ where: { active: true }, include: { items: { where: { available: true, featured: true }, take: 2 } } }).catch(() => []);
  return <main className="storefront">
    <div className="top-strip"><div className="container top-strip-inner"><span>Freshly prepared · Warmly served</span><span>Restaurant · Bar · Catering</span></div></div>
    <header className="store-header"><div className="container header-inner">
      <Link href="/" className="brand"><span className="brand-mark">B</span><span><strong>BOUTHAKURANI</strong><small>FOOD · PEOPLE · MOMENTS</small></span></Link>
      <div className="delivery-location"><span className="location-pin">⌖</span><span><b>Delivering to</b><small>Choose your location</small></span><span className="chevron">⌄</span></div>
      <nav className="desktop-nav"><Link href="/menu">Order Food</Link><Link href="/reserve">Book a Table</Link><Link href="/catering">Catering</Link><Link href="/reviews">Reviews</Link></nav>
      <div className="header-actions"><Link href="/admin/login" className="signin-link">Sign in</Link><Link href="/menu" className="cart-link">Bag <span>0</span></Link><button className="menu-toggle" aria-label="Open menu">☰</button></div>
    </div></header>

    <section className="market-hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow"><i/> GOOD FOOD, GOOD MOOD</span><h1>A little joy<br/>in <em>every bite.</em></h1><p>From much-loved Bengali classics to your favourite comfort food — discover something delicious at Bouthakurani.</p><div className="hero-buttons"><Link className="primary-cta" href="/menu">Explore the menu <span>↗</span></Link><Link className="secondary-cta" href="/reserve">Book a table</Link></div><div className="hero-trust"><span>✦ Carefully prepared</span><span>✦ Made to be shared</span></div></div><div className="hero-visual"><div className="hero-photo"/><div className="hero-sticker"><b>Made with</b><strong>♥</strong><b>for you</b></div><div className="hero-note"><span>OUR SPECIAL</span><b>Kolkata flavours.<br/>A little extra love.</b></div></div></div></section>

    <section className="container quick-links"><Link href="/menu"><span className="quick-icon">♨</span><span><b>Order online</b><small>Food made fresh</small></span><i>↗</i></Link><Link href="/reserve"><span className="quick-icon">▦</span><span><b>Reserve a table</b><small>Your seat is waiting</small></span><i>↗</i></Link><Link href="/catering"><span className="quick-icon">✦</span><span><b>Plan an event</b><small>Let us do the hosting</small></span><i>↗</i></Link></section>

    <section className="container category-section"><div className="section-heading"><div><span className="eyebrow">WHAT ARE YOU CRAVING?</span><h2>Explore our menu</h2></div><Link href="/menu" className="text-link">View full menu <span>→</span></Link></div><div className="category-pills">{categories.map((c,i)=><Link key={c} href="/menu" className={i===0?"category-pill active":"category-pill"}>{c}</Link>)}</div>
      <div className="dish-grid">{dishes.map((d,i)=><article className="dish-card" key={d.name}><Link href="/menu" className="dish-image-wrap"><img src={d.image} alt={d.name}/><span className="dish-tag">{d.tag}</span><span className="add-dish">+</span></Link><div className="dish-info"><div className="dish-title-row"><h3>{d.name}</h3><span className="veg-dot"/></div><p>{d.desc}</p><div className="dish-bottom"><b>{d.price}</b><Link href="/menu">View item</Link></div></div></article>)}</div>
      {categoriesFromDb.length>0&&<div className="db-category-note">Explore {categoriesFromDb.length} menu categories in our full menu.</div>}
    </section>

    <section className="offer-band"><div className="container offer-inner"><div><span className="eyebrow">A GOOD TIME IS ALWAYS ON THE MENU</span><h2>Make room for<br/><em>something special.</em></h2><p>Discover our seasonal favourites, group dining options and thoughtfully curated menus.</p><Link className="offer-button" href="/menu">Discover more <span>↗</span></Link></div><div className="offer-art"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=85" alt="A table filled with delicious food"/><span className="round-seal">GOOD<br/>FOOD<br/>GOOD<br/>MOOD</span></div></div></section>

    <section className="container occasion-section"><div className="section-heading"><div><span className="eyebrow">MORE THAN A MEAL</span><h2>Bring everyone together</h2></div><p>From intimate dinners to big celebrations,<br/>we'll help make it memorable.</p></div><div className="occasion-grid"><Link href="/reserve" className="occasion-card occasion-dining"><span>01 / DINING</span><b>Make it a<br/>dinner date.</b><i>Reserve a table ↗</i></Link><Link href="/catering" className="occasion-card occasion-events"><span>02 / CELEBRATIONS</span><b>Good food for<br/>great gatherings.</b><i>Explore catering ↗</i></Link></div></section>

    <section className="review-band"><div className="container review-inner"><span className="eyebrow">KIND WORDS, FULL HEARTS</span><h2>Every visit is a story.</h2><p>We love being part of your everyday meals and special moments. Have you dined with us?</p><Link href="/reviews" className="secondary-cta">Share your experience</Link></div></section>

    <footer className="store-footer"><div className="container footer-main"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark">B</span><span><strong>BOUTHAKURANI</strong><small>FOOD · PEOPLE · MOMENTS</small></span></Link><p>Good food brings people closer.<br/>Come hungry, leave happy.</p></div><div><b>Explore</b><Link href="/menu">Order Food</Link><Link href="/reserve">Reservations</Link><Link href="/catering">Catering</Link><Link href="/reviews">Reviews</Link></div><div><b>Get in touch</b><a href="tel:+910000000000">Call the restaurant</a><a href="mailto:hello@bouthakurani.in">Email us</a><Link href="/admin/login">Admin login</Link></div><div className="footer-news"><b>Come say hello.</b><p>Follow along for specials, updates and a little food inspiration.</p><Link href="/menu" className="footer-cta">Explore Bouthakurani ↗</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Bouthakurani. All rights reserved.</span><span>Privacy · Terms · Responsible service</span></div></footer>
  </main>;
}
