"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { Activity } from "@/types/database";
import { TYPE_COLORS } from "@/types/database";
import { colorFor, fmtUTC, statusOf } from "@/lib/activity-utils";
import { Flame, MapPin, Radio } from "lucide-react";

interface Props {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}

export function FeaturedActivities({ activities, onSelect }: Props) {
  if (activities.length === 0) return null;

  return (
    <section className="featured-section" id="featured" aria-labelledby="featured-heading">
      <div className="featured-inner">
        <div className="featured-head">
          <div>
            <p className="featured-eyebrow">
              <Flame size={14} aria-hidden="true" />
              On air &amp; happening today
            </p>
            <h2 id="featured-heading">Today&apos;s Featured Activities</h2>
            <p className="featured-sub">The biggest ham radio events right now, picked for you.</p>
          </div>
          <Link href="/calendar" className="btn btn-outline btn-sm featured-view-all">
            View full calendar
          </Link>
        </div>

        <div className="featured-grid">
          {activities.map((a) => {
            const live = statusOf(a) === "live";
            const image = a.image_url || a.logo_url;
            const typeColor = colorFor(a.type_name, TYPE_COLORS);

            return (
              <button
                key={a.id}
                type="button"
                className="featured-card"
                onClick={() => onSelect(a)}
                style={{ "--featured-accent": typeColor } as CSSProperties}
              >
                <div className="featured-card-visual">
                  {image ? (
                    <img src={image} alt="" className="featured-card-img" />
                  ) : (
                    <div className="featured-card-placeholder" aria-hidden="true">
                      <Radio size={28} />
                    </div>
                  )}
                  <span className="featured-type-badge" style={{ background: typeColor }}>
                    {a.type_name}
                  </span>
                  {live && (
                    <span className="featured-live-badge">
                      <span className="pulse-dot" />
                      Live
                    </span>
                  )}
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title no-cap">{a.name}</h3>
                  <p className="featured-card-meta no-cap">
                    {a.callsign && <span>{a.callsign}</span>}
                    {a.callsign && a.country && <span className="featured-dot">·</span>}
                    {a.country && (
                      <span className="featured-country">
                        <MapPin size={12} aria-hidden="true" />
                        {a.country}
                      </span>
                    )}
                  </p>
                  <p className="featured-card-time no-cap">{fmtUTC(a.start_at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
