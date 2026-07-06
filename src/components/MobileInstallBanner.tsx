"use client";

import { useCallback, useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { InstallHelpModal } from "@/components/InstallHelpModal";
import {
  type BeforeInstallPromptEvent,
  isMobileDevice,
  isStandaloneApp,
} from "@/lib/pwa";

const DISMISS_KEY = "qso-pwa-install-tip-dismissed";

export function MobileInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    if (!isMobileDevice() || isStandaloneApp()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setVisible(false);
      setHelpOpen(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const runNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setHelpOpen(false);
        setVisible(false);
      }
    } catch {
      /* manual steps remain visible */
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!mounted) return null;

  return (
    <>
      {visible && (
        <div className="mobile-install-banner" role="region" aria-label="Install app tip">
          <Smartphone size={18} className="mobile-install-banner-icon" aria-hidden />
          <div className="mobile-install-banner-copy">
            <strong>Install QSO Dates</strong>
            <span>Add the calendar to your home screen for quick access.</span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setHelpOpen(true)}>
            How to install
          </button>
          <button type="button" className="mobile-install-banner-close" onClick={dismiss} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
      {helpOpen && (
        <InstallHelpModal
          onClose={() => setHelpOpen(false)}
          canNativeInstall={Boolean(deferredPrompt)}
          onNativeInstall={() => void runNativeInstall()}
          installing={installing}
        />
      )}
    </>
  );
}
