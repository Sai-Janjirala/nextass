"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Movie, Series } from "@/types";

interface TopRatedListProps {
  items: (Movie | Series)[];
  active: "movie" | "series";
}

export default function TopRatedList({ items, active }: TopRatedListProps) {
  const { isInWatchlist, toggleWatchlist } = useApp();

  return (
    <div className="toprated-list">
      {items.map((item, index) => {
        const isSeries = "seasons" in item;
        const rank = index + 1;
        const saved = isInWatchlist(item._id);

        let rankBadgeClass = "";
        if (rank === 1) rankBadgeClass = "rank-gold";
        else if (rank === 2) rankBadgeClass = "rank-silver";
        else if (rank === 3) rankBadgeClass = "rank-bronze";

        return (
          <div key={item._id} className="toprated-row-container">
            <Link
              href={`/${active === "movie" ? "movies" : "series"}/${item._id}`}
              className="toprated-row"
            >
              <div className={`toprated-rank ${rankBadgeClass}`}>
                {String(rank).padStart(2, "0")}
              </div>

              <div className="toprated-poster">
                <Image
                  src={item.posterUrl}
                  alt={`${item.title} poster`}
                  fill
                  sizes="88px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="toprated-main-info">
                <h2 className="toprated-title">{item.title}</h2>
                <div className="toprated-meta">
                  <span>{item.year}</span>
                  <span className="movie-card-dot" aria-hidden="true" />
                  <span>
                    {isSeries
                      ? `${item.seasons} ${
                          item.seasons === 1 ? "season" : "seasons"
                        }`
                      : `${item.runtime} min`}
                  </span>
                  <span className="movie-card-dot" aria-hidden="true" />
                  <span>{isSeries ? item.status : item.language}</span>
                  <span className="movie-card-dot" aria-hidden="true" />
                  <span className="toprated-genre-pill">{item.genre[0]}</span>
                </div>
                <p className="toprated-desc">{item.description}</p>
              </div>

              <div className="toprated-side">
                <div
                  className={`toprated-score ${
                    active === "series" ? "violet" : ""
                  }`}
                >
                  {item.rating.toFixed(1)}
                </div>
                <div className="toprated-reviews">
                  {item.reviewCount.toLocaleString("en-US")} reviews
                </div>
                <span className="toprated-arrow">
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Quick Watchlist action on row */}
            <button
              type="button"
              className={`toprated-bookmark-btn ${saved ? "active" : ""}`}
              title={saved ? "In Watchlist" : "Save to Watchlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWatchlist(item._id, item.title);
              }}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
