"use client";

import { useMemo, useState } from "react";
import type { AdminProviderRow } from "@/lib/data";

function InfoCol({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div className="font-serif" style={{ fontSize: 15 }}>{value}</div>
    </div>
  );
}

export default function AdminProviders({
  providers,
  states,
}: {
  providers: AdminProviderRow[];
  states: { code: string }[];
}) {
  const [nameQ, setNameQ] = useState("");
  const [nbhQ, setNbhQ] = useState("");
  const [zipQ, setZipQ] = useState("");
  const [stateQ, setStateQ] = useState("State");

  const list = useMemo(
    () =>
      providers.filter(
        (p) =>
          p.name.toLowerCase().includes(nameQ.toLowerCase()) &&
          p.neighborhoodName.toLowerCase().includes(nbhQ.toLowerCase()) &&
          p.neighborhoodZip.includes(zipQ) &&
          (stateQ === "State" || p.neighborhoodState === stateQ),
      ),
    [providers, nameQ, nbhQ, zipQ, stateQ],
  );

  const filter = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <div>
      <div style={{ marginBottom: 4, fontSize: 15, fontWeight: 600 }}>{label}</div>
      <input className="green-input" placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div style={{ margin: 20, display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        {filter("Search Provider Name", nameQ, setNameQ, "Provider Name")}
        {filter("Search Neighborhood Name", nbhQ, setNbhQ, "Neighborhood Name")}
        {filter("Search Zip", zipQ, setZipQ, "Zip")}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>State:</div>
          <select className="green-input" style={{ width: 120 }} value={stateQ} onChange={(e) => setStateQ(e.target.value)}>
            <option>State</option>
            {states.map((s) => (
              <option key={s.code}>{s.code}</option>
            ))}
          </select>
          <button className="btn-action" onClick={() => setStateQ("State")}>
            Cancel
          </button>
        </div>
      </div>
      <div className="admin-heading" style={{ margin: "0 0 12px 20px" }}>
        Providers Found: <span style={{ fontWeight: 600 }}>{list.length}</span>
      </div>
      {list.map((p) => (
        <div key={p.id} className="admin-row" style={{ justifyContent: "space-between", alignItems: "center", padding: "13px 16px" }}>
          <div style={{ display: "flex", gap: 48 }}>
            <InfoCol label="Name" value={p.name} />
            <InfoCol label="Provider Address" value={p.streetAddress} />
            <InfoCol label="NBH Name" value={p.neighborhoodName} />
            <InfoCol label="Status" value={p.status === "active" ? "Active" : "Pending"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <a className="btn-action" href={`mailto:${p.email}`}>
              Send Email
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
