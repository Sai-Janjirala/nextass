"use client";

import { AppProvider } from "@/context/AppContext";
import TrailerModal from "@/components/ui/TrailerModal";
import AuthModal from "@/components/auth/AuthModal";
import Toast from "@/components/ui/Toast";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      {children}
      <TrailerModal />
      <AuthModal />
      <Toast />
    </AppProvider>
  );
}
