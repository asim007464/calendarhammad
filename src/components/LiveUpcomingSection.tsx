"use client";

import Link from "next/link";
import type { Activity } from "@/types/database";
import { TYPE_COLORS } from "@/types/database";
import { colorFor, fmtUTC } from "@/lib/activity-utils";
import { CalendarClock, Radio, Zap } from "lucide-react";

interface Props {
  live: Activity[];
  upcoming: Activity[];
  onSelect: (activity: Activity) => void;
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function LiveUpcomingSection({ live, upcoming, onSelect }: Props) {
  return (
    <section className="pulse-section" id="live-upcoming" aria-labelledby="pulse-heading">
      <div className="pulse-section-head">
        <div>
          <p className="pulse-eyebrow">
            <Zap size={14} aria-hidden="true" />
            Right now on QSO Dates
          </p>
          <h2 id="pulse-heading">On Air &amp; Coming Up</h2>
          <p className="pulse-sub">Live activations and upcoming events. All times UTC.</p>
        </div>
        <Link href="/activities" className="btn btn-outline btn-sm pulse-view-all">
          View all activities
        </Link>
      </div>

      <div className="pulse-grid">
        <article className="pulse-card">
          <header className="pulse-card-head pulse-card-head--live">
            <div className="pulse-card-title">
              <Radio size={18} aria-hidden="true" />
              <h3>On Air Now</h3>
            </div>
            <span className="pulse-live-pill">
              <span className="pulse-dot" />
              Live
            </span>
          </header>

          <div className="pulse-card-body">
            {live.length === 0 ? (
              <div className="pulse-empty">
                <Radio size={32} strokeWidth={1.5} aria-hidden="true" />
                <p>No stations on air right now</p>
                <Link href="/calendar" className="btn btn-ghost btn-sm">Browse calendar</Link>
              </div>
            ) : (
              <ul className="pulse-list">
                {live.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="pulse-row"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(a);
                      }}
                    >
                      <div className="pulse-row-main">
                        <span className="type-badge" style={{ background: colorFor(a.type_name, TYPE_COLORS) }}>
                          {a.type_name}
                        </span>
                        <strong className="no-cap">{a.name}</strong>
                        {a.callsign && <span className="pulse-row-meta no-cap">{a.callsign}</span>}
                      </div>
                      <span className="pulse-row-time no-cap">{formatShortDate(a.start_at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className="pulse-card">
          <header className="pulse-card-head">
            <div className="pulse-card-title">
              <CalendarClock size={18} aria-hidden="true" />
              <h3>Coming Up</h3>
            </div>
            <span className="pulse-count">{upcoming.length} events</span>
          </header>

          <div className="pulse-card-body">
            {upcoming.length === 0 ? (
              <div className="pulse-empty">
                <CalendarClock size={32} strokeWidth={1.5} aria-hidden="true" />
                <p>No upcoming activities scheduled</p>
                <Link href="/activities" className="btn btn-ghost btn-sm">Explore activities</Link>
              </div>
            ) : (
              <ul className="pulse-list">
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="pulse-row"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(a);
                      }}
                    >
                      <div className="pulse-row-main">
                        <span className="type-badge" style={{ background: colorFor(a.type_name, TYPE_COLORS) }}>
                          {a.type_name}
                        </span>
                        <strong className="no-cap">{a.name}</strong>
                        {a.callsign && <span className="pulse-row-meta no-cap">{a.callsign}</span>}
                      </div>
                      <div className="pulse-row-schedule no-cap">
                        <span className="pulse-row-time">{formatShortDate(a.start_at)}</span>
                        {a.end_at && (
                          <span className="pulse-row-time pulse-row-time--end">to {formatShortDate(a.end_at)}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
