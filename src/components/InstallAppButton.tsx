"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Share, Smartphone, X } from "lucide-react";
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isMobileDevice,
  isStandaloneApp,
} from "@/lib/pwa";

interface InstallAppButtonProps {
  className?: string;
  variant?: "button" | "card";
}

function InstallHelpModal({ onClose, ios }: { onClose: () => void; ios: boolean }) {
  return createPortal(
    <div className="install-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="panel install-modal" onClick={(e) => e.stopPropagation()}>
        <div className="install-modal-head">
          <h2>{ios ? "Add to Home Screen" : "Install QSO Dates"}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {ios ? (
          <ol className="ios-steps">
            <li>Open this page in <strong>Safari</strong>.</li>
            <li>Tap <Share size={14} className="inline-icon" /> <strong>Share</strong>.</li>
            <li>Tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> — QSO Dates appears on your home screen.</li>
          </ol>
        ) : (
          <ol className="ios-steps">
            <li>Open <strong>qsodates.com</strong> in <strong>Chrome</strong> on your phone.</li>
            <li>Tap the browser menu (⋮) in the top right.</li>
            <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            <li>Confirm — QSO Dates will appear on your home screen.</li>
          </ol>
        )}
        <button type="button" className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
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

  const handleInstall = useCallback(async () => {
    if (installed) return;

    if (canNativeInstall && deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } catch {
        setHelpOpen(true);
      } finally {
        setInstalling(false);
      }
      return;
    }

    setHelpOpen(true);
  }, [installed, canNativeInstall, deferredPrompt]);

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
        onClick={() => void handleInstall()}
        disabled={installing}
        className={`${btnClass} ${className}`.trim()}
      >
        <Download size={15} aria-hidden />
        {installing ? "Installing…" : "Install App"}
      </button>
      {mounted && helpOpen && (
        <InstallHelpModal onClose={() => setHelpOpen(false)} ios={isIosDevice()} />
      )}
    </>
  );
}
