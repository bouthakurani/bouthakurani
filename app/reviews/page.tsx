import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";
import StoreHeader from "@/components/StoreHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Reviews() {
	const reviews = await prisma.review.findMany({
		where: { approved: true },
		orderBy: { createdAt: "desc" },
		take: 30,
	}).catch(() => []);

	return <>
		<StoreHeader />
		<main className="container public-page reviews-page">
			<Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Home</Link>
			<div className="public-page-heading"><span className="eyebrow"><Star size={14} aria-hidden="true" /> KIND WORDS, FULL HEARTS</span><h1>Guest Reviews &amp; Feedback</h1><p className="muted">We value your experience. Share your feedback with us.</p></div>
			<ReviewForm />
			<div className="review-list">
				{reviews.map((review) => <article className="card review-card" key={review.id}>
					<div className="review-card-heading"><b>{review.customerName}</b><span className="review-rating" aria-label={`${review.rating} out of 5 stars`}><Star size={16} fill="currentColor" aria-hidden="true" />{review.rating}/5</span></div>
					<p>{review.message}</p>
				</article>)}
			</div>
		</main>
	</>;
}