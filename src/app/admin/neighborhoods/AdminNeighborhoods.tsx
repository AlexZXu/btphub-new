"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import type { NeighborhoodRow } from "@/lib/data";

interface StateOpt {
  code: string;
  minHourlyWage: number;
}

export default function AdminNeighborhoods({
  neighborhoods,
  states,
}: {
  neighborhoods: NeighborhoodRow[];
  states: StateOpt[];
}) {
  const router = useRouter();
  const [nameQ, setNameQ] = useState("");
  const [zipQ, setZipQ] = useState("");
  const [stateQ, setStateQ] = useState("State");
  const [editing, setEditing] = useState<NeighborhoodRow | "new" | null>(null);
  const [form, setForm] = useState({ name: "", city: "", stateCode: "", zip: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () =>
      neighborhoods.filter(
        (n) =>
          n.name.toLowerCase().includes(nameQ.toLowerCase()) &&
          n.zip.includes(zipQ) &&
          (stateQ === "State" || n.stateCode === stateQ),
      ),
    [neighborhoods, nameQ, zipQ, stateQ],
  );

  const minWage = states.find((s) => s.code === form.stateCode)?.minHourlyWage;

  function beginNew() {
    setForm({ name: "", city: "", stateCode: "", zip: "" });
    setError("");
    setEditing("new");
  }

  function beginEdit(n: NeighborhoodRow) {
    setForm({ name: n.name, city: n.city, stateCode: n.stateCode, zip: n.zip });
    setError("");
    setEditing(n);
  }

  async function save() {
    if (!form.name || !form.city || !form.stateCode || !form.zip) {
      return setError("Please fill in all required fields.");
    }
    setBusy(true);
    const res =
      editing === "new"
        ? await fetch("/api/admin/neighborhoods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch(`/api/admin/neighborhoods/${(editing as NeighborhoodRow).id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error ?? "Something went wrong.");
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(n: NeighborhoodRow) {
    const res = await fetch(`/api/admin/neighborhoods/${n.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      alert(body?.error ?? "Delete failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div style={{ margin: "20px 20px 0", display: "flex", gap: 20 }}>
        <input
          className="green-input"
          style={{ width: "100%", padding: "10px 14px", fontSize: 15 }}
          placeholder="Search Neighborhood"
          value={nameQ}
          onChange={(e) => setNameQ(e.target.value)}
        />
        <input
          className="green-input"
          style={{ width: 140 }}
          placeholder="Zip"
          value={zipQ}
          onChange={(e) => setZipQ(e.target.value)}
        />
        <select
          className="green-input"
          style={{ width: 120 }}
          value={stateQ}
          onChange={(e) => setStateQ(e.target.value)}
        >
          <option>State</option>
          {states.map((s) => (
            <option key={s.code}>{s.code}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "12px 20px 0 0" }}>
        <button className="btn-action" onClick={beginNew}>
          New Community
        </button>
      </div>
      <div className="admin-heading">
        Neighborhoods Found: <span style={{ fontWeight: 600 }}>{list.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {list.map((n) => (
          <div key={n.id} className="admin-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div className="font-serif" style={{ fontSize: 26 }}>
              {n.name}
            </div>
            <div className="admin-rule" />
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2.5fr", margin: "4px 0", width: 800, fontSize: 15 }}>
                <div>
                  {n.city}, {n.stateCode}, {n.zip}
                </div>
                <div>Members: {n.memberCount}</div>
                <div>Fee: {n.fee > 0 ? `$${n.fee}` : "Free"}</div>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <button className="btn-action" onClick={() => beginEdit(n)}>
                  Edit
                </button>
                <button className="btn-action btn-action--dark" onClick={() => remove(n)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <Modal title={editing === "new" ? "Create Neighborhood" : "Update Neighborhood"} onClose={() => setEditing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {(
              [
                ["Name", "name", "Enter Name"],
                ["City", "city", "Enter City"],
                ["Zip", "zip", "Enter Zip"],
              ] as const
            ).map(([label, key, ph]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="form-label">{label}</div>
                <input
                  className="form-input"
                  placeholder={ph}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="form-label">State</div>
              <select
                className="form-input"
                value={form.stateCode}
                onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))}
              >
                <option value="" disabled>
                  Select a state
                </option>
                {states.map((s) => (
                  <option key={s.code}>{s.code}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 14, color: "#555" }}>
              Minimum Wage: {minWage !== undefined ? `$${minWage.toFixed(2)}` : "No State Selected"}
            </div>
            {error ? <div className="form-error">{error}</div> : null}
            <button className="btn-action" style={{ width: "100%", padding: "8px 14px" }} disabled={busy} onClick={save}>
              {editing === "new" ? "Create Neighborhood" : "Update Neighborhood"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
