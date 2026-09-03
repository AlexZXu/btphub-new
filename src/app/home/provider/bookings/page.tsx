import { redirect } from "next/navigation";
import Tabs from "@/components/Tabs";
import BookingTable from "@/components/BookingTable";
import { BookingScope, getProviderBookings, getViewer } from "@/lib/data";

const TABS = [
  { key: "upcoming", label: "Upcoming Bookings", scope: "upcoming" as BookingScope },
  { key: "past", label: "Past Bookings", scope: "past" as BookingScope },
  { key: "cancelled", label: "Cancelled Bookings", scope: "cancelled" as BookingScope },
];

export default async function ProviderBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const { tab = "upcoming" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = await getProviderBookings(String(viewer.provider._id), active.scope);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs tabs={TABS} selected={active.key} basePath="/home/provider/bookings" />
      <div className="content-box">
        <div className="content-title">{active.label}</div>
        <BookingTable
          rows={rows}
          who="provider"
          showStatus={active.key === "upcoming"}
          cancelable={active.key === "upcoming"}
        />
      </div>
    </div>
  );
}
