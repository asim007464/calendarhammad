"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, ActivityType } from "@/types/database";
import { BANDS, MODES, TYPE_COLORS } from "@/types/database";
import { activityOnDay, colorFor } from "@/lib/activity-utils";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { ActivityDetailModal } from "@/components/ActivityDetailModal";
import { ActivityModal } from "@/components/ActivityModal";
import { AdminNavLink } from "@/components/AdminNavLink";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createOpenDetailHandler } from "@/lib/activityDetail";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function utcTodayParts() {
  const now = new Date();
  return {
    y: now.getUTCFullYear(),
    m: now.getUTCMonth(),
    d: now.getUTCDate(),
  };
}

function utcMonthStart(y: number, m: number) {
  return new Date(Date.UTC(y, m, 1));
}

function isSameUtcDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

interface Props {
  initialActivities: Activity[];
  activityTypes: ActivityType[];
}

export function CalendarClient({ initialActivities, activityTypes }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activities, setActivities] = useState(initialActivities);
  const [viewDate, setViewDate] = useState(() => {
    const t = utcTodayParts();
    return utcMonthStart(t.y, t.m);
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBand, setFilterBand] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Activity | null>(null);
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

  const calDays = useMemo(() => {
    const y = viewDate.getUTCFullYear();
    const m = viewDate.getUTCMonth();
    const first = utcMonthStart(y, m);
    const startPad = (first.getUTCDay() + 6) % 7;
    const days: { date: Date; inMonth: boolean }[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: new Date(Date.UTC(y, m, -i)), inMonth: false });
    }

    const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    for (let d = 1; d <= dim; d++) {
      days.push({ date: new Date(Date.UTC(y, m, d)), inMonth: true });
    }

    while (days.length % 7 !== 0) {
      const n = days.length - (startPad + dim) + 1;
      days.push({ date: new Date(Date.UTC(y, m + 1, n)), inMonth: false });
    }

    return days;
  }, [viewDate]);

  const monthAgenda = useMemo(() => {
    const y = viewDate.getUTCFullYear();
    const m = viewDate.getUTCMonth();
    const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const rows: { date: Date; activities: Activity[] }[] = [];
    for (let d = 1; d <= dim; d++) {
      const date = new Date(Date.UTC(y, m, d));
      const dayActs = filtered.filter((a) => activityOnDay(a, date));
      if (dayActs.length > 0) rows.push({ date, activities: dayActs });
    }
    return rows;
  }, [viewDate, filtered]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return filtered.filter((a) => activityOnDay(a, selectedDay));
  }, [selectedDay, filtered]);

  const goToMonth = (offset: number) => {
    const y = viewDate.getUTCFullYear();
    const m = viewDate.getUTCMonth();
    setViewDate(utcMonthStart(y, m + offset));
    setSelectedDay(null);
  };

  const goToToday = () => {
    const t = utcTodayParts();
    setViewDate(utcMonthStart(t.y, t.m));
    setSelectedDay(new Date(Date.UTC(t.y, t.m, t.d)));
  };

  const openMobileCalendar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileCalOpen(true);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAddActivity = () => {
    if (!isLoggedIn) {
      showToast("Please sign in to publish an activity.");
      router.push("/login?next=/calendar");
      return;
    }
    setShowModal(true);
  };

  const openDetail = useMemo(() => {
    const open = createOpenDetailHandler(setDetail);
    return (a: Activity) => {
      setMobileCalOpen(false);
      open(a);
    };
  }, []);

  const renderCalendarGrid = (compact?: boolean) => {
    const t = utcTodayParts();
    const todayUtc = new Date(Date.UTC(t.y, t.m, t.d));

    return (
      <>
        <div className="cal-grid weekdays">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="cal-grid">
          {calDays.map(({ date, inMonth }, i) => {
            const isToday = isSameUtcDay(date, todayUtc);
            const isSelected = selectedDay ? isSameUtcDay(date, selectedDay) : false;
            const dayActs = filtered.filter((a) => activityOnDay(a, date));
            const maxEvts = compact ? 2 : 3;

            return (
              <div
                key={i}
                className={`cal-cell ${!inMonth ? "other" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => inMonth && setSelectedDay(date)}
                onKeyDown={(e) => {
                  if (inMonth && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setSelectedDay(date);
                  }
                }}
                role="button"
                tabIndex={inMonth ? 0 : -1}
                aria-label={`${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`}
              >
                <div className="daynum">{date.getUTCDate()}</div>
                {dayActs.slice(0, maxEvts).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="evt evt-btn"
                    style={{ background: colorFor(a.type_name, TYPE_COLORS) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(a);
                    }}
                    title={a.name}
                  >
                    {a.name}
                  </button>
                ))}
                {dayActs.length > maxEvts && (
                  <span className="cal-more">+{dayActs.length - maxEvts} more</span>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
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
        onAddActivity={openAddActivity}
        onLoginRequired={() => showToast("Please sign in to publish an activity.")}
      />

      <div className="page-layout page-layout--single page-layout--calendar">
        <main className="page-main page-main--full">
          <section className="panel toolbar">
            <div className="toolbar-top">
              <div>
                <h2 className="section-title">Event Calendar</h2>
                <p className="section-sub">All times displayed in UTC</p>
              </div>
              <AdminNavLink className="panel-admin-link" />
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

          <section className="panel cal-panel">
            <div className="cal-header">
              <div className="cal-nav">
                <button type="button" className="icon-btn" onClick={() => goToMonth(-1)}>‹</button>
                <button type="button" className="cal-month-title mobile-only" onClick={openMobileCalendar} aria-label="Open full calendar">
                  {MONTHS[viewDate.getUTCMonth()]} {viewDate.getUTCFullYear()}
                </button>
                <h2 className="desktop-only">{MONTHS[viewDate.getUTCMonth()]} {viewDate.getUTCFullYear()}</h2>
                <button type="button" className="icon-btn" onClick={() => goToMonth(1)}>›</button>
              </div>
              <div className="cal-header-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={goToToday}>Today</button>
                <button type="button" className="btn btn-outline btn-sm mobile-only" onClick={openMobileCalendar}>Full calendar</button>
              </div>
            </div>

            <div className="cal-desktop-only">
              <div className="cal-scroll-wrap">
                <div className="cal-scroll-inner">{renderCalendarGrid()}</div>
              </div>
            </div>

            <div className="cal-mobile-agenda mobile-only">
              {monthAgenda.length === 0 ? (
                <p className="cal-agenda-empty">No events this month. Tap the month name or Full calendar to browse dates.</p>
              ) : (
                monthAgenda.map(({ date, activities: dayActs }) => {
                  const todayUtc = new Date(Date.UTC(utcTodayParts().y, utcTodayParts().m, utcTodayParts().d));
                  const isToday = isSameUtcDay(date, todayUtc);
                  return (
                    <div
                      key={date.toISOString()}
                      className={`cal-agenda-row ${isToday ? "today" : ""}`}
                      onClick={() => setSelectedDay(date)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedDay(date);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="cal-agenda-date">
                        <span className="cal-agenda-wd">{WEEKDAYS[(date.getUTCDay() + 6) % 7]}</span>
                        <span className="cal-agenda-day">{date.getUTCDate()}</span>
                      </div>
                      <div className="cal-agenda-events">
                        {dayActs.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className="cal-agenda-evt"
                            style={{ borderLeftColor: colorFor(a.type_name, TYPE_COLORS) }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(a);
                            }}
                          >
                            <span className="cal-agenda-evt-name no-cap">{a.name}</span>
                            <span className="cal-agenda-evt-meta no-cap">{a.type_name}{a.callsign ? `, ${a.callsign}` : ""}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedDay && (
              <section className="cal-day-panel">
                <div className="cal-day-panel-head">
                  <h3>
                    {selectedDay.getUTCDate()} {MONTHS[selectedDay.getUTCMonth()]} {selectedDay.getUTCFullYear()} UTC
                  </h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedDay(null)}>
                    Close
                  </button>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <p className="cal-agenda-empty">No events on this day.</p>
                ) : (
                  <div className="cal-day-panel-list">
                    {selectedDayEvents.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="cal-agenda-evt"
                        style={{ borderLeftColor: colorFor(a.type_name, TYPE_COLORS) }}
                        onClick={() => openDetail(a)}
                      >
                        <span className="cal-agenda-evt-name no-cap">{a.name}</span>
                        <span className="cal-agenda-evt-meta no-cap">
                          {a.type_name}{a.callsign ? `, ${a.callsign}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>
        </main>
      </div>

      {mobileCalOpen && (
        <div className="cal-fullscreen-overlay" onClick={() => setMobileCalOpen(false)}>
          <div className="cal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="cal-fullscreen-head">
              <div className="cal-nav">
                <button type="button" className="icon-btn" onClick={() => goToMonth(-1)}>‹</button>
                <h2>{MONTHS[viewDate.getUTCMonth()]} {viewDate.getUTCFullYear()}</h2>
                <button type="button" className="icon-btn" onClick={() => goToMonth(1)}>›</button>
              </div>
              <div className="cal-header-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={goToToday}>Today</button>
                <button type="button" className="icon-btn" onClick={() => setMobileCalOpen(false)} aria-label="Close calendar">×</button>
              </div>
            </div>
            <p className="cal-scroll-hint">Swipe sideways to view all days</p>
            <div className="cal-scroll-wrap">
              <div className="cal-scroll-inner">{renderCalendarGrid(true)}</div>
            </div>
          </div>
        </div>
      )}

      {detail && <ActivityDetailModal activity={detail} onClose={() => setDetail(null)} />}

      {showModal && (
        <ActivityModal
          activityTypes={activityTypes}
          editing={null}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { setShowModal(false); refresh(); showToast(msg || "Activity saved!"); }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  );
}
