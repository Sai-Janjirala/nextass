"use client";

import { useEffect } from "react";
import { ExternalLink, Film, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

function getEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    if (url.includes("youtube.com/embed/")) {
      return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  } catch {
    // fallback
  }
  return url;
}

export default function TrailerModal() {
  const { trailerModal, closeTrailer } = useApp();
  const { isOpen, url, title } = trailerModal;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTrailer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeTrailer]);

  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(url);

  return (
    <div
      className="trailer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} Trailer`}
      onClick={closeTrailer}
    >
      <div className="trailer-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="trailer-header">
          <div className="trailer-title-wrap">
            <Film size={18} className="trailer-icon" aria-hidden="true" />
            <h3 className="trailer-heading">{title} — Official Trailer</h3>
          </div>
          <div className="trailer-actions">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-external-btn"
              title="Open directly on YouTube"
            >
              <ExternalLink size={16} aria-hidden="true" />
              <span>YouTube</span>
            </a>
            <button
              type="button"
              className="icon-btn trailer-close-btn"
              onClick={closeTrailer}
              aria-label="Close trailer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="trailer-player-wrap">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title} trailer player`}
              className="trailer-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="trailer-empty">
              <p>No trailer video available for this title.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
                Search on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
