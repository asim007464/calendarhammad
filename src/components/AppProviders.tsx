"use client";

import { SupportProvider } from "@/components/SupportProvider";
import { AiAssistant } from "@/components/AiAssistant";
import { MobileInstallBanner } from "@/components/MobileInstallBanner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupportProvider>
      {children}
      <MobileInstallBanner />
      <AiAssistant />
    </SupportProvider>
  );
}
