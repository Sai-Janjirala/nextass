"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clapperboard, Sparkles, UserCheck, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

const DEMO_USERS = [
  {
    name: "Alex Chen",
    role: "Senior Film Critic",
    email: "alex.chen@cineverse.example",
    avatar: "/images/avatars/review_001.jpg",
  },
  {
    name: "Elena Rostova",
    role: "Series Curator",
    email: "elena.rostova@cineverse.example",
    avatar: "/images/avatars/review_002.jpg",
  },
  {
    name: "Marcus Vance",
    role: "Editorial Member",
    email: "marcus.vance@cineverse.example",
    avatar: "/images/avatars/review_003.jpg",
  },
];

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useApp();
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    login(customName.trim(), customEmail.trim());
    setCustomName("");
    setCustomEmail("");
  };

  return (
    <div
      className="auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Sign In to Cineverse"
      onClick={closeAuthModal}
    >
      <div className="auth-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-btn auth-close"
          onClick={closeAuthModal}
          aria-label="Close modal"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="auth-brand">
          <Clapperboard size={26} className="auth-logo-icon" />
          <h2 className="auth-title">Welcome to Cineverse</h2>
          <p className="auth-subtitle">
            Sign in to curate your Watchlist, publish verified reviews, and join the conversation.
          </p>
        </div>

        <div className="auth-section">
          <div className="auth-section-title">
            <Sparkles size={14} className="auth-sparkle" />
            <span>Quick 1-Click Demo Profile</span>
          </div>

          <div className="auth-demo-grid">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.name}
                type="button"
                className="auth-demo-card"
                onClick={() => login(demo.name, demo.email, demo.avatar)}
              >
                <div className="auth-demo-avatar">
                  <Image
                    src={demo.avatar}
                    alt={demo.name}
                    fill
                    sizes="44px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="auth-demo-info">
                  <span className="auth-demo-name">{demo.name}</span>
                  <span className="auth-demo-role">{demo.role}</span>
                </div>
                <UserCheck size={16} className="auth-demo-action" />
              </button>
            ))}
          </div>
        </div>

        <div className="auth-divider">
          <span>or sign in with custom details</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="auth-name" className="auth-label">
              Your Name / Handle
            </label>
            <input
              id="auth-name"
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="auth-email" className="auth-label">
              Email Address (Optional)
            </label>
            <input
              id="auth-email"
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="maya@example.com"
              className="auth-input"
            />
          </div>

          <button type="submit" className="btn btn-gold auth-submit-btn">
            Sign In & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
