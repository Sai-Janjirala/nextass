"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Film, Trash2, Tv } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import MovieCard from "@/components/movie/MovieCard";
import SeriesCard from "@/components/series/SeriesCard";
import { useApp } from "@/context/AppContext";
import { getAllContent } from "@/lib/data";
import type { Movie, Series } from "@/types";

type WatchlistFilter = "all" | "movie" | "series";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useApp();
  const [filter, setFilter] = useState<WatchlistFilter>("all");

  const allContent = useMemo(() => getAllContent(), []);

  const savedItems = useMemo(() => {
    return watchlist
      .map((id) => allContent.find((item) => item._id === id))
      .filter((item): item is Movie | Series => Boolean(item));
  }, [watchlist, allContent]);

  const movies = useMemo(
    () => savedItems.filter((item): item is Movie => !("seasons" in item)),
    [savedItems],
  );

  const series = useMemo(
    () => savedItems.filter((item): item is Series => "seasons" in item),
    [savedItems],
  );

  const displayedItems = useMemo(() => {
    if (filter === "movie") return movies;
    if (filter === "series") return series;
    return savedItems;
  }, [filter, movies, series, savedItems]);

  const totalRuntime = useMemo(() => {
    return movies.reduce((acc, m) => acc + (m.runtime || 0), 0);
  }, [movies]);

  return (
    <>
      <PageHero
        kicker="Your Cinema Journal"
        title="My Watchlist"
        subtitle="Keep track of films to experience, ongoing series to follow, and masterworks to revisit."
        image={savedItems[0]?.backdropUrl || "/images/backdrops/movie_001.jpg"}
      />

      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        {savedItems.length > 0 ? (
          <>
            {/* Filter and stats bar */}
            <div className="watchlist-toolbar">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All ({savedItems.length})
                </button>
                <button
                  type="button"
                  className={`tab ${filter === "movie" ? "active" : ""}`}
                  onClick={() => setFilter("movie")}
                >
                  Films ({movies.length})
                </button>
                <button
                  type="button"
                  className={`tab ${filter === "series" ? "active violet" : ""}`}
                  onClick={() => setFilter("series")}
                >
                  Series ({series.length})
                </button>
              </div>

              <div className="watchlist-stats">
                {movies.length > 0 ? (
                  <span>
                    {totalRuntime} min film time
                  </span>
                ) : null}
                {series.length > 0 ? (
                  <span>
                    {series.reduce((acc, s) => acc + s.seasons, 0)} seasons to stream
                  </span>
                ) : null}
              </div>
            </div>

            {/* Grid of items */}
            {displayedItems.length > 0 ? (
              <div className="cards-grid">
                {displayedItems.map((item) => {
                  const isSeries = "seasons" in item;
                  return (
                    <div key={item._id} className="watchlist-item-wrapper">
                      {isSeries ? (
                        <SeriesCard series={item} />
                      ) : (
                        <MovieCard movie={item} />
                      )}
                      <button
                        type="button"
                        className="watchlist-remove-btn"
                        title={`Remove ${item.title} from Watchlist`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWatchlist(item._id, item.title);
                        }}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-title">
                  No {filter === "movie" ? "films" : "series"} in your list
                </div>
                <p className="empty-text">
                  Switch filters above or explore more titles in the Cineverse collection.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state watchlist-empty-state">
            <div className="watchlist-empty-icon">
              <Bookmark size={36} aria-hidden="true" />
            </div>
            <h2 className="empty-title">Your Watchlist is empty</h2>
            <p className="empty-text">
              Save stories you want to experience by clicking the bookmark button on any movie or series card.
            </p>
            <div className="watchlist-empty-actions">
              <Link href="/movies" className="btn btn-gold btn-sm">
                <Film size={15} aria-hidden="true" />
                Browse Films
              </Link>
              <Link href="/series" className="btn btn-ghost btn-sm">
                <Tv size={15} aria-hidden="true" />
                Browse Series
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
