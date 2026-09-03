"use client";

export interface TimeParts {
  hour: string;
  minute: string;
  amPm: string;
}

export const EMPTY_TIME: TimeParts = { hour: "", minute: "", amPm: "PM" };

function digitsOnly(v: string): string {
  return v.replace(/\D/g, "").slice(0, 2);
}

function PartFields({
  value,
  onChange,
}: {
  value: TimeParts;
  onChange: (v: TimeParts) => void;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input
        className="form-input"
        style={{ width: 48, textAlign: "center" }}
        value={value.hour}
        placeholder="hh"
        onChange={(e) => onChange({ ...value, hour: digitsOnly(e.target.value) })}
      />
      :
      <input
        className="form-input"
        style={{ width: 48, textAlign: "center" }}
        value={value.minute}
        placeholder="mm"
        onChange={(e) => onChange({ ...value, minute: digitsOnly(e.target.value) })}
      />
      <select
        className="form-input"
        style={{ width: 64 }}
        value={value.amPm}
        onChange={(e) => onChange({ ...value, amPm: e.target.value })}
      >
        <option>AM</option>
        <option>PM</option>
      </select>
    </span>
  );
}

/** hh:mm AM/PM — hh:mm AM/PM row used by every time-block form. */
export default function TimeRangeFields({
  start,
  end,
  onStart,
  onEnd,
}: {
  start: TimeParts;
  end: TimeParts;
  onStart: (v: TimeParts) => void;
  onEnd: (v: TimeParts) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#222c39" }}>
      <PartFields value={start} onChange={onStart} />
      <span style={{ fontWeight: 700, padding: "0 4px" }}>—</span>
      <PartFields value={end} onChange={onEnd} />
    </div>
  );
}

export function partsToTime24(p: TimeParts): string | null {
  const h = parseInt(p.hour, 10);
  const m = parseInt(p.minute || "0", 10);
  if (!Number.isFinite(h) || h < 1 || h > 12 || m < 0 || m > 59) return null;
  let hh = h % 12;
  if (p.amPm === "PM") hh += 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
