"use client";

import { SupportProvider } from "@/components/SupportProvider";
import { AiAssistant } from "@/components/AiAssistant";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupportProvider>
      {children}
      <AiAssistant />
    </SupportProvider>
  );
}
