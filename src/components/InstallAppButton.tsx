"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function InstallAppButton({ className = "", variant = "button" }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHintOpen, setIosHintOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setInstalled(isStandaloneApp());

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      setMessage("App installed — open it from your home screen.");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canNativeInstall = Boolean(deferredPrompt);
  const showOnMobile = isMobileDevice() || canNativeInstall;

  const handleInstall = useCallback(async () => {
    setMessage("");
    if (isIosDevice()) {
      setIosHintOpen(true);
      return;
    }
    if (!deferredPrompt) {
      setMessage("Open in Chrome on your phone, then tap Install app from the browser menu.");
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } catch {
      setMessage("Could not start install. Try Add to Home screen from your browser menu.");
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

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

  if (!showOnMobile && variant === "button") return null;

  const btnClass = variant === "card" ? "btn btn-primary" : "btn btn-ghost btn-sm";

  return (
    <>
      <button type="button" onClick={() => void handleInstall()} disabled={installing} className={`${btnClass} ${className}`}>
        <Download size={15} aria-hidden />
        {installing ? "Installing…" : "Install App"}
      </button>
      {message && <p className="hint">{message}</p>}
      {iosHintOpen && (
        <div className="modal-backdrop" onClick={() => setIosHintOpen(false)} role="dialog" aria-modal="true">
          <div className="panel modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h2>Add to Home Screen</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIosHintOpen(false)}><X size={16} /></button>
            </div>
            <ol className="ios-steps">
              <li>Open this page in <strong>Safari</strong>.</li>
              <li>Tap <Share size={14} className="inline-icon" /> <strong>Share</strong>.</li>
              <li>Tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> — QSO Dates appears on your home screen.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
