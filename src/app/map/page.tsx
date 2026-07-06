import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Activity Map | QSO Dates",
  description:
    "Map view for amateur radio events, nets, and field activities on QSO Dates. Coming soon.",
  path: "/map",
});

export default function MapPage() {
  return (
    <>
      <Topbar />
      <main className="map-page">
        <div className="map-page-inner panel">
          <div className="map-page-icon" aria-hidden="true">
            <MapPin size={40} />
          </div>
          <h1>Activity Map</h1>
          <p className="section-sub">
            A worldwide map of ham radio events, nets, POTA/SOTA activations, and club meetings is on the way.
            You will be able to explore what is happening near you at a glance.
          </p>
          <div className="map-page-actions">
            <Link href="/activities" className="btn btn-primary">
              See featured activities
            </Link>
            <Link href="/calendar" className="btn btn-outline">
              Open calendar
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
