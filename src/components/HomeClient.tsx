"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, ActivityType, Broadcast } from "@/types/database";
import { BANDS, MODES, TYPE_COLORS } from "@/types/database";
import { activityOnDay, colorFor, fmtUTC, statusOf } from "@/lib/activity-utils";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { ActivityModal } from "@/components/ActivityModal";
import { SupportModal } from "@/components/SupportModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  initialActivities: Activity[];
  activityTypes: ActivityType[];
  broadcast: Broadcast | null;
}

export function HomeClient({ initialActivities, activityTypes, broadcast }: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [viewDate, setViewDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBand, setFilterBand] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [detail, setDetail] = useState<Activity | null>(null);
  const [dismissedBroadcast, setDismissedBroadcast] = useState(false);
  const [toast, setToast] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/activities");
    if (res.ok) setActivities(await res.json());
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter((a) => {
      if (filterType && a.type_name !== filterType) return false;
      if (filterBand && !(a.bands || []).includes(filterBand)) return false;
      if (filterMode && !(a.modes || []).includes(filterMode)) return false;
      if (!q) return true;
      return [a.name, a.callsign, a.country, a.organizer, a.description]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [activities, search, filterType, filterBand, filterMode]);

  const live = filtered.filter((a) => statusOf(a) === "live");
  const upcoming = filtered.filter((a) => statusOf(a) === "upcoming").slice(0, 6);

  const calDays = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: new Date(y, m, -i), inMonth: false });
    }
    const dim = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) days.push({ date: new Date(y, m, d), inMonth: true });
    while (days.length % 7 !== 0) {
      const n = days.length - (startPad + dim) + 1;
      days.push({ date: new Date(y, m + 1, n), inMonth: false });
    }
    return days;
  }, [viewDate]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const logView = async (id: string) => {
    await fetch(`/api/activities/${id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "view" }),
    });
  };

  const openDetail = (a: Activity) => {
    setDetail(a);
    logView(a.id);
  };

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      <Topbar
        currentView={view}
        onViewChange={setView}
        onAddActivity={() => { setEditing(null); setShowModal(true); }}
        onSupport={() => setShowSupport(true)}
      />

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="pulse-dot" />
              Global Amateur Radio Events
            </span>
            <h1>
              Your Worldwide Hub For <span className="gradient-text">Ham Radio On-Air Activities</span>
            </h1>
            <p className="hero-lead">
              Browse the amateur radio event calendar — contests, special event stations, POTA and SOTA
              activations, DXpeditions, nets, and field days. Publish your ham radio activity on QSO Dates.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                Publish Your Activity
              </button>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => setView("list")}>
                Browse Events
              </button>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card stat-live">
              <div className="stat-label">On Air Now</div>
              <div className="stat-value">{live.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Activities</div>
              <div className="stat-value">{activities.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Activity Types</div>
              <div className="stat-value">{activityTypes.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Upcoming</div>
              <div className="stat-value">{upcoming.length}</div>
            </div>
          </div>
        </div>
      </section>

      {broadcast && !dismissedBroadcast && (
        <div className="broadcast-banner" style={{ maxWidth: 1264, margin: "0 auto 16px", padding: "0 28px" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(198,255,52,0.15), rgba(198,255,52,0.05))", border: "1px solid rgba(198,255,52,0.3)", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 className="no-cap">{broadcast.title}</h3>
              <p>{broadcast.message}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissedBroadcast(true)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="page-layout">
        <aside className="sidebar">
          <div className="panel">
            <div className="panel-head">
              <h3>On Air Now</h3>
              <div className="panel-head-right">
                <span className="eyebrow" style={{ margin: 0, fontSize: 10 }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live
                </span>
                <a href="/admin" className="panel-admin-link">Admin</a>
              </div>
            </div>
            <div className="mini-list">
              {live.length === 0 ? (
                <p style={{ padding: 12, color: "var(--text-muted)", fontSize: 13 }}>No live activities</p>
              ) : (
                live.map((a) => (
                  <div key={a.id} className="mini-item" onClick={() => openDetail(a)}>
                    <strong>{a.name}</strong>
                    <span className="no-cap">{a.callsign}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <h3>Coming Up</h3>
              <a href="/admin" className="panel-admin-link">Admin</a>
            </div>
            <div className="mini-list">
              {upcoming.map((a) => (
                <div key={a.id} className="mini-item" onClick={() => openDetail(a)}>
                  <strong>{a.name}</strong>
                  <span className="no-cap">{fmtUTC(a.start_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <section className="panel toolbar">
            <div className="toolbar-top">
              <div>
                <h2 className="section-title">{view === "calendar" ? "Event Calendar" : "All Activities"}</h2>
                <p className="section-sub">All times displayed in UTC</p>
              </div>
              <div className="toolbar-actions-row">
                <a href="/admin" className="panel-admin-link">Admin</a>
                <button type="button" className={`toggle-btn ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>Month</button>
                <button type="button" className={`toggle-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List</button>
              </div>
            </div>
            <div className="toolbar-filters">
              <div className="search-wrap">
                <input type="search" placeholder="Search by name, callsign, country…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="filter-group">
                <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All types</option>
                  {activityTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <select className="select" value={filterBand} onChange={(e) => setFilterBand(e.target.value)}>
                  <option value="">All bands</option>
                  {BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select className="select" value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                  <option value="">All modes</option>
                  {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterType(""); setFilterBand(""); setFilterMode(""); }}>Clear</button>
              </div>
            </div>
          </section>

          {view === "calendar" ? (
            <section className="panel">
              <div className="cal-header">
                <div className="cal-nav">
                  <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹</button>
                  <h2>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                  <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>›</button>
                </div>
                <div className="cal-header-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewDate(new Date())}>Today</button>
                  <a href="/admin" className="panel-admin-link">Admin</a>
                </div>
              </div>
              <div className="cal-grid weekdays">
                {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
              </div>
              <div className="cal-grid">
                {calDays.map(({ date, inMonth }, i) => {
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();
                  const dayActs = filtered.filter((a) => activityOnDay(a, date));
                  return (
                    <div key={i} className={`cal-cell ${!inMonth ? "other" : ""} ${isToday ? "today" : ""}`}>
                      <div className="daynum">{date.getDate()}</div>
                      {dayActs.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="evt"
                          style={{ background: colorFor(a.type_name, TYPE_COLORS) }}
                          onClick={() => openDetail(a)}
                          title={a.name}
                        >
                          {a.name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3 className="section-title" style={{ fontSize: 18 }}>All Activities</h3>
                  <p className="section-sub">{filtered.length} activities</p>
                </div>
                <a href="/admin" className="panel-admin-link">Admin</a>
              </div>
              <div className="activity-list">
                {filtered.map((a) => {
                  const d = new Date(a.start_at);
                  return (
                    <div key={a.id} className="acard" onClick={() => openDetail(a)}>
                      <div className="acard-date">
                        <div className="mon">{MONTHS[d.getUTCMonth()].slice(0, 3).toUpperCase()}</div>
                        <div className="day">{d.getUTCDate()}</div>
                      </div>
                      <div>
                        <span className="type-badge" style={{ background: colorFor(a.type_name, TYPE_COLORS) }}>{a.type_name}</span>
                        <h3 className="no-cap">{a.name}</h3>
                        <div className="acard-meta no-cap">{a.callsign} · {fmtUTC(a.start_at)}</div>
                      </div>
                      {(a.image_url || a.logo_url) && (
                        <img
                          src={a.image_url || a.logo_url || ""}
                          alt=""
                          width={48}
                          height={48}
                          style={{ borderRadius: 8, objectFit: "cover" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-eyebrow">{detail.type_name}</p>
                <h2 className="no-cap">{detail.name}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setDetail(null)}>×</button>
            </div>
            {(detail.image_url || detail.logo_url) && (
              <img
                src={detail.image_url || detail.logo_url || ""}
                alt={detail.name}
                style={{ width: "100%", maxHeight: 220, objectFit: "cover" }}
              />
            )}
            <div className="modal-body">
              <p>{detail.description}</p>
              <div className="grid2" style={{ marginTop: 16 }}>
                <div><strong>Callsign</strong><br /><span className="no-cap">{detail.callsign || "—"}</span></div>
                <div><strong>Schedule</strong><br /><span className="no-cap">{fmtUTC(detail.start_at)}</span></div>
                <div><strong>Country</strong><br />{detail.country || "—"}</div>
                <div><strong>Recurrence</strong><br />{detail.recurrence}</div>
              </div>
              {detail.custom_fields && Object.keys(detail.custom_fields).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <strong>Custom Fields</strong>
                  {Object.entries(detail.custom_fields).map(([k, v]) => (
                    <div key={k} className="no-cap">{k}: {v}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ActivityModal
          activityTypes={activityTypes}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); refresh(); showToast("Activity published!"); }}
        />
      )}

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} onSent={() => showToast("Support message sent")} />}

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  );
}
