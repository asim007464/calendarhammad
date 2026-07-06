"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { InstallHelpModal } from "@/components/InstallHelpModal";
import {
  type BeforeInstallPromptEvent,
  isMobileDevice,
  isStandaloneApp,
} from "@/lib/pwa";

interface InstallAppButtonProps {
  className?: string;
  variant?: "button" | "card";
}

export default function InstallAppButton({ className = "", variant = "button" }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInstalled(isStandaloneApp());

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      setHelpOpen(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canNativeInstall = Boolean(deferredPrompt);
  const showButton = variant === "card" || isMobileDevice() || canNativeInstall;

  const runNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setHelpOpen(false);
      }
    } catch {
      /* keep modal open with manual steps */
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  const handleInstall = useCallback(() => {
    if (installed) return;

    // Mobile: always show instructions first (iOS has no native prompt; Android should not skip the guide).
    if (isMobileDevice()) {
      setHelpOpen(true);
      return;
    }

    if (canNativeInstall && deferredPrompt) {
      void runNativeInstall();
      return;
    }

    setHelpOpen(true);
  }, [installed, canNativeInstall, deferredPrompt, runNativeInstall]);

  if (installed) {
    if (variant === "card") {
      return (
        <div className={`panel install-card ${className}`}>
          <Smartphone size={24} className="install-icon" aria-hidden />
          <div>
            <h2>App Installed</h2>
            <p className="section-sub">QSO Dates is on your home screen. Launch it like any other app.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  if (!showButton) return null;

  const btnClass = variant === "card" ? "btn btn-primary install-card-btn" : "btn btn-ghost btn-sm";

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className={`${btnClass} ${className}`.trim()}
      >
        <Download size={15} aria-hidden />
        {installing ? "Installing…" : variant === "card" ? "How to install on your phone" : "Install App"}
      </button>
      {mounted && helpOpen && (
        <InstallHelpModal
          onClose={() => setHelpOpen(false)}
          canNativeInstall={canNativeInstall}
          onNativeInstall={() => void runNativeInstall()}
          installing={installing}
        />
      )}
    </>
  );
}
