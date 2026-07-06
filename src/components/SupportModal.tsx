"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ContactForm } from "@/components/ContactForm";

interface Props {
  onClose: () => void;
  onSent: () => void;
}

export function SupportModal({ onClose, onSent }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-overlay modal-overlay--portal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">Get in touch</p>
            <h2 id="support-modal-title">Contact</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <ContactForm onSuccess={() => { onSent(); onClose(); }} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
