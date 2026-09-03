import { redirect } from "next/navigation";
import CalendarMonth from "@/components/CalendarMonth";
import { getCalendarEvents, getViewer } from "@/lib/data";

export default async function ProviderSchedulePage() {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const events = await getCalendarEvents("provider", String(viewer.provider._id));
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="dash-card" style={{ flex: 1 }}>
        <CalendarMonth events={events} size="full" mode="provider" showRecurringLink />
      </div>
    </div>
  );
}
