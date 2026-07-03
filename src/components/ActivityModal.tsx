"use client";

import { useState } from "react";
import type { Activity, ActivityType } from "@/types/database";
import { BANDS, MODES } from "@/types/database";

interface Props {
  activityTypes: ActivityType[];
  editing?: Activity | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ActivityModal({ activityTypes, editing, onClose, onSaved }: Props) {
  const [bands, setBands] = useState<string[]>(editing?.bands || []);
  const [modes, setModes] = useState<string[]>(editing?.modes || []);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    editing?.custom_fields
      ? Object.entries(editing.custom_fields).map(([key, value]) => ({ key, value }))
      : []
  );
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], set: (v: string[]) => void, val: string) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const addCustomField = () => setCustomFields([...customFields, { key: "", value: "" }]);
  const updateCustom = (i: number, field: "key" | "value", val: string) => {
    const next = [...customFields];
    next[i][field] = val;
    setCustomFields(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const cf: Record<string, string> = {};
    customFields.forEach(({ key, value }) => { if (key.trim()) cf[key.trim()] = value; });

    const body = {
      name: fd.get("name"),
      type_name: fd.get("type"),
      description: fd.get("description"),
      callsign: fd.get("callsign"),
      organizer: fd.get("organizer"),
      start_at: fd.get("start"),
      end_at: fd.get("end") || null,
      recurrence: fd.get("recurrence"),
      bands,
      modes,
      frequencies: fd.get("frequencies"),
      country: fd.get("country"),
      grid: fd.get("grid"),
      website: fd.get("website"),
      notes: fd.get("notes"),
      custom_fields: cf,
      logo_url: fd.get("logo_url") || null,
    };

    const url = editing ? `/api/activities/${editing.id}` : "/api/activities";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (newType.trim() && res.ok) {
        await fetch("/api/activity-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newType.trim() }),
        });
      }

      if (!res.ok) {
        setError(data.error || "Failed to save activity. Please try again.");
        return;
      }

      onSaved();
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const defaultStart = editing?.start_at?.slice(0, 16) || "";
  const defaultEnd = editing?.end_at?.slice(0, 16) || "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">{editing ? "Edit" : "New submission"}</p>
            <h2>{editing ? "Edit Activity" : "Add An Activity"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid2">
              <label className="field">
                <span>Activity Name *</span>
                <input name="name" required defaultValue={editing?.name} />
              </label>
              <label className="field">
                <span>Type *</span>
                <select name="type" required defaultValue={editing?.type_name || "Contest"}>
                  {activityTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Add New Activity Type (optional)</span>
              <input className="no-cap" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Summits On The Air" />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea name="description" rows={3} defaultValue={editing?.description} />
            </label>
            <div className="grid2">
              <label className="field">
                <span>Callsign</span>
                <input name="callsign" className="no-cap" defaultValue={editing?.callsign} />
              </label>
              <label className="field">
                <span>Organizer</span>
                <input name="organizer" defaultValue={editing?.organizer} />
              </label>
            </div>
            <div className="grid2">
              <label className="field">
                <span>Start (UTC) *</span>
                <input type="datetime-local" name="start" required className="no-cap" defaultValue={defaultStart} />
              </label>
              <label className="field">
                <span>End (UTC)</span>
                <input type="datetime-local" name="end" className="no-cap" defaultValue={defaultEnd} />
              </label>
            </div>
            <label className="field">
              <span>Recurrence</span>
              <select name="recurrence" defaultValue={editing?.recurrence || "annual"}>
                <option value="none">One-time</option>
                <option value="annual">Annual (every year)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <div className="field">
              <span>Bands</span>
              <div className="chip-row">
                {BANDS.map((b) => (
                  <button key={b} type="button" className={`chip ${bands.includes(b) ? "on" : ""}`} onClick={() => toggle(bands, setBands, b)}>{b}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Modes</span>
              <div className="chip-row">
                {MODES.map((m) => (
                  <button key={m} type="button" className={`chip ${modes.includes(m) ? "on" : ""}`} onClick={() => toggle(modes, setModes, m)}>{m}</button>
                ))}
              </div>
            </div>
            <div className="grid2">
              <label className="field">
                <span>Country</span>
                <input name="country" defaultValue={editing?.country} />
              </label>
              <label className="field">
                <span>Grid</span>
                <input name="grid" className="no-cap" defaultValue={editing?.grid} />
              </label>
            </div>
            <label className="field">
              <span>Activity Logo URL</span>
              <input name="logo_url" className="no-cap" placeholder="https://…" defaultValue={editing?.logo_url || ""} />
            </label>
            <label className="field">
              <span>Website</span>
              <input name="website" className="no-cap" defaultValue={editing?.website} />
            </label>

            <div className="field">
              <span>Custom Fields</span>
              {customFields.map((cf, i) => (
                <div key={i} className="grid2" style={{ marginBottom: 8 }}>
                  <input className="no-cap" placeholder="Field name" value={cf.key} onChange={(e) => updateCustom(i, "key", e.target.value)} />
                  <input className="no-cap" placeholder="Value" value={cf.value} onChange={(e) => updateCustom(i, "value", e.target.value)} />
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addCustomField}>+ Add Field</button>
            </div>
            <label className="field">
              <span>Notes</span>
              <textarea name="notes" rows={2} defaultValue={editing?.notes} />
            </label>
          </div>
          <div className="modal-foot">
            {error && (
              <p style={{ flex: 1, margin: 0, color: "#f87171", fontSize: 13, textAlign: "left" }} className="no-cap">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : editing ? "Update" : "Publish Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
