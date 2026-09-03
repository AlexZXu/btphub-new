"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import TimeRangeFields, { EMPTY_TIME, TimeParts, partsToTime24 } from "@/components/TimeRangeFields";
import type { AvailabilityRow } from "@/lib/data";
import { PencilIcon } from "@/components/icons";
import { WEEKDAYS, formatDate, formatTime, fromTime24 } from "@/lib/format";

const SINGLE_LABEL: Record<string, string> = {
  recurring: "Recurring",
  oneTime: "One-Time",
  exclusion: "Exclusion",
};

export default function AvailabilitiesManager({
  kind,
  title,
  rules,
}: {
  kind: "recurring" | "oneTime" | "exclusion";
  title: string;
  rules: AvailabilityRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AvailabilityRow | "new" | null>(null);
  const [weekday, setWeekday] = useState(2);
  const [repeats, setRepeats] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState<TimeParts>(EMPTY_TIME);
  const [end, setEnd] = useState<TimeParts>(EMPTY_TIME);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRecurring = kind === "recurring";
  const cols = isRecurring ? "0.7fr 1.2fr 0.7fr 0.7fr 0.9fr 40px" : "0.8fr 1fr 1fr 40px";

  function beginNew() {
    setEditing("new");
    setWeekday(2);
    setRepeats("weekly");
    setStartDate("");
    setEndDate("");
    setDate("");
    setStart(EMPTY_TIME);
    setEnd(EMPTY_TIME);
    setError("");
  }

  function beginEdit(rule: AvailabilityRow) {
    setEditing(rule);
    setWeekday(rule.weekday ?? 2);
    setRepeats(rule.repeats ?? "weekly");
    setStartDate(rule.startDate ?? "");
    setEndDate(rule.endDate ?? "");
    setDate(rule.date ?? "");
    setStart(fromTime24(rule.startTime));
    setEnd(fromTime24(rule.endTime));
    setError("");
  }

  async function save() {
    const s = partsToTime24(start);
    const e = partsToTime24(end);
    if (!s || !e || s >= e) return setError("Please enter a valid time block.");
    if (isRecurring && (!startDate || !endDate || startDate > endDate))
      return setError("Please enter a valid period of year.");
    if (!isRecurring && !date) return setError("Please pick a date.");

    const payload = isRecurring
      ? { kind, weekday, repeats, startDate, endDate, startTime: s, endTime: e }
      : { kind, date, startTime: s, endTime: e };

    setBusy(true);
    const res =
      editing === "new"
        ? await fetch("/api/availabilities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/availabilities/${(editing as AvailabilityRow).id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error ?? "Something went wrong.");
    }
    setEditing(null);
    router.refresh();
  }

  async function remove() {
    if (editing === "new" || !editing) return;
    setBusy(true);
    await fetch(`/api/availabilities/${editing.id}`, { method: "DELETE" });
    setBusy(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="content-box" style={{ justifyContent: "space-between", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div className="content-title">{title}</div>
        <div className="thead" style={{ gridTemplateColumns: cols }}>
          <div>Weekday</div>
          <div>Time</div>
          {isRecurring ? (
            <>
              <div>Start Date</div>
              <div>End Date</div>
              <div>Repeats</div>
            </>
          ) : (
            <div>Date</div>
          )}
          <div />
        </div>
        <div className="table">
          {rules.length === 0 ? (
            <div className="empty-state" style={{ border: "none" }}>
              Nothing here yet
            </div>
          ) : null}
          {rules.map((r) => (
            <div key={r.id} className="trow" style={{ gridTemplateColumns: cols }}>
              <div>
                {isRecurring
                  ? `${WEEKDAYS[r.weekday ?? 0].slice(0, 3)}.`
                  : r.date
                    ? `${WEEKDAYS[new Date(`${r.date}T00:00:00`).getDay()].slice(0, 3)}.`
                    : "—"}
              </div>
              <div>
                {formatTime(r.startTime)} - {formatTime(r.endTime)}
              </div>
              {isRecurring ? (
                <>
                  <div>{r.startDate ? formatDate(r.startDate) : "—"}</div>
                  <div>{r.endDate ? formatDate(r.endDate) : "—"}</div>
                  <div style={{ textTransform: "capitalize" }}>{r.repeats ?? "weekly"}</div>
                </>
              ) : (
                <div>{r.date ? formatDate(r.date) : "—"}</div>
              )}
              <button className="icon-btn" onClick={() => beginEdit(r)} aria-label="Edit">
                <PencilIcon size={17} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={beginNew} className="btn-block">
        Add New {SINGLE_LABEL[kind]}
      </button>

      {editing ? (
        <Modal
          title={`${editing === "new" ? (kind === "recurring" ? "Create" : "New") : "Edit"} ${
            kind === "recurring" ? "Recurring Availability" : kind === "oneTime" ? "Time Block" : "Exclusion"
          }`}
          onClose={() => setEditing(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", fontWeight: 600 }}>
            {isRecurring ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="form-label">Period of Year</div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <span>—</span>
                    <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="form-label">Weekday</div>
                  <select className="form-input" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                    {WEEKDAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="form-label">Repeats</div>
                  <select className="form-input" value={repeats} onChange={(e) => setRepeats(e.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                  </select>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="form-label">Date</div>
                <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="form-label">Time Block</div>
              <TimeRangeFields start={start} end={end} onStart={setStart} onEnd={setEnd} />
            </div>
            {error ? <div className="form-error">{error}</div> : null}
            <div style={{ display: "flex", width: "100%", gap: 10, marginTop: 8 }}>
              <button className="btn-action" style={{ flex: 1, padding: "6px 14px" }} disabled={busy} onClick={save}>
                {editing === "new" ? "Add" : "Confirm"}
              </button>
              {editing !== "new" ? (
                <button className="btn-danger" style={{ flex: 1 }} disabled={busy} onClick={remove}>
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
