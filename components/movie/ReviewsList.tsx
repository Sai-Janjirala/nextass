"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { PenLine, Sparkles, ThumbsUp } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import ReviewFormModal from "@/components/review/ReviewFormModal";
import { useApp } from "@/context/AppContext";
import type { Review } from "@/types";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return value;
  }
}

interface ReviewsListProps {
  reviews: Review[];
  contentId?: string;
  contentType?: "movie" | "series";
  contentTitle?: string;
  posterUrl?: string;
}

type ReviewSort = "newest" | "likes" | "rating";

export default function ReviewsList({
  reviews: initialReviews,
  contentId,
  contentType = "movie",
  contentTitle = "this title",
  posterUrl = "",
}: ReviewsListProps) {
  const { getCustomReviews } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<ReviewSort>("newest");

  // Custom reviews submitted by user in this session / localStorage
  const customReviews = useMemo(
    () => (contentId ? getCustomReviews(contentId) : []),
    [contentId, getCustomReviews],
  );

  const allReviews = useMemo(() => {
    // Avoid duplicates if IDs collide
    const customIds = new Set(customReviews.map((r) => r._id));
    const merged = [...customReviews, ...initialReviews.filter((r) => !customIds.has(r._id))];

    return merged.sort((a, b) => {
      if (sortBy === "likes") {
        const likesA = a.likes + (liked[a._id] ? 1 : 0);
        const likesB = b.likes + (liked[b._id] ? 1 : 0);
        return likesB - likesA;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [customReviews, initialReviews, sortBy, liked]);

  return (
    <>
      {/* Interactive Write Review Banner */}
      <div className="write-review-banner">
        <div className="write-review-info">
          <span className="write-review-title">Have an impression of {contentTitle}?</span>
          <span className="write-review-desc">
            Rate the performance, direction, and screenwriting.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-gold btn-sm write-review-action"
          onClick={() => setIsModalOpen(true)}
        >
          <PenLine size={15} aria-hidden="true" />
          Write a Review
        </button>
      </div>

      {/* Sort options bar if multiple reviews */}
      {allReviews.length > 1 ? (
        <div className="reviews-filter-bar">
          <span className="reviews-counter">
            Showing {allReviews.length} {allReviews.length === 1 ? "review" : "reviews"}
          </span>
          <div className="reviews-sort-group">
            <span className="reviews-sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReviewSort)}
              className="select select-sm"
              aria-label="Sort reviews"
            >
              <option value="newest">Newest first</option>
              <option value="likes">Most helpful</option>
              <option value="rating">Highest rating</option>
            </select>
          </div>
        </div>
      ) : null}

      {allReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No reviews yet</div>
          <p className="empty-text">Be the first to share your take on {contentTitle}.</p>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            style={{ marginTop: 14 }}
            onClick={() => setIsModalOpen(true)}
          >
            <PenLine size={15} aria-hidden="true" />
            Write the First Review
          </button>
        </div>
      ) : (
        <div className="reviews">
          {allReviews.map((review) => {
            const isLiked = Boolean(liked[review._id]);
            const isUserReview = review._id.startsWith("review_user_") || review._id.startsWith("review_api_");

            return (
              <article key={review._id} className="review-card">
                <div className="review-head">
                  <div className="review-avatar">
                    <Image
                      src={review.avatarUrl || "/images/avatars/review_001.jpg"}
                      alt={review.author}
                      fill
                      sizes="42px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div className="review-author-row">
                      <span className="review-author">{review.author}</span>
                      {isUserReview ? (
                        <span className="review-badge-new">
                          <Sparkles size={11} aria-hidden="true" />
                          New
                        </span>
                      ) : null}
                    </div>
                    <div className="review-date">{formatDate(review.date)}</div>
                  </div>
                  <div className="review-stars">
                    <div className="review-score-tag">
                      <strong>{review.rating}</strong> / 10
                    </div>
                    <StarRating rating={review.rating / 2} size={15} />
                  </div>
                </div>

                <h3 className="review-title">{review.title}</h3>
                <p className="review-body">{review.body}</p>

                <div className="review-foot">
                  <button
                    type="button"
                    className={`review-like ${isLiked ? "active" : ""}`}
                    aria-pressed={isLiked}
                    onClick={() =>
                      setLiked((prev) => ({
                        ...prev,
                        [review._id]: !prev[review._id],
                      }))
                    }
                  >
                    <ThumbsUp
                      size={14}
                      fill={isLiked ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                    {review.likes + (isLiked ? 1 : 0)} found this helpful
                  </button>
                  <span>Verified reader</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Review Form Modal */}
      {contentId ? (
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contentId={contentId}
          contentType={contentType}
          contentTitle={contentTitle}
          posterUrl={posterUrl}
        />
      ) : null}
    </>
  );
}
