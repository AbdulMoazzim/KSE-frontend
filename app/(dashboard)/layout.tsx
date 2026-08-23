import { Sidebar } from "@/components/dashboard/sidebar";
import { KillSwitchBanner } from "@/components/dashboard/kill-switch-banner";
import { KillSwitchProvider } from "@/context/kill-switch-context";
import { TimeframeProvider } from "@/context/timeframe-context";
import { MobileNavProvider } from "@/context/mobile-nav-context";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimeframeProvider>
      <KillSwitchProvider>
        <MobileNavProvider>
          <div className="flex min-h-screen bg-bg">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <KillSwitchBanner />
              {children}
            </div>
          </div>
        </MobileNavProvider>
      </KillSwitchProvider>
    </TimeframeProvider>
  );
}
