import { Sidebar } from "@/components/dashboard/sidebar";
import { KillSwitchBanner } from "@/components/dashboard/kill-switch-banner";
import { KillSwitchProvider } from "@/context/kill-switch-context";
import { TimeframeProvider } from "@/context/timeframe-context";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimeframeProvider>
      <KillSwitchProvider>
        <div className="flex min-h-screen bg-bg">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <KillSwitchBanner />
            {children}
          </div>
        </div>
      </KillSwitchProvider>
    </TimeframeProvider>
  );
}
