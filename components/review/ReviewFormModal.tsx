"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Review } from "@/types";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: "movie" | "series";
  contentTitle: string;
  posterUrl: string;
  onReviewAdded?: (review: Review) => void;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
  posterUrl,
  onReviewAdded,
}: ReviewFormModalProps) {
  const { user, addCustomReview, showToast, openAuthModal } = useApp();
  const [rating, setRating] = useState<number>(9);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState<string>(() => user?.name || "");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !body.trim()) {
      showToast("Please fill in all review fields", "info");
      return;
    }

    setIsSubmitting(true);
    const newReview: Review = {
      _id: `review_user_${Date.now()}`,
      contentId,
      contentType,
      author: author.trim(),
      avatarUrl: user?.avatar || "/images/avatars/review_001.jpg",
      rating,
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString(),
      likes: 0,
    };

    try {
      // Send to API
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
    } catch {
      // offline or mock fallback
    }

    addCustomReview(newReview);
    if (onReviewAdded) {
      onReviewAdded(newReview);
    }

    setIsSubmitting(false);
    setTitle("");
    setBody("");
    onClose();
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className="review-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Write a review for ${contentTitle}`}
      onClick={onClose}
    >
      <div className="review-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-btn review-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="review-modal-header">
          <div className="review-modal-poster">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={contentTitle}
                fill
                sizes="60px"
                style={{ objectFit: "cover" }}
              />
            ) : null}
          </div>
          <div>
            <p className="review-modal-kicker">Reviewing</p>
            <h2 className="review-modal-title">{contentTitle}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-modal-form">
          {/* Rating selector */}
          <div className="review-form-group">
            <label className="review-form-label">
              Your Rating: <strong className="review-score-display">{activeRating} / 10</strong>
            </label>
            <div className="review-stars-selector">
              {Array.from({ length: 10 }).map((_, i) => {
                const score = i + 1;
                const isSelected = score <= activeRating;
                return (
                  <button
                    key={score}
                    type="button"
                    className={`review-score-btn ${isSelected ? "selected" : ""}`}
                    onMouseEnter={() => setHoverRating(score)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(score)}
                    aria-label={`Rate ${score} out of 10`}
                  >
                    <Star
                      size={18}
                      fill={isSelected ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                    <span className="score-num">{score}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author name */}
          <div className="review-form-group">
            <div className="review-label-row">
              <label htmlFor="review-author" className="review-form-label">
                Your Reviewer Name
              </label>
              {!user ? (
                <button
                  type="button"
                  className="review-signin-hint"
                  onClick={openAuthModal}
                >
                  Sign in to use profile
                </button>
              ) : null}
            </div>
            <input
              id="review-author"
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. CinemaLover"
              className="review-input"
            />
          </div>

          {/* Review Title */}
          <div className="review-form-group">
            <label htmlFor="review-title" className="review-form-label">
              Review Headline
            </label>
            <input
              id="review-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A triumph of visual craft and emotional precision"
              className="review-input"
            />
          </div>

          {/* Review Body */}
          <div className="review-form-group">
            <label htmlFor="review-body" className="review-form-label">
              Your Review
            </label>
            <textarea
              id="review-body"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share what worked, the performances that stood out, or how the cinematography moved you..."
              className="review-textarea"
            />
          </div>

          <div className="review-modal-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-gold btn-sm"
            >
              {isSubmitting ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
