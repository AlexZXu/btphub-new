import dayjs from "dayjs";
import BookingTable from "@/components/BookingTable";
import CalendarMonth, { CalEvent } from "@/components/CalendarMonth";
import type { BookingRow } from "@/lib/data";

/** Shared customer/provider home dashboard (greeting, tables, mini calendar). */
export default function DashboardHome({
  firstName,
  neighborhoodName,
  who,
  upcoming,
  past,
  pending,
  events,
}: {
  firstName: string;
  neighborhoodName: string;
  who: "customer" | "provider";
  upcoming: BookingRow[];
  past: BookingRow[];
  pending: BookingRow[];
  events: CalEvent[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <h1 className="font-display" style={{ fontSize: 25, fontWeight: 600, color: "#1c1e1a" }}>
          Hi {firstName}, welcome to {neighborhoodName}
        </h1>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#8a8a8a", whiteSpace: "nowrap" }}>
          {dayjs().format("dddd, MMM. D, YYYY")}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 24, minHeight: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div className="dash-card">
            <div className="dash-card-title">Upcoming Bookings</div>
            <BookingTable rows={upcoming.slice(0, 4)} who={who} size="small" />
          </div>
          <div className="dash-card" style={{ flex: 1 }}>
            <div className="dash-card-title">Past Bookings</div>
            <BookingTable rows={past.slice(0, 4)} who={who} size="small" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div className="dash-card" style={{ padding: 5 }}>
            <CalendarMonth events={events} size="small" mode="static" />
          </div>
          <div className="dash-card" style={{ flex: 1 }}>
            <div className="dash-card-title">Awaiting Response</div>
            <div className="dash-card-sub">Bookings pending approval</div>
            <BookingTable rows={pending.slice(0, 3)} who={who} size="small" />
            <div className="dash-card-sub">Neighborhood join requests</div>
            <div className="empty-state">No pending join requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}
