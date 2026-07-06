import { CalendarClient } from "@/components/CalendarClient";
import { loadCalendarPageData } from "@/lib/loadActivities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Event Calendar | QSO Dates",
  description:
    "Monthly UTC calendar of amateur radio contests, activations, DXpeditions, and special event stations on QSO Dates.",
  path: "/calendar",
});

export default async function CalendarPage() {
  const { activities, activityTypes } = await loadCalendarPageData();

  return <CalendarClient initialActivities={activities} activityTypes={activityTypes} />;
}
