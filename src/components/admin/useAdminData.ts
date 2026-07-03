"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AdminData {
  online: { name: string; callsign: string; page: string; last_seen: string; profiles?: { name: string; callsign: string } }[];
  support: { id: string; user_name: string; callsign: string; subject: string; message: string; status: string; created_at: string }[];
  activities: { id: string; name: string; type_name: string; callsign: string; start_at: string }[];
  users: { id: string; name: string; callsign: string; email: string }[];
  socialPosts: { id: string; platform: string; status: string; activity_id: string; error_message?: string }[];
}

export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Failed to load admin data");
      setLoading(false);
      return;
    }

    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      ...options.headers,
    },
  });
}
