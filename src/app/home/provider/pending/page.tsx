import { redirect } from "next/navigation";
import Tabs from "@/components/Tabs";
import BookingTable from "@/components/BookingTable";
import { getProviderBookings, getViewer } from "@/lib/data";

const TABS = [
  { key: "booking", label: "Bookings Pending Approval" },
  { key: "join", label: "Join Neighborhood Requests" },
];

export default async function ProviderAwaitingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer?.provider) redirect("/login");
  const { tab = "booking" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = active.key === "booking" ? await getProviderBookings(String(viewer.provider._id), "pending") : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs tabs={TABS} selected={active.key} basePath="/home/provider/pending" />
      <div className="content-box">
        <div className="content-title">{active.label}</div>
        {active.key === "booking" ? (
          <BookingTable rows={rows} who="provider" accept />
        ) : (
          <div className="empty-state">No pending join requests</div>
        )}
      </div>
    </div>
  );
}
