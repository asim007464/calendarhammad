"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Activity } from "@/types/database";
import { fmtUTC } from "@/lib/activity-utils";

interface Props {
  activity: Activity;
  onClose: () => void;
}

function normalizeCustomFields(fields: Activity["custom_fields"]): Record<string, string> {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  return fields as Record<string, string>;
}

export function ActivityDetailModal({ activity, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const customFields = normalizeCustomFields(activity.custom_fields);

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
      aria-labelledby="activity-detail-title"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">{activity.type_name}</p>
            <h2 id="activity-detail-title" className="no-cap">{activity.name}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {(activity.image_url || activity.logo_url) && (
          <img
            src={activity.image_url || activity.logo_url || ""}
            alt={activity.name}
            style={{ width: "100%", maxHeight: 220, objectFit: "cover" }}
          />
        )}
        <div className="modal-body">
          {activity.description ? <p>{activity.description}</p> : null}
          <div className="grid2" style={{ marginTop: 16 }}>
            <div>
              <strong>Callsign</strong>
              <br />
              <span className="no-cap">{activity.callsign || "N/A"}</span>
            </div>
            <div>
              <strong>Start</strong>
              <br />
              <span className="no-cap">{fmtUTC(activity.start_at)}</span>
            </div>
            <div>
              <strong>End</strong>
              <br />
              <span className="no-cap">{activity.end_at ? fmtUTC(activity.end_at) : "N/A"}</span>
            </div>
            <div>
              <strong>Country</strong>
              <br />
              {activity.country || "N/A"}
            </div>
            <div>
              <strong>Recurrence</strong>
              <br />
              {activity.recurrence}
            </div>
          </div>
          {Object.keys(customFields).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Custom Fields</strong>
              {Object.entries(customFields).map(([k, v]) => (
                <div key={k} className="no-cap">
                  {k}: {v}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
