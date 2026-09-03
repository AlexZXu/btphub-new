"use client";

import { useMemo, useState } from "react";
import type { NeighborhoodRow } from "@/lib/data";
import { ChevronDownIcon } from "@/components/icons";

/** Search + list + selected card, shared by /neighborhoods and the signup
 *  wizard's find-neighborhood step. */
export default function NeighborhoodFinder({
  neighborhoods,
  states,
  initialSelectedId,
  joinLabel = "Join Us",
  onJoin,
}: {
  neighborhoods: NeighborhoodRow[];
  states: { code: string }[];
  initialSelectedId?: string;
  joinLabel?: string;
  onJoin: (n: NeighborhoodRow) => void;
}) {
  const [nameQ, setNameQ] = useState("");
  const [zipQ, setZipQ] = useState("");
  const [stateQ, setStateQ] = useState("State");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

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
  const selected = neighborhoods.find((n) => n.id === selectedId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0, width: "100%" }}>
      {/* search row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid var(--green-pale-border)",
          borderBottom: "none",
          borderRadius: "12px 12px 0 0",
          width: "100%",
          paddingLeft: 20,
          paddingRight: 35,
          background: "#fff",
        }}
      >
        <input
          style={{
            width: "100%",
            padding: "8px 12px 8px 20px",
            fontSize: 16,
            color: "#555",
            border: "none",
            borderRight: "1px solid var(--green-pale)",
            outline: "none",
          }}
          placeholder="Find your neighborhood"
          value={nameQ}
          onChange={(e) => setNameQ(e.target.value)}
        />
        <input
          style={{ padding: "4px 4px 4px 8px", fontSize: 16, color: "#555", width: 130, border: "none", outline: "none" }}
          placeholder="Zip Code"
          value={zipQ}
          onChange={(e) => setZipQ(e.target.value)}
        />
        <div style={{ position: "relative", margin: "5px 20px 5px 0" }}>
          <select
            style={{
              width: 130,
              fontSize: 14,
              border: "1px solid var(--border-input)",
              borderRadius: 6,
              color: "#8C8C8C",
              padding: 4,
              background: "#fff",
              appearance: "none",
            }}
            value={stateQ}
            onChange={(e) => setStateQ(e.target.value)}
          >
            <option>State</option>
            {states.map((s) => (
              <option key={s.code}>{s.code}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 8, top: 8, pointerEvents: "none" }}>
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* list */}
      <div
        style={{
          display: "flex",
          minHeight: 0,
          flexDirection: "column",
          flexGrow: 1,
          width: "100%",
          background: "var(--surface-soft)",
          border: "1px solid var(--green-pale-border)",
          borderRadius: "0 0 12px 12px",
          overflow: "auto",
          maxHeight: 420,
        }}
      >
        {list.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelectedId(n.id)}
            style={{
              background: n.id === selectedId ? "var(--green-selected)" : "#fff",
              padding: "10px 40px",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              gap: 30,
              alignItems: "center",
              borderBottom: "1px solid #f2f2f2",
            }}
          >
            <div style={{ fontSize: 20 }}>{n.name}</div>
            <div style={{ color: "#5e5c5c", fontSize: 16 }}>
              {n.city}, {n.stateCode}, {n.zip}
            </div>
          </button>
        ))}
        {list.length === 0 ? (
          <div style={{ padding: 20, color: "#8a8a8a", fontSize: 15 }}>No neighborhoods match your search.</div>
        ) : null}
      </div>

      {/* selected card / not-listed card */}
      <div
        style={{
          marginTop: 20,
          marginBottom: 12,
          width: "100%",
          background: "#fff",
          padding: "10px 0",
          border: "1px solid var(--green-pale-border)",
          borderRadius: 12,
        }}
      >
        {selected ? (
          <div style={{ width: "100%", padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "#2f4b2f" }}>
                {selected.name}
              </div>
              <div className="font-display" style={{ fontSize: 18, color: "#4f4f4f", fontWeight: 600 }}>
                {selected.city}, {selected.stateCode} {selected.zip}
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 10, justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>
                <span className="font-display" style={{ fontWeight: 400, marginRight: 3 }}>Members:</span> {selected.memberCount}
              </div>
              <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>
                <span className="font-display" style={{ fontWeight: 400, marginRight: 3 }}>Babysitters:</span> {selected.providerCount}
              </div>
              <button
                onClick={() => onJoin(selected)}
                style={{
                  background: "var(--mauve-cta)",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: 24,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 6px 14px rgba(174, 132, 132, 0.18)",
                }}
              >
                {joinLabel}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              width: "100%",
              padding: "10px 22px",
            }}
          >
            <div className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>
              Neighborhood not listed? Let&apos;s fix that.
            </div>
            <a
              href="/request-neighborhood"
              style={{
                fontWeight: 600,
                color: "#fff",
                borderRadius: 30,
                padding: "9px 70px",
                background: "var(--mauve-cta)",
                fontSize: 16,
              }}
            >
              Add Yours
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
