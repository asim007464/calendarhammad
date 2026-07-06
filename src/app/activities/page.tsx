import { ActivitiesClient } from "@/components/ActivitiesClient";
import { loadCalendarPageData } from "@/lib/loadActivities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Ham Radio Activities | QSO Dates",
  description:
    "Browse featured and upcoming amateur radio activities: contests, POTA, SOTA, DXpeditions, nets, and field days worldwide.",
  path: "/activities",
});

type ActivitiesPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const { activities, activityTypes } = await loadCalendarPageData();
  const { filter } = await searchParams;
  const statusFilter = filter === "live" || filter === "upcoming" ? filter : "all";

  return (
    <ActivitiesClient
      initialActivities={activities}
      activityTypes={activityTypes}
      statusFilter={statusFilter}
    />
  );
}
