"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { SERVICE_TYPES } from "@/lib/constants";
import { RatesTable, initials, computeAgeFromYears } from "@/app/home/customer/find/profile-bits";
import { formatDate } from "@/lib/format";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  neighborhood: string;
  birthday: string;
  phone: string;
  startDate: string;
  bio: string;
  rates: { serviceType: string; rate: number }[];
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontWeight: 500, fontSize: 13, color: "#482f2f" }}>{label}</div>
      <div style={{ fontSize: 15, marginTop: 2, marginBottom: 6 }}>{value}</div>
    </div>
  );
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "details">("info");
  const [editingRates, setEditingRates] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function beginEditRates() {
    const d: Record<string, string> = {};
    for (const r of profile.rates) d[r.serviceType] = String(r.rate);
    setDraft(d);
    setEditingRates(true);
  }

  async function saveRates() {
    const rates = Object.entries(draft)
      .filter(([, v]) => v !== "" && Number.isFinite(parseFloat(v)))
      .map(([serviceType, v]) => ({ serviceType, rate: parseFloat(v) }));
    setBusy(true);
    await fetch("/api/rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates }),
    });
    setBusy(false);
    setEditingRates(false);
    router.refresh();
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        padding: 28,
        borderRadius: 10,
        border: "1px solid var(--border-soft)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        width: "100%",
        height: "100%",
        display: "flex",
        gap: 32,
        alignItems: "center",
      }}
    >
      <div style={{ flex: 0.9, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "var(--green-tab)",
            border: "2px solid #a7a4a4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 600,
            color: "#3d4a2c",
          }}
        >
          {initials(profile.firstName, profile.lastName)}
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: "#482f2f" }}>Name</div>
          <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}>
            {profile.firstName} {profile.lastName}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, width: "100%" }}>
          {(
            [
              ["info", "Personal Profile"],
              ["details", "Public Profile"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 20px",
                fontSize: 14,
                borderRadius: 100,
                background: tab === key ? "var(--green-tab)" : "#eee",
                color: "#211b1b",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {tab === "info" ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: "#482f2f" }}>Bio</div>
              <div style={{ maxHeight: 100, overflow: "auto", fontSize: 15, marginBottom: 14 }}>{profile.bio || "—"}</div>
            </div>
            <div style={{ display: "flex", gap: 25 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Neighborhood" value={profile.neighborhood} />
                <Field label="Birthday" value={formatDate(profile.birthday)} />
                <Field label="Phone" value={profile.phone || "—"} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Start Date" value={formatDate(profile.startDate)} />
                <Field label="Email" value={profile.email} />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              {editingRates ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SERVICE_TYPES.map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 80, fontSize: 14 }}>{t}</div>
                      <input
                        className="form-input"
                        style={{ width: 110 }}
                        placeholder="$/hr"
                        value={draft[t] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [t]: e.target.value.replace(/[^\d.]/g, "") }))}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button className="btn-action" disabled={busy} onClick={saveRates}>
                      Submit
                    </button>
                    <button className="btn-action" style={{ background: "#c9c9c9" }} onClick={() => setEditingRates(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <RatesTable rates={profile.rates} />
                  <button className="btn-block" style={{ marginTop: 12 }} onClick={beginEditRates}>
                    Update Preferred Rates
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 25 }}>
              <div style={{ flex: 1 }}>
                <Field label="Age" value={String(dayjs().diff(profile.birthday, "year"))} />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Years of Experience" value={String(computeAgeFromYears(profile.startDate))} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: "#482f2f" }}>Bio</div>
              <div style={{ maxHeight: 100, overflow: "auto", fontSize: 15 }}>{profile.bio || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Preferred Rates</div>
              <RatesTable rates={profile.rates} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
