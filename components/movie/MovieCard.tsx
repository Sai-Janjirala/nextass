"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Play } from "lucide-react";
import RatingBadge from "@/components/ui/RatingBadge";
import { useApp } from "@/context/AppContext";
import type { Movie } from "@/types";

type MovieCardProps = {
  movie: Movie;
  priority?: boolean;
};

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  const { isInWatchlist, toggleWatchlist } = useApp();
  const saved = isInWatchlist(movie._id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie._id, movie.title);
  };

  return (
    <Link href={`/movies/${movie._id}`} className="movie-card">
      <div className="movie-card-poster">
        <Image
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          fill
          priority={priority}
          sizes="(max-width: 760px) 45vw, (max-width: 1200px) 22vw, 200px"
          style={{ objectFit: "cover" }}
        />
        <div className="movie-card-badge">
          <RatingBadge rating={movie.rating} />
        </div>

        {/* Watchlist Bookmark Button */}
        <button
          type="button"
          className={`card-bookmark-btn ${saved ? "active" : ""}`}
          aria-label={saved ? `Remove ${movie.title} from Watchlist` : `Add ${movie.title} to Watchlist`}
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
        <h3 className="movie-card-title">{movie.title}</h3>
        <p className="movie-card-meta">
          <span>{movie.year}</span>
          <span className="movie-card-dot" aria-hidden="true" />
          <span>{movie.genre[0]}</span>
          <span className="movie-card-dot" aria-hidden="true" />
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </Link>
  );
}
