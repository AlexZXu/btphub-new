import { redirect } from "next/navigation";
import Tabs from "@/components/Tabs";
import BookingTable from "@/components/BookingTable";
import { BookingScope, getCustomerBookings, getViewer } from "@/lib/data";

const TABS = [
  { key: "upcoming", label: "Upcoming Bookings", scope: "upcoming" as BookingScope },
  { key: "requested", label: "Requested Bookings", scope: "pending" as BookingScope },
  { key: "past", label: "Past Bookings", scope: "past" as BookingScope },
  { key: "cancelled", label: "Cancelled Bookings", scope: "cancelled" as BookingScope },
];

export default async function CustomerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer?.customer) redirect("/login");
  const { tab = "upcoming" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = await getCustomerBookings(String(viewer.customer._id), active.scope);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs tabs={TABS} selected={active.key} basePath="/home/customer/bookings" />
      <div className="content-box">
        <div className="content-title">{active.label}</div>
        <BookingTable
          rows={rows}
          who="customer"
          showStatus={active.key === "upcoming" || active.key === "requested"}
          cancelable={active.key === "upcoming" || active.key === "requested"}
        />
      </div>
    </div>
  );
}
