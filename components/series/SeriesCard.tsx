"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Play } from "lucide-react";
import RatingBadge from "@/components/ui/RatingBadge";
import { useApp } from "@/context/AppContext";
import type { Series } from "@/types";

type SeriesCardProps = {
  series: Series;
  priority?: boolean;
};

export default function SeriesCard({ series, priority = false }: SeriesCardProps) {
  const { isInWatchlist, toggleWatchlist } = useApp();
  const saved = isInWatchlist(series._id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(series._id, series.title);
  };

  return (
    <Link href={`/series/${series._id}`} className="movie-card">
      <div className="movie-card-poster">
        <Image
          src={series.posterUrl}
          alt={`${series.title} poster`}
          fill
          priority={priority}
          sizes="(max-width: 760px) 45vw, (max-width: 1200px) 22vw, 200px"
          style={{ objectFit: "cover" }}
        />
        <div className="movie-card-badge">
          <RatingBadge rating={series.rating} variant="violet" />
        </div>

        {/* Watchlist Bookmark Button */}
        <button
          type="button"
          className={`card-bookmark-btn violet ${saved ? "active" : ""}`}
          aria-label={saved ? `Remove ${series.title} from Watchlist` : `Add ${series.title} to Watchlist`}
          title={saved ? "In Watchlist" : "Save to Watchlist"}
          onClick={handleBookmark}
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        <div className="movie-card-overlay">
          <span className="movie-card-play">
            <Play size={20} fill="currentColor" aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="movie-card-body">
        <h3 className="movie-card-title">{series.title}</h3>
        <p className="movie-card-meta">
          <span>{series.year}</span>
          <span className="movie-card-dot" aria-hidden="true" />
          <span>{series.genre[0]}</span>
          <span className="movie-card-dot" aria-hidden="true" />
          <span>
            {series.seasons} {series.seasons === 1 ? "season" : "seasons"}
          </span>
        </p>
      </div>
    </Link>
  );
}
