"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { SupportModal } from "@/components/SupportModal";

interface SupportContextValue {
  openSupport: () => void;
}

const SupportContext = createContext<SupportContextValue | null>(null);

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error("useSupport must be used within SupportProvider");
  }
  return ctx;
}

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const openSupport = useCallback(() => setOpen(true), []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  };

  return (
    <SupportContext.Provider value={{ openSupport }}>
      {children}
      {open && (
        <SupportModal
          onClose={() => setOpen(false)}
          onSent={() => showToast("Message sent. We will get back to you soon.")}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </SupportContext.Provider>
  );
}
