"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRow } from "@/lib/data";
import { formatDate, formatTime, weekdayShort, fromTime24 } from "@/lib/format";
import { OpenIcon } from "@/components/icons";
import Modal from "@/components/Modal";

const STATUS_LABEL: Record<BookingRow["status"], string> = {
  pending: "Pending",
  accepted: "Confirmed",
  denied: "Denied",
  cancelled: "Cancelled",
};

function StatusChip({ status }: { status: BookingRow["status"] }) {
  const cls =
    status === "accepted" ? "chip chip--confirmed" : status === "pending" ? "chip chip--pending" : "chip";
  return (
    <span className={cls} style={status === "cancelled" || status === "denied" ? { background: "#e6e4e1", color: "#6b6b6b" } : undefined}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function BookingDetailsFields({ booking, who }: { booking: BookingRow; who: "customer" | "provider" }) {
  const start = fromTime24(booking.startTime);
  const end = fromTime24(booking.endTime);
  const field = (label: string, value: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      <div className="form-label">{label}</div>
      <input className="form-input" readOnly value={value} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 12 }}>
      {field("Date", booking.date)}
      {field(who === "provider" ? "Customer Name" : "Babysitter Name", who === "provider" ? booking.customerName : booking.providerName)}
      {field("Service Category", booking.serviceCategory)}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        <div className="form-label">Time Block</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#222c39" }}>
          {`${start.hour}:${start.minute} ${start.amPm}`}
          <span style={{ padding: "0 4px" }}>—</span>
          {`${end.hour}:${end.minute} ${end.amPm}`}
        </div>
      </div>
    </div>
  );
}

/**
 * Booking table shared by every dashboard and bookings page.
 * `who` picks the counterpart column ("Customer" for sitters, "Babysitter"
 * for families); `accept` adds working Accept/Deny controls.
 */
export default function BookingTable({
  rows,
  who,
  size = "normal",
  accept = false,
  showStatus = false,
  cancelable = false,
}: {
  rows: BookingRow[];
  who: "customer" | "provider";
  size?: "small" | "normal";
  accept?: boolean;
  showStatus?: boolean;
  cancelable?: boolean;
}) {
  const router = useRouter();
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const counterLabel = who === "provider" ? "Customer" : "Babysitter";
  const cols = accept
    ? "0.8fr 1.2fr 1fr 1fr 1.2fr 40px 110px"
    : `0.8fr 1.2fr 1fr 1fr 1.7fr ${size === "small" ? "30px" : "40px"}${cancelable ? " 80px" : ""}`;
  const fontSize = size === "small" ? 14 : 15;

  async function act(id: string, action: "accept" | "deny" | "cancel") {
    setBusy(true);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    setConfirmId(null);
    router.refresh();
  }

  const details = rows.find((r) => r.id === detailsId);
  const confirm = rows.find((r) => r.id === confirmId);

  if (rows.length === 0) {
    return <div className="empty-state">No bookings here yet</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="thead" style={{ gridTemplateColumns: cols }}>
        <div>Day</div>
        <div>Date</div>
        <div>Start</div>
        <div>End</div>
        <div>{counterLabel}</div>
        <div />
        {accept || cancelable ? <div /> : null}
      </div>
      <div className="table" style={{ fontSize }}>
        {rows.map((r) => (
          <div key={r.id} className="trow" style={{ gridTemplateColumns: cols }}>
            <div>{weekdayShort(r.date)}</div>
            <div>{formatDate(r.date)}</div>
            <div>{formatTime(r.startTime)}</div>
            <div>{formatTime(r.endTime)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {who === "provider" ? r.customerName : r.providerName}
              {showStatus ? <StatusChip status={r.status} /> : null}
            </div>
            <button className="icon-btn" onClick={() => setDetailsId(r.id)} aria-label="Booking details">
              <OpenIcon size={size === "small" ? 15 : 19} />
            </button>
            {accept ? (
              <button className="btn-action" onClick={() => setConfirmId(r.id)}>
                Accept/Deny
              </button>
            ) : cancelable && (r.status === "pending" || r.status === "accepted") ? (
              <button className="btn-danger" style={{ padding: "3px 10px", fontSize: 13 }} onClick={() => act(r.id, "cancel")} disabled={busy}>
                Cancel
              </button>
            ) : accept || cancelable ? (
              <div />
            ) : null}
          </div>
        ))}
      </div>

      {details ? (
        <Modal title="Booking Details" onClose={() => setDetailsId(null)}>
          <BookingDetailsFields booking={details} who={who} />
        </Modal>
      ) : null}

      {confirm ? (
        <Modal title="Accept/Deny Booking" onClose={() => setConfirmId(null)}>
          <div
            style={{
              border: "1px solid lightgray",
              padding: 12,
              marginTop: 8,
              background: "#f5f5f5",
              borderRadius: 8,
              width: "100%",
            }}
          >
            <BookingDetailsFields booking={confirm} who={who} />
          </div>
          <div style={{ display: "flex", width: "100%", gap: 10, marginTop: 8 }}>
            <button className="btn-action" style={{ width: "100%", padding: "6px 14px" }} disabled={busy} onClick={() => act(confirm.id, "accept")}>
              Accept
            </button>
            <button className="btn-danger" style={{ width: "100%" }} disabled={busy} onClick={() => act(confirm.id, "deny")}>
              Deny
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
