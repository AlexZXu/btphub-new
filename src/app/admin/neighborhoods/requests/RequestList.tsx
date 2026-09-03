"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

interface RequestRow {
  id: string;
  email: string;
  neighborhoodName: string;
  city: string;
  stateCode: string;
  zip: string;
  comments: string;
}

export default function RequestList({ requests }: { requests: RequestRow[] }) {
  const router = useRouter();
  const [processing, setProcessing] = useState<RequestRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "deny") {
    if (!processing) return;
    setBusy(true);
    await fetch(`/api/admin/info-requests/${processing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    setProcessing(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div className="admin-heading" style={{ marginTop: 16 }}>
        Pending Neighborhood Requests: <span style={{ fontWeight: 600 }}>{requests.length}</span>
      </div>
      {requests.length === 0 ? (
        <div className="empty-state" style={{ margin: "0 20px" }}>
          No pending requests
        </div>
      ) : null}
      {requests.map((r) => (
        <div key={r.id} className="admin-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="font-serif" style={{ fontSize: 22 }}>
              {r.neighborhoodName}
            </div>
            <div className="admin-rule" />
            <div style={{ display: "flex", gap: 32, fontSize: 15, marginTop: 4 }}>
              <div>
                {r.city}, {r.stateCode}, {r.zip}
              </div>
              <div>Requester: {r.email}</div>
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>Comment: {r.comments || "—"}</div>
          </div>
          <button className="btn-action" onClick={() => setProcessing(r)}>
            Process
          </button>
        </div>
      ))}

      {processing ? (
        <Modal title={`Process ${processing.neighborhoodName}`} onClose={() => setProcessing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", fontSize: 15 }}>
            <div>
              <b>Requester Email:</b> {processing.email}
            </div>
            <div>
              <b>Location:</b> {processing.city}, {processing.stateCode} {processing.zip}
            </div>
            <div>
              <b>Comment:</b> {processing.comments || "—"}
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              Approving creates the neighborhood and makes it joinable right away.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="btn-action" style={{ flex: 1, padding: "7px 14px" }} disabled={busy} onClick={() => act("approve")}>
                Approve
              </button>
              <button className="btn-danger" style={{ flex: 1 }} disabled={busy} onClick={() => act("deny")}>
                Deny
              </button>
              <button
                className="btn-action"
                style={{ flex: 1, background: "#c9c9c9" }}
                onClick={() => setProcessing(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
