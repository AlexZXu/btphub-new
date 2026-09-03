"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StateRow {
  code: string;
  name: string;
  minHourlyWage: number;
}

export default function StateList({ states }: { states: StateRow[] }) {
  const router = useRouter();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [wage, setWage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(code: string) {
    setBusy(true);
    await fetch(`/api/admin/states/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minHourlyWage: wage }),
    });
    setBusy(false);
    setEditingCode(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div className="admin-heading" style={{ marginTop: 16 }}>
        States: <span style={{ fontWeight: 600 }}>{states.length}</span>
      </div>
      {states.map((s) => (
        <div key={s.code} className="admin-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
            <div className="font-serif" style={{ fontSize: 20, minWidth: 48 }}>
              {s.code}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>Full Name</div>
              <div className="font-serif" style={{ fontSize: 15 }}>{s.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>Min Hourly Wage</div>
              {editingCode === s.code ? (
                <input
                  className="form-input"
                  style={{ width: 100 }}
                  value={wage}
                  onChange={(e) => setWage(e.target.value.replace(/[^\d.]/g, ""))}
                />
              ) : (
                <div className="font-serif" style={{ fontSize: 15 }}>${s.minHourlyWage.toFixed(2)}</div>
              )}
            </div>
          </div>
          {editingCode === s.code ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-action" disabled={busy} onClick={() => save(s.code)}>
                Submit
              </button>
              <button className="btn-action" style={{ background: "#c9c9c9" }} onClick={() => setEditingCode(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn-action"
              onClick={() => {
                setEditingCode(s.code);
                setWage(String(s.minHourlyWage));
              }}
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
