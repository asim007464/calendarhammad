import { HomeClient } from "@/components/HomeClient";
import { JsonLd } from "@/components/JsonLd";
import { loadCalendarPageData } from "@/lib/loadActivities";
import { HOME_JSON_LD, buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Ham Radio Contest Calendar | QSO Dates",
  description:
    "Browse the worldwide amateur radio event calendar: ham radio contests, POTA activations, SOTA summits, DXpeditions, field days, and special event stations in UTC.",
  path: "/",
  keywords: ["ham radio contest calendar", "amateur radio event schedule"],
});

export default async function HomePage() {
  const { activities, activityTypes, broadcast } = await loadCalendarPageData();

  return (
    <>
      <JsonLd data={HOME_JSON_LD} />
      <HomeClient initialActivities={activities} activityTypes={activityTypes} broadcast={broadcast} />
    </>
  );
}
