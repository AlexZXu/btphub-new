"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import CalendarMonth from "@/components/CalendarMonth";
import TimeRangeFields, { EMPTY_TIME, TimeParts, partsToTime24 } from "@/components/TimeRangeFields";
import type { ProviderCard } from "@/lib/data";
import type { ScheduleSlot } from "@/lib/schedule";
import { SERVICE_TYPES } from "@/lib/constants";
import { computeAgeFromYears, RatesTable, initials } from "./profile-bits";

function coversWindow(slots: ScheduleSlot[], date: string, s: string | null, e: string | null) {
  return slots.some(
    (slot) =>
      slot.date === date && (!s || !e ? true : slot.startTime <= s && slot.endTime >= e),
  );
}

export default function FindBabysitter({
  roster,
  slotsByProvider,
}: {
  roster: ProviderCard[];
  slotsByProvider: Record<string, ScheduleSlot[]>;
}) {
  const router = useRouter();
  const [filterDate, setFilterDate] = useState("");
  const [fStart, setFStart] = useState<TimeParts>(EMPTY_TIME);
  const [fEnd, setFEnd] = useState<TimeParts>(EMPTY_TIME);
  const [applied, setApplied] = useState<{ date: string; s: string | null; e: string | null } | null>(null);

  const [profileOf, setProfileOf] = useState<ProviderCard | null>(null);
  const [requestOf, setRequestOf] = useState<ProviderCard | null>(null);
  const [cameFromRequest, setCameFromRequest] = useState(false);

  const [serviceType, setServiceType] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [rStart, setRStart] = useState<TimeParts>(EMPTY_TIME);
  const [rEnd, setREnd] = useState<TimeParts>(EMPTY_TIME);
  const [reqError, setReqError] = useState("");
  const [reqOk, setReqOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    if (!applied) return roster;
    return roster.filter((p) => coversWindow(slotsByProvider[p.id] ?? [], applied.date, applied.s, applied.e));
  }, [roster, slotsByProvider, applied]);

  function applyFilter() {
    if (!filterDate) {
      setApplied(null);
      return;
    }
    setApplied({ date: filterDate, s: partsToTime24(fStart), e: partsToTime24(fEnd) });
  }

  async function submitRequest() {
    setReqError("");
    if (!requestOf) return;
    const s = partsToTime24(rStart);
    const e = partsToTime24(rEnd);
    if (!serviceType || !reqDate || !s || !e) {
      setReqError("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: requestOf.id,
        date: reqDate,
        startTime: s,
        endTime: e,
        serviceCategory: serviceType,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setReqError(body?.error ?? "Something went wrong.");
      return;
    }
    setReqOk(true);
    router.refresh();
  }

  function closeRequest() {
    setRequestOf(null);
    setReqOk(false);
    setReqError("");
  }

  const labelStyle: React.CSSProperties = { fontWeight: 500, fontSize: 14 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="tabs">
        <div className="tab tab--selected">Book a Babysitter</div>
      </div>
      <div className="content-box">
        <div className="content-title">Book a Babysitter</div>

        <div style={{ display: "flex", justifyContent: "center", gap: 25, margin: "0 auto", width: "100%", maxWidth: 1000 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <div style={labelStyle}>Booking Date</div>
            <input type="date" className="form-input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={labelStyle}>Booking Time</div>
            <TimeRangeFields start={fStart} end={fEnd} onStart={setFStart} onEnd={setFEnd} />
          </div>
        </div>
        <button className="btn-block" style={{ width: "90%", margin: "10px auto 0" }} onClick={applyFilter}>
          Filter
        </button>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
          <div className="thead" style={{ gridTemplateColumns: "2.4fr 0.8fr 0.8fr 220px" }}>
            <div>Provider Name</div>
            <div>Age</div>
            <div>Ask</div>
            <div>Actions</div>
          </div>
          <div className="table">
            {list.length === 0 ? (
              <div className="empty-state" style={{ border: "none" }}>
                No sitters available for that window — try a different date or time.
              </div>
            ) : null}
            {list.map((p) => (
              <div key={p.id} className="trow" style={{ gridTemplateColumns: "2.4fr 0.8fr 0.8fr 220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "var(--green-tab)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#3d4a2c",
                      flexShrink: 0,
                    }}
                  >
                    {initials(p.firstName, p.lastName)}
                  </div>
                  {p.firstName} {p.lastName}
                </div>
                <div>{p.age}</div>
                <div>${p.askRate}</div>
                <div style={{ display: "flex", gap: 15 }}>
                  <button className="btn-action" onClick={() => setProfileOf(p)}>
                    View Profile
                  </button>
                  <button
                    className="btn-action btn-action--dark"
                    onClick={() => {
                      setRequestOf(p);
                      setReqDate(filterDate);
                      setRStart(fStart);
                      setREnd(fEnd);
                    }}
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {profileOf ? (
        <Modal title="" width={900} onClose={() => {
          setProfileOf(null);
          if (cameFromRequest) setCameFromRequest(false);
        }}>
          <PublicProfile provider={profileOf} slots={slotsByProvider[profileOf.id] ?? []} />
        </Modal>
      ) : null}

      {requestOf && !profileOf ? (
        <Modal title={reqOk ? "Request Sent!" : `Book ${requestOf.firstName} ${requestOf.lastName}`} onClose={closeRequest}>
          {reqOk ? (
            <div style={{ padding: "16px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 16 }}>
                Your request is awaiting {requestOf.firstName}&apos;s approval — track it under Requested Bookings.
              </div>
              <button className="btn-action" onClick={closeRequest}>
                Close
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
              <button
                style={{ color: "var(--green-hover)", textAlign: "left", fontSize: 14, fontWeight: 600 }}
                onClick={() => {
                  setCameFromRequest(true);
                  setProfileOf(requestOf);
                }}
              >
                View Profile
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={labelStyle}>Service Type</div>
                <select className="form-input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                  <option value="" disabled>
                    Select your service
                  </option>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={labelStyle}>Date</div>
                <input type="date" className="form-input" value={reqDate} onChange={(e) => setReqDate(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={labelStyle}>Time Block</div>
                <TimeRangeFields start={rStart} end={rEnd} onStart={setRStart} onEnd={setREnd} />
              </div>
              {reqError ? <div className="form-error">{reqError}</div> : null}
              <button className="btn-cta" style={{ fontSize: 15, borderRadius: 6 }} disabled={busy} onClick={submitRequest}>
                Submit Request
              </button>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

function PublicProfile({ provider, slots }: { provider: ProviderCard; slots: ScheduleSlot[] }) {
  const [tab, setTab] = useState<"info" | "schedule">("info");
  const events = slots.map((s) => ({
    id: `${s.availabilityId}-${s.date}`,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    type: "availability" as const,
    kind: s.kind,
  }));
  return (
    <div style={{ display: "flex", width: "100%", gap: 32, padding: 10 }}>
      <div style={{ flex: 0.9, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "var(--green-tab)",
            border: "2px solid #a7a4a4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            fontWeight: 600,
            color: "#3d4a2c",
          }}
        >
          {initials(provider.firstName, provider.lastName)}
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="form-label" style={{ color: "#482f2f", fontSize: 13 }}>Name</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>
            {provider.firstName} {provider.lastName}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, width: "100%" }}>
          {(["info", "schedule"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px",
                fontSize: 14,
                borderRadius: 100,
                background: tab === t ? "var(--green-tab)" : "#eee",
                color: "#211b1b",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              {t === "info" ? "Profile" : "Schedule"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {tab === "info" ? (
          <>
            <div style={{ display: "flex", gap: 25 }}>
              <Field label="Age" value={String(provider.age)} />
              <Field label="Years of Experience" value={String(computeAgeFromYears(provider.startDate))} />
            </div>
            <Field label="Bio" value={provider.bio || "—"} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Preferred Rates</div>
              <RatesTable rates={provider.rates} />
            </div>
          </>
        ) : (
          <CalendarMonth events={events} size="full" mode="static" />
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{ fontWeight: 500, fontSize: 13, color: "#482f2f" }}>{label}</div>
      <div style={{ fontSize: 15 }}>{value}</div>
    </div>
  );
}
