"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import Modal from "@/components/Modal";
import TimeRangeFields, { EMPTY_TIME, TimeParts, partsToTime24 } from "@/components/TimeRangeFields";
import { formatTimeCompact, formatTime, fromTime24 } from "@/lib/format";

export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  type: "booking" | "availability";
  label?: string; // counterpart name for bookings
  kind?: "recurring" | "oneTime";
  ruleId?: string; // owning availability rule
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthCells(month: Dayjs) {
  const first = month.startOf("month");
  const daysInMonth = month.daysInMonth();
  const leading = first.day();
  const cells: { date: Dayjs; inMonth: boolean }[] = [];
  for (let i = leading; i > 0; i--) cells.push({ date: first.subtract(i, "day"), inMonth: false });
  for (let d = 0; d < daysInMonth; d++) cells.push({ date: first.add(d, "day"), inMonth: true });
  while (cells.length % 7 !== 0) {
    cells.push({ date: cells[cells.length - 1].date.add(1, "day"), inMonth: false });
  }
  return cells;
}

/**
 * Month calendar shared by the dashboards and schedule pages.
 * mode "provider" adds the day drawer with add/edit/delete of one-time
 * availabilities (working, unlike the original); mode "customer" gets a
 * read-only day drawer of bookings; mode "static" has no interactions.
 */
export default function CalendarMonth({
  events,
  size = "full",
  mode = "static",
  showRecurringLink = false,
}: {
  events: CalEvent[];
  size?: "small" | "full";
  mode?: "static" | "customer" | "provider";
  showRecurringLink?: boolean;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id?: string } | null>(null);
  const [start, setStart] = useState<TimeParts>(EMPTY_TIME);
  const [end, setEnd] = useState<TimeParts>(EMPTY_TIME);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [detailsOf, setDetailsOf] = useState<CalEvent | null>(null);

  const cells = monthCells(month);
  const byDate = new Map<string, CalEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => (a.type === b.type ? a.startTime.localeCompare(b.startTime) : a.type === "booking" ? -1 : 1));
  }

  const interactive = mode !== "static" && size === "full";
  const dayEvents = openDay ? (byDate.get(openDay) ?? []) : [];

  function beginAdd() {
    setEditing({});
    setStart(EMPTY_TIME);
    setEnd(EMPTY_TIME);
    setError("");
  }

  function beginEdit(e: CalEvent) {
    setEditing({ id: e.ruleId });
    setStart(fromTime24(e.startTime));
    setEnd(fromTime24(e.endTime));
    setError("");
  }

  async function saveOneTime() {
    const s = partsToTime24(start);
    const en = partsToTime24(end);
    if (!s || !en || s >= en) {
      setError("Please enter a valid time block.");
      return;
    }
    setBusy(true);
    const res = editing?.id
      ? await fetch(`/api/availabilities/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startTime: s, endTime: en }),
        })
      : await fetch("/api/availabilities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "oneTime", date: openDay, startTime: s, endTime: en }),
        });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong.");
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function deleteOneTime() {
    if (!editing?.id) return;
    setBusy(true);
    await fetch(`/api/availabilities/${editing.id}`, { method: "DELETE" });
    setBusy(false);
    setEditing(null);
    router.refresh();
  }

  const pillFont = size === "small" ? 10 : 11;
  const cellMin = size === "small" ? 50 : 96;

  return (
    <div className="cal" style={{ padding: size === "small" ? 8 : 16, height: "100%" }}>
      <div className="cal-selector" style={{ fontSize: size === "small" ? 13 : 14 }}>
        <button className="cal-arrow" onClick={() => setMonth((m) => m.subtract(1, "month"))}>
          &lt;
        </button>
        <div className="cal-month">{month.format("MMM YYYY")}</div>
        <button className="cal-arrow" onClick={() => setMonth((m) => m.add(1, "month"))}>
          &gt;
        </button>
      </div>
      <div className="cal-weekdays" style={{ fontSize: size === "small" ? 12 : 13 }}>
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map(({ date, inMonth }) => {
          const iso = date.format("YYYY-MM-DD");
          const list = byDate.get(iso) ?? [];
          return (
            <div
              key={iso}
              className={`cal-cell${inMonth ? "" : " cal-cell--out"}`}
              style={{ minHeight: cellMin, cursor: interactive ? "pointer" : "default" }}
              onClick={interactive ? () => setOpenDay(iso) : undefined}
            >
              <span className="cal-daynum" style={{ fontSize: size === "small" ? 12 : 13 }}>
                {date.format("D")}
              </span>
              <div style={{ marginTop: 5 }}>
                {list.map((e) => (
                  <div
                    key={e.id}
                    className={`cal-pill ${e.type === "booking" ? "cal-pill--booking" : "cal-pill--availability"}`}
                    style={{ fontSize: pillFont }}
                  >
                    {formatTimeCompact(e.startTime)} - {formatTimeCompact(e.endTime)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showRecurringLink ? (
        <Link
          href="/home/provider/availabilities"
          style={{
            marginTop: 12,
            background: "#b6c78ae2",
            padding: "7px 14px",
            fontSize: 14,
            color: "#0f0c0c",
            borderRadius: 6,
            width: "100%",
            fontWeight: 600,
            textAlign: "center",
            display: "block",
          }}
        >
          View Recurring Availabilities
        </Link>
      ) : null}

      {openDay ? (
        <Modal
          title={`${mode === "provider" ? "Availabilities" : "Bookings"} for ${dayjs(openDay).format("M/D/YY")}`}
          onClose={() => {
            setOpenDay(null);
            setEditing(null);
            setDetailsOf(null);
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
            {dayEvents.length === 0 ? <div className="empty-state">Nothing scheduled this day</div> : null}
            {dayEvents.map((e) => (
              <div
                key={e.id}
                style={{
                  background: e.type === "booking" ? "rgba(219, 157, 187, 0.4)" : "var(--green-tab)",
                  padding: "6px 15px",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: 36, margin: "5px 0" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6e6e6e" }}>Times</div>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>
                      {formatTime(e.startTime)} - {formatTime(e.endTime)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6e6e6e" }}>
                      {e.type === "booking" ? "Customer" : "Service"}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>
                      {e.type === "booking" ? (e.label ?? "Booking") : e.kind === "recurring" ? "Recurring" : "Babysitting"}
                    </div>
                  </div>
                </div>
                {e.type === "booking" ? (
                  <button className="btn-action" style={{ background: "var(--pink)" }} onClick={() => setDetailsOf(e)}>
                    DETAILS
                  </button>
                ) : mode === "provider" && e.kind === "oneTime" ? (
                  <button className="btn-action" onClick={() => beginEdit(e)}>
                    EDIT
                  </button>
                ) : null}
              </div>
            ))}

            {detailsOf ? (
              <div style={{ border: "1px solid lightgray", background: "#f5f5f5", borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Booking Details</div>
                <div style={{ fontSize: 14 }}>
                  {dayjs(detailsOf.date).format("MMM. D, YYYY")} · {formatTime(detailsOf.startTime)} –{" "}
                  {formatTime(detailsOf.endTime)}
                  {detailsOf.label ? ` · ${detailsOf.label}` : ""}
                </div>
              </div>
            ) : null}

            {mode === "provider" && !editing ? (
              <button style={{ color: "gray", marginTop: 10, fontSize: 15, textAlign: "left" }} onClick={beginAdd}>
                + Add New
              </button>
            ) : null}

            {mode === "provider" && editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 8 }}>
                <div className="modal-title" style={{ margin: 0 }}>
                  {editing.id ? "Edit Time Block" : "New Time Block"}
                </div>
                <div className="form-label">Duration</div>
                <TimeRangeFields start={start} end={end} onStart={setStart} onEnd={setEnd} />
                {error ? <div className="form-error">{error}</div> : null}
                <div style={{ display: "flex", width: "100%", gap: 10, marginTop: 4 }}>
                  <button className="btn-action" style={{ flex: 1, padding: "6px 14px" }} disabled={busy} onClick={saveOneTime}>
                    {editing.id ? "Confirm" : "Add"}
                  </button>
                  {editing.id ? (
                    <button className="btn-danger" style={{ flex: 1 }} disabled={busy} onClick={deleteOneTime}>
                      Delete
                    </button>
                  ) : (
                    <button className="btn-danger" style={{ flex: 1, background: "#c9c9c9", color: "#333" }} onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
