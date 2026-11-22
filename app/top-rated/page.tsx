import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import TopRatedList from "@/components/top-rated/TopRatedList";
import { getTopTenMovies, getTopTenSeries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Top Rated",
  description:
    "The ten films and ten series ranked highest by Cineverse critics and readers.",
};

type TopRatedSearchParams = Promise<{ type?: string | string[] }>;

export default function TopRatedPage({
  searchParams,
}: {
  searchParams: TopRatedSearchParams;
}) {
  const topMovies = getTopTenMovies();

  return (
    <>
      <PageHero
        kicker="The canon"
        title="Top Rated"
        subtitle="Ten films. Ten series. Ranked by our editorial score and the weight of reader response."
        image={topMovies[0]?.backdropUrl}
      />

      <div className="container" style={{ paddingTop: 8, paddingBottom: 40 }}>
        <Suspense
          fallback={
            <div className="empty-state">
              <p className="empty-text">Loading the ranking…</p>
            </div>
          }
        >
          <Rankings searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Rankings({
  searchParams,
}: {
  searchParams: TopRatedSearchParams;
}) {
  const { type } = await searchParams;
  const active = type === "series" ? "series" : "movie";
  const items = active === "movie" ? getTopTenMovies() : getTopTenSeries();

  return (
    <>
      <div className="tabs" style={{ marginBottom: 28 }}>
        <Link
          href="/top-rated?type=movie"
          className={`tab ${active === "movie" ? "active" : ""}`}
        >
          Films
        </Link>
        <Link
          href="/top-rated?type=series"
          className={`tab ${active === "series" ? "active violet" : ""}`}
        >
          Series
        </Link>
      </div>

      <TopRatedList items={items} active={active} />
    </>
  );
}
