"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Review } from "@/types";

export interface User {
  name: string;
  email: string;
  avatar: string;
}

interface TrailerState {
  isOpen: boolean;
  url: string;
  title: string;
}

interface ToastState {
  id: number;
  message: string;
  type?: "success" | "info";
}

interface AppContextType {
  // Watchlist
  watchlist: string[];
  watchlistCount: number;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (id: string, title?: string) => void;
  removeFromWatchlist: (id: string, title?: string) => void;

  // Auth
  user: User | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (name: string, email?: string, avatar?: string) => void;
  logout: () => void;

  // Trailer Modal
  trailerModal: TrailerState;
  openTrailer: (url: string, title: string) => void;
  closeTrailer: () => void;

  // Custom Reviews
  customReviews: Record<string, Review[]>;
  addCustomReview: (review: Review) => void;
  getCustomReviews: (contentId: string) => Review[];

  // Toast
  toast: ToastState | null;
  showToast: (message: string, type?: "success" | "info") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = "cineverse_watchlist";
const USER_STORAGE_KEY = "cineverse_user";
const REVIEWS_STORAGE_KEY = "cineverse_custom_reviews";

// Default initial watchlist items to provide an instantly populated experience if fresh
const DEFAULT_WATCHLIST = ["movie_001", "series_001", "movie_002"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [customReviews, setCustomReviews] = useState<Record<string, Review[]>>({});
  const [trailerModal, setTrailerModal] = useState<TrailerState>({
    isOpen: false,
    url: "",
    title: "",
  });
  const [toast, setToast] = useState<ToastState | null>(null);

  // Initialize from localStorage asynchronously after mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        } else {
          setWatchlist(DEFAULT_WATCHLIST);
          localStorage.setItem(
            WATCHLIST_STORAGE_KEY,
            JSON.stringify(DEFAULT_WATCHLIST),
          );
        }

        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (savedReviews) {
          setCustomReviews(JSON.parse(savedReviews));
        }
      } catch {
        // Ignore JSON parse errors
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "info" = "success") => {
      const id = Date.now();
      setToast({ id, message, type });
      window.setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 3500);
    },
    [],
  );

  const toggleWatchlist = useCallback(
    (id: string, title?: string) => {
      setWatchlist((prev) => {
        let updated: string[];
        const name = title || "Title";
        if (prev.includes(id)) {
          updated = prev.filter((item) => item !== id);
          showToast(`Removed “${name}” from your Watchlist`, "info");
        } else {
          updated = [...prev, id];
          showToast(`Added “${name}” to your Watchlist`, "success");
        }
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [showToast],
  );

  const removeFromWatchlist = useCallback(
    (id: string, title?: string) => {
      setWatchlist((prev) => {
        const updated = prev.filter((item) => item !== id);
        const name = title || "Title";
        showToast(`Removed “${name}” from your Watchlist`, "info");
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [showToast],
  );

  const isInWatchlist = useCallback(
    (id: string) => watchlist.includes(id),
    [watchlist],
  );

  const login = useCallback(
    (name: string, email = "", avatar = "") => {
      const newUser: User = {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, "")}@cineverse.example`,
        avatar: avatar || "/images/avatars/review_001.jpg",
      };
      setUser(newUser);
      setIsAuthModalOpen(false);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } catch {
        // ignore
      }
      showToast(`Welcome back, ${name}!`, "success");
    },
    [showToast],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast("Signed out successfully", "info");
  }, [showToast]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const openTrailer = useCallback((url: string, title: string) => {
    setTrailerModal({ isOpen: true, url, title });
  }, []);

  const closeTrailer = useCallback(() => {
    setTrailerModal({ isOpen: false, url: "", title: "" });
  }, []);

  const addCustomReview = useCallback(
    (review: Review) => {
      setCustomReviews((prev) => {
        const existing = prev[review.contentId] || [];
        const updated = {
          ...prev,
          [review.contentId]: [review, ...existing],
        };
        try {
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast("Your review has been published!", "success");
    },
    [showToast],
  );

  const getCustomReviews = useCallback(
    (contentId: string): Review[] => customReviews[contentId] || [],
    [customReviews],
  );

  return (
    <AppContext.Provider
      value={{
        watchlist,
        watchlistCount: watchlist.length,
        isInWatchlist,
        toggleWatchlist,
        removeFromWatchlist,
        user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        trailerModal,
        openTrailer,
        closeTrailer,
        customReviews,
        addCustomReview,
        getCustomReviews,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
