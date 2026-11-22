"use client";

import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info } from "lucide-react";

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type !== "info";

  return (
    <div className="toast-portal" role="status" aria-live="polite">
      <div className={`toast-card ${isSuccess ? "toast-success" : "toast-info"}`}>
        {isSuccess ? (
          <CheckCircle2 size={18} className="toast-icon-success" aria-hidden="true" />
        ) : (
          <Info size={18} className="toast-icon-info" aria-hidden="true" />
        )}
        <span className="toast-text">{toast.message}</span>
      </div>
    </div>
  );
}
