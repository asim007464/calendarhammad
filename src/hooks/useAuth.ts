"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

export interface UserProfile {
  name: string;
  callsign: string;
  email: string;
  role: string;
  is_blocked?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile(authUser: User | null) {
      if (!authUser) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("name, callsign, email, role, is_blocked")
        .eq("id", authUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        if (!isAdminEmail(authUser.email) && !isAdminEmail(data.email)) {
          if (data.is_blocked) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            return;
          }
        }
        if (isAdminEmail(authUser.email) && data.role !== "admin") {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
              fetch("/api/admin/sync-role", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
              }).then(() => {
                setProfile((prev) => (prev ? { ...prev, role: "admin" } : prev));
              });
            }
          });
        }
      } else {
        setProfile({
          name: authUser.user_metadata?.display_name ?? "",
          callsign: authUser.user_metadata?.callsign ?? "",
          email: authUser.email ?? "",
          role: isAdminEmail(authUser.email) ? "admin" : "member",
        });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const isSuperAdmin = isAdminEmail(user?.email) || isAdminEmail(profile?.email);
  const isAdmin = isSuperAdmin || profile?.role === "admin";
  const canAccessAdmin = isAdmin;

  return {
    user,
    profile,
    loading,
    isAdmin,
    isSuperAdmin,
    canAccessAdmin,
    isLoggedIn: !!user,
  };
}
