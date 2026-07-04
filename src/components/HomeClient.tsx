"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, ActivityType, Broadcast } from "@/types/database";
import { BANDS, MODES, TYPE_COLORS } from "@/types/database";
import { activityOnDay, colorFor, fmtUTC, statusOf } from "@/lib/activity-utils";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { ActivityModal } from "@/components/ActivityModal";
import { SupportModal } from "@/components/SupportModal";
import { AdminNavLink } from "@/components/AdminNavLink";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
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
  const [mobileCalOpen, setMobileCalOpen] = useState(false);

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

  const monthAgenda = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const rows: { date: Date; activities: Activity[] }[] = [];
    for (let d = 1; d <= dim; d++) {
      const date = new Date(y, m, d);
      const dayActs = filtered.filter((a) => activityOnDay(a, date));
      if (dayActs.length > 0) rows.push({ date, activities: dayActs });
    }
    return rows;
  }, [viewDate, filtered]);

  const openMobileCalendar = () => {
    setView("calendar");
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileCalOpen(true);
    }
  };

  const renderCalendarGrid = (compact?: boolean) => (
    <>
      <div className="cal-grid weekdays">
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {calDays.map(({ date, inMonth }, i) => {
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();
          const dayActs = filtered.filter((a) => activityOnDay(a, date));
          const maxEvts = compact ? 2 : 3;
          return (
            <div key={i} className={`cal-cell ${!inMonth ? "other" : ""} ${isToday ? "today" : ""}`}>
              <div className="daynum">{date.getDate()}</div>
              {dayActs.slice(0, maxEvts).map((a) => (
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
    </>
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAddActivity = () => {
    if (!isLoggedIn) {
      showToast("Please sign in to publish an activity.");
      router.push("/login?next=/");
      return;
    }
    setEditing(null);
    setShowModal(true);
  };

  const logView = async (id: string) => {
    await fetch(`/api/activities/${id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "view" }),
    });
  };

  const openDetail = (a: Activity) => {
    setMobileCalOpen(false);
    setDetail(a);
    logView(a.id);
  };

  useEffect(() => {
    if (!mobileCalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileCalOpen]);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      <Topbar
        currentView={view}
        onViewChange={setView}
        onAddActivity={openAddActivity}
        onSupport={() => setShowSupport(true)}
        onLoginRequired={() => showToast("Please sign in to publish an activity.")}
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
              Browse the amateur radio event calendar — contests, special event stations,{" "}
              <span className="hero-acronym no-cap">POTA</span> and{" "}
              <span className="hero-acronym no-cap">SOTA</span> activations, DXpeditions, nets, and field days.
              Publish your ham radio activity on <span className="hero-acronym no-cap">QSO</span> Dates.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-primary btn-lg" onClick={openAddActivity}>
                {authLoading ? "Publish Your Activity" : isLoggedIn ? "Publish Your Activity" : "Sign In to Publish"}
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
                <AdminNavLink className="panel-admin-link" />
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
              <AdminNavLink className="panel-admin-link" />
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

        <main className="page-main">
          <section className="panel toolbar">
            <div className="toolbar-top">
              <div>
                <h2 className="section-title">{view === "calendar" ? "Event Calendar" : "All Activities"}</h2>
                <p className="section-sub">All times displayed in UTC</p>
              </div>
              <div className="toolbar-actions-row">
                <AdminNavLink className="panel-admin-link" />
                <button
                  type="button"
                  className={`toggle-btn ${view === "calendar" ? "active" : ""}`}
                  onClick={() => {
                    if (view !== "calendar") setView("calendar");
                    else if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
                      setMobileCalOpen(true);
                    }
                  }}
                >
                  Month
                </button>
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
            <section className="panel cal-panel">
              <div className="cal-header">
                <div className="cal-nav">
                  <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹</button>
                  <button
                    type="button"
                    className="cal-month-title mobile-only"
                    onClick={openMobileCalendar}
                    aria-label="Open full calendar"
                  >
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </button>
                  <h2 className="desktop-only">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                  <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>›</button>
                </div>
                <div className="cal-header-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewDate(new Date())}>Today</button>
                  <button type="button" className="btn btn-outline btn-sm mobile-only" onClick={openMobileCalendar}>
                    Full calendar
                  </button>
                  <AdminNavLink className="panel-admin-link" />
                </div>
              </div>

              <div className="cal-desktop-only">
                <div className="cal-scroll-wrap">
                  <div className="cal-scroll-inner">
                    {renderCalendarGrid()}
                  </div>
                </div>
              </div>

              <div className="cal-mobile-agenda mobile-only">
                {monthAgenda.length === 0 ? (
                  <p className="cal-agenda-empty">No events this month. Tap the month name or Full calendar to browse dates.</p>
                ) : (
                  monthAgenda.map(({ date, activities }) => {
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                      <div key={date.toISOString()} className={`cal-agenda-row ${isToday ? "today" : ""}`}>
                        <div className="cal-agenda-date">
                          <span className="cal-agenda-wd">{WEEKDAYS[(date.getDay() + 6) % 7]}</span>
                          <span className="cal-agenda-day">{date.getDate()}</span>
                        </div>
                        <div className="cal-agenda-events">
                          {activities.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              className="cal-agenda-evt"
                              style={{ borderLeftColor: colorFor(a.type_name, TYPE_COLORS) }}
                              onClick={() => openDetail(a)}
                            >
                              <span className="cal-agenda-evt-name no-cap">{a.name}</span>
                              <span className="cal-agenda-evt-meta no-cap">{a.type_name}{a.callsign ? ` · ${a.callsign}` : ""}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ) : (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3 className="section-title" style={{ fontSize: 18 }}>All Activities</h3>
                  <p className="section-sub">{filtered.length} activities</p>
                </div>
                <AdminNavLink className="panel-admin-link" />
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

      {mobileCalOpen && (
        <div className="cal-fullscreen-overlay" onClick={() => setMobileCalOpen(false)}>
          <div className="cal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="cal-fullscreen-head">
              <div className="cal-nav">
                <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹</button>
                <h2>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h2>
                <button type="button" className="icon-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>›</button>
              </div>
              <div className="cal-header-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewDate(new Date())}>Today</button>
                <button type="button" className="icon-btn" onClick={() => setMobileCalOpen(false)} aria-label="Close calendar">×</button>
              </div>
            </div>
            <p className="cal-scroll-hint">Swipe sideways to view all days</p>
            <div className="cal-scroll-wrap">
              <div className="cal-scroll-inner">
                {renderCalendarGrid(true)}
              </div>
            </div>
          </div>
        </div>
      )}

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
