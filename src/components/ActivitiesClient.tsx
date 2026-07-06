"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Activity, ActivityType } from "@/types/database";
import { BANDS, MODES, TYPE_COLORS } from "@/types/database";
import { colorFor, fmtUTC, statusOf } from "@/lib/activity-utils";
import { getFeaturedActivities } from "@/lib/featuredActivities";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { FeaturedActivities } from "@/components/FeaturedActivities";
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

export type ActivityStatusFilter = "all" | "live" | "upcoming";

interface Props {
  initialActivities: Activity[];
  activityTypes: ActivityType[];
  statusFilter?: ActivityStatusFilter;
}

const FILTER_HEADINGS: Record<ActivityStatusFilter, { title: string; list: string; empty: string }> = {
  all: {
    title: "All Activities",
    list: "Activity List",
    empty: "No activities match your filters.",
  },
  live: {
    title: "On Air Now",
    list: "Live Activities",
    empty: "No activities are on air right now.",
  },
  upcoming: {
    title: "Upcoming",
    list: "Upcoming Activities",
    empty: "No upcoming activities scheduled.",
  },
};

export function ActivitiesClient({ initialActivities, activityTypes, statusFilter = "all" }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBand, setFilterBand] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Activity | null>(null);
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

  const displayList = useMemo(() => {
    if (statusFilter === "live") {
      return filtered.filter((a) => statusOf(a) === "live");
    }
    if (statusFilter === "upcoming") {
      return filtered
        .filter((a) => statusOf(a) === "upcoming")
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    }
    return filtered;
  }, [filtered, statusFilter]);

  const featured = useMemo(() => getFeaturedActivities(filtered, 5), [filtered]);
  const headings = FILTER_HEADINGS[statusFilter];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAddActivity = () => {
    if (!isLoggedIn) {
      showToast("Please sign in to publish an activity.");
      router.push("/login?next=/activities");
      return;
    }
    setShowModal(true);
  };

  const openDetail = useMemo(() => createOpenDetailHandler(setDetail), []);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (statusFilter !== "all") {
      document.getElementById("all-activities")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [statusFilter]);

  return (
    <>
      <Topbar
        onAddActivity={openAddActivity}
        onLoginRequired={() => showToast("Please sign in to publish an activity.")}
      />

      {statusFilter === "all" && (
        <FeaturedActivities activities={featured} onSelect={openDetail} />
      )}

      <div className="page-layout page-layout--single" id="all-activities">
        <main className="page-main page-main--full">
          <section className="panel toolbar">
            <div className="toolbar-top">
              <div>
                <h2 className="section-title">{headings.title}</h2>
                <p className="section-sub">
                  All times displayed in UTC. <Link href="/calendar">View calendar</Link>
                  {statusFilter !== "all" && (
                    <> <Link href="/activities">View all activities</Link></>
                  )}
                </p>
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

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3 className="section-title" style={{ fontSize: 18 }}>{headings.list}</h3>
                <p className="section-sub">{displayList.length} activities</p>
              </div>
            </div>
            <div className="activity-list">
              {displayList.length === 0 ? (
                <p className="live-upcoming-empty">{headings.empty}</p>
              ) : (
                displayList.map((a) => {
                  const d = new Date(a.start_at);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="acard acard-btn"
                      onClick={() => openDetail(a)}
                    >
                      <div className="acard-date">
                        <div className="mon">{MONTHS[d.getUTCMonth()].slice(0, 3).toUpperCase()}</div>
                        <div className="day">{d.getUTCDate()}</div>
                      </div>
                      <div>
                        <span className="type-badge" style={{ background: colorFor(a.type_name, TYPE_COLORS) }}>{a.type_name}</span>
                        <h3 className="no-cap">{a.name}</h3>
                        <div className="acard-meta no-cap">{a.callsign}, {fmtUTC(a.start_at)}</div>
                      </div>
                      {(a.image_url || a.logo_url) && (
                        <img src={a.image_url || a.logo_url || ""} alt="" width={48} height={48} style={{ borderRadius: 8, objectFit: "cover" }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </main>
      </div>

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
