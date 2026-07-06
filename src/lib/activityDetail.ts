import type { Activity } from "@/types/database";

export function logActivityView(id: string) {
  fetch(`/api/activities/${id}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: "view" }),
  }).catch(() => {
    /* non-blocking analytics */
  });
}

export function createOpenDetailHandler(setDetail: (activity: Activity | null) => void) {
  return (activity: Activity) => {
    setDetail(activity);
    logActivityView(activity.id);
  };
}
