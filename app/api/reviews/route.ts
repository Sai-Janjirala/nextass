import { NextResponse, type NextRequest } from "next/server";
import { getReviewsForContent } from "@/lib/data";
import reviewsData from "@/data/reviews.json";
import type { Review } from "@/types";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId");
  const contentType = searchParams.get("contentType");
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : null;

  let reviews: Review[] = contentId
    ? getReviewsForContent(contentId)
    : [...(reviewsData as Review[])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

  if (contentType === "movie" || contentType === "series") {
    reviews = reviews.filter((review) => review.contentType === contentType);
  }

  if (limit) {
    reviews = reviews.slice(0, limit);
  }

  return NextResponse.json({ count: reviews.length, reviews });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentType, author, avatarUrl, rating, title, body: reviewText } = body;

    if (!contentId || !author || !rating || !title || !reviewText) {
      return NextResponse.json(
        { error: "Missing required fields (contentId, author, rating, title, body)" },
        { status: 400 },
      );
    }

    const newReview: Review = {
      _id: `review_api_${Date.now()}`,
      contentId,
      contentType: contentType === "series" ? "series" : "movie",
      author: String(author).trim(),
      avatarUrl: avatarUrl || "/images/avatars/review_001.jpg",
      rating: Math.max(1, Math.min(10, Number(rating))),
      title: String(title).trim(),
      body: String(reviewText).trim(),
      date: new Date().toISOString(),
      likes: 0,
    };

    return NextResponse.json(
      { success: true, message: "Review created successfully", review: newReview },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process review creation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
