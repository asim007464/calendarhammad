export type RecurrenceType = "none" | "annual" | "weekly" | "monthly";

export interface ActivityType {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string | null;
  is_system?: boolean;
  created_by?: string | null;
  created_at?: string;
}

export interface Activity {
  id: string;
  user_id?: string | null;
  type_id?: string | null;
  type_name: string;
  name: string;
  description?: string;
  callsign?: string;
  organizer?: string;
  start_at: string;
  end_at?: string | null;
  recurrence: RecurrenceType;
  bands?: string[];
  modes?: string[];
  frequencies?: string;
  country?: string;
  grid?: string;
  reference?: string;
  website?: string;
  email?: string;
  qrz?: string;
  registration?: string;
  certificate?: string;
  award_details?: string;
  logo_url?: string | null;
  image_url?: string | null;
  notes?: string;
  custom_fields?: Record<string, string>;
  status?: string;
  view_count?: number;
  click_count?: number;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile | null;
}

export interface Profile {
  id: string;
  name: string;
  callsign: string;
  email?: string;
  bio?: string;
  avatar_url?: string | null;
  website?: string;
  qrz?: string;
  theme?: string;
}

export interface SupportMessage {
  id: string;
  user_id?: string | null;
  user_name: string;
  callsign: string;
  email?: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply?: string;
  created_at: string;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export interface ExternalFeed {
  id: string;
  user_id: string;
  platform: "ehamhub" | "cqhams";
  username?: string | null;
  is_active: boolean;
  last_sync_at?: string | null;
  last_error?: string | null;
}

export interface ExternalFeedItem {
  id: string;
  feed_id: string;
  external_id?: string | null;
  title: string;
  summary?: string;
  url?: string;
  published_at?: string | null;
}

export interface SocialPost {
  id: string;
  activity_id: string;
  platform: "facebook" | "instagram" | "x";
  status: "pending" | "posted" | "failed";
  post_id?: string | null;
  error_message?: string | null;
  created_at: string;
}

export const BANDS = ["160m", "80m", "40m", "30m", "20m", "17m", "15m", "12m", "10m", "6m", "2m", "70cm", "Other"];
export const MODES = ["SSB", "CW", "FT8", "FT4", "RTTY", "Digital", "Satellite", "Other"];

export const TYPE_COLORS: Record<string, string> = {
  Contest: "#ef4444",
  "Special Event": "#f59e0b",
  "Award Program": "#eab308",
  POTA: "#10b981",
  SOTA: "#06b6d4",
  DXpedition: "#8b5cf6",
  Net: "#3b82f6",
  "Field Day": "#ec4899",
  Other: "#64748b",
};

export const SOCIAL_LINKS = {
  site: "https://www.qsodates.com",
  github: "https://github.com/QSODates",
  facebook: "https://www.facebook.com/profile.php?id=61591527421511",
  instagram: "https://www.instagram.com/qsodates/",
  x: "https://x.com/QSODates",
  whatsapp: "https://wa.me/18033646918",
  whatsappDisplay: "+1 803-364-6918",
};
