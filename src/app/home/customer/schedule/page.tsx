import { redirect } from "next/navigation";
import CalendarMonth from "@/components/CalendarMonth";
import { getCalendarEvents, getViewer } from "@/lib/data";

export default async function CustomerSchedulePage() {
  const viewer = await getViewer();
  if (!viewer?.customer) redirect("/login");
  const events = await getCalendarEvents("customer", String(viewer.customer._id));
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="dash-card" style={{ flex: 1 }}>
        <CalendarMonth events={events} size="full" mode="customer" />
      </div>
    </div>
  );
}
