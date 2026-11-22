"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  Clapperboard,
  Film,
  LogOut,
  Menu,
  Search,
  Star,
  Tv,
  User as UserIcon,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { SearchItem } from "@/types";

const links = [
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/genres", label: "Genres" },
  { href: "/top-rated", label: "Top Rated" },
  { href: "/watchlist", label: "Watchlist" },
];

export default function Navbar({ items }: { items: SearchItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const {
    watchlistCount,
    user,
    openAuthModal,
    logout,
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  const closeMenus = () => {
    setSearchOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setQuery("");
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? items
        .filter(
          (item) =>
            item.title.toLowerCase().includes(trimmed) ||
            item.genre?.some((g) => g.toLowerCase().includes(trimmed)),
        )
        .slice(0, 8)
    : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    const first = results[0];
    if (first) {
      router.push(`/${first.type === "movie" ? "movies" : "series"}/${first.id}`);
    } else {
      router.push(`/movies?q=${encodeURIComponent(value)}`);
    }
    closeSearch();
  };

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link
          href="/"
          className="nav-logo"
          aria-label="Cineverse home"
          onClick={closeMenus}
        >
          <Clapperboard size={22} strokeWidth={1.6} aria-hidden="true" />
          <span>CINEVERSE</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => {
            const active = isActive(link.href);
            const isWatchlist = link.href === "/watchlist";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? "active" : ""}`}
                onClick={closeMenus}
              >
                {link.label}
                {isWatchlist && watchlistCount > 0 ? (
                  <span className="nav-badge">{watchlistCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          {/* Quick Search Button */}
          <button
            type="button"
            className="icon-btn"
            aria-label={searchOpen ? "Close search" : "Search Cineverse"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              setMobileOpen(false);
              setUserMenuOpen(false);
            }}
          >
            {searchOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Search size={18} aria-hidden="true" />
            )}
          </button>

          {/* Quick Watchlist Icon */}
          <Link
            href="/watchlist"
            className="icon-btn nav-watchlist-btn"
            aria-label="View Watchlist"
            onClick={closeMenus}
          >
            <Bookmark size={18} aria-hidden="true" />
            {watchlistCount > 0 ? (
              <span className="icon-badge">{watchlistCount}</span>
            ) : null}
          </Link>

          {/* User Auth Profile / Sign In */}
          {user ? (
            <div className="nav-user-container" ref={userMenuRef}>
              <button
                type="button"
                className="nav-user-btn"
                aria-label="Open user menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                <div className="nav-user-avatar">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    sizes="34px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className="nav-user-name">{user.name.split(" ")[0]}</span>
              </button>

              {userMenuOpen ? (
                <div className="nav-user-dropdown">
                  <div className="nav-user-dropdown-header">
                    <span className="nav-dropdown-name">{user.name}</span>
                    <span className="nav-dropdown-email">{user.email}</span>
                  </div>
                  <div className="nav-user-dropdown-divider" />
                  <Link
                    href="/watchlist"
                    className="nav-dropdown-item"
                    onClick={closeMenus}
                  >
                    <Bookmark size={15} aria-hidden="true" />
                    <span>My Watchlist ({watchlistCount})</span>
                  </Link>
                  <button
                    type="button"
                    className="nav-dropdown-item nav-dropdown-danger"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                  >
                    <LogOut size={15} aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm nav-signin"
              title="Sign in to Cineverse"
              onClick={openAuthModal}
            >
              <UserIcon size={15} aria-hidden="true" />
              Sign In
            </button>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="icon-btn mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
              setUserMenuOpen(false);
            }}
          >
            {mobileOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Panel */}
      {searchOpen ? (
        <div className="search-panel">
          <div className="container">
            <form className="search-field" onSubmit={onSubmit}>
              <Search size={20} aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search films, series, genres..."
                aria-label="Search films and series"
              />
              <span className="search-kbd-hint">ESC to close</span>
              <button
                type="button"
                className="icon-btn search-close-btn"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </form>

            {trimmed ? (
              results.length > 0 ? (
                <div className="search-results">
                  {results.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={`/${item.type === "movie" ? "movies" : "series"}/${item.id}`}
                      className="search-result"
                      onClick={closeSearch}
                    >
                      <div className="search-result-media">
                        {item.posterUrl ? (
                          <Image
                            src={item.posterUrl}
                            alt=""
                            fill
                            sizes="36px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : item.type === "movie" ? (
                          <Film size={18} aria-hidden="true" />
                        ) : (
                          <Tv size={18} aria-hidden="true" />
                        )}
                      </div>
                      <div className="search-result-details">
                        <div className="search-result-title">{item.title}</div>
                        <div className="search-result-sub">
                          <span>{item.year}</span>
                          {item.genre && item.genre[0] ? (
                            <>
                              <span className="search-dot">•</span>
                              <span>{item.genre[0]}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      {item.rating ? (
                        <div className="search-result-rating">
                          <Star size={12} fill="currentColor" aria-hidden="true" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      ) : null}
                      <span className="search-result-type">
                        {item.type === "movie" ? "Film" : "Series"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="search-empty">
                  Nothing matched “{query.trim()}”. Try searching for “Oppenheimer”, “Drama”, or “The Bear”.
                </p>
              )
            ) : (
              <p className="search-hint">
                Search across {items.length} curated films and series. Type a title or genre name.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Mobile Menu */}
      {mobileOpen ? (
        <nav className="mobile-menu" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMenus}
            >
              <span>{link.label}</span>
              {link.href === "/watchlist" && watchlistCount > 0 ? (
                <span className="mobile-badge">{watchlistCount}</span>
              ) : null}
            </Link>
          ))}
          <Link href="/" className="mobile-link" onClick={closeMenus}>
            Home
          </Link>
          <div className="mobile-auth-row">
            {user ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  closeMenus();
                }}
              >
                Sign out ({user.name.split(" ")[0]})
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={() => {
                  closeMenus();
                  openAuthModal();
                }}
              >
                Sign In / Guest Demo
              </button>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
