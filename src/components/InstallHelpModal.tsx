"use client";

import { createPortal } from "react-dom";
import { Download, Share, Smartphone, X } from "lucide-react";
import { isAndroidDevice, isIosDevice } from "@/lib/pwa";

interface InstallHelpModalProps {
  onClose: () => void;
  onNativeInstall?: () => void;
  canNativeInstall?: boolean;
  installing?: boolean;
}

export function InstallHelpModal({
  onClose,
  onNativeInstall,
  canNativeInstall = false,
  installing = false,
}: InstallHelpModalProps) {
  const ios = isIosDevice();
  const android = isAndroidDevice();

  return createPortal(
    <div className="install-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Install QSO Dates">
      <div className="panel install-modal" onClick={(e) => e.stopPropagation()}>
        <div className="install-modal-head">
          <div>
            <p className="install-modal-eyebrow">
              <Smartphone size={14} aria-hidden />
              Mobile app
            </p>
            <h2>{ios ? "Add QSO Dates to Home Screen" : "Install QSO Dates on your phone"}</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <p className="install-modal-lead">
          Install QSO Dates like an app for quick access to the ham radio calendar, activities, and your account.
          Follow the steps below for your device.
        </p>

        {ios ? (
          <ol className="ios-steps">
            <li>Use <strong>Safari</strong> (required on iPhone and iPad).</li>
            <li>Tap <Share size={14} className="inline-icon" /> <strong>Share</strong> at the bottom of Safari.</li>
            <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> in the top right. The QSO icon appears on your home screen.</li>
          </ol>
        ) : android ? (
          <ol className="ios-steps">
            <li>Open <strong>qsodates.com</strong> in <strong>Chrome</strong> (recommended).</li>
            <li>Tap the browser menu <strong>⋮</strong> (top right), or the <strong>Install</strong> icon in the address bar if you see it.</li>
            <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            <li>Confirm with <strong>Install</strong> or <strong>Add</strong>. QSO Dates opens from your home screen.</li>
          </ol>
        ) : (
          <ol className="ios-steps">
            <li>Open this site on your phone in Chrome or Safari.</li>
            <li>Use the browser menu to find <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            <li>Confirm the install. QSO Dates will appear on your home screen.</li>
          </ol>
        )}

        <div className="install-modal-actions">
          {canNativeInstall && onNativeInstall && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNativeInstall}
              disabled={installing}
            >
              <Download size={15} aria-hidden />
              {installing ? "Installing…" : "Install now (Chrome)"}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
