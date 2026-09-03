"use client";

import { useState } from "react";
import Link from "next/link";
import FormPageShell from "@/components/FormPageShell";

const LABEL_STYLE: React.CSSProperties = { fontSize: 17, fontWeight: 500, color: "#333" };

export default function RequestNeighborhoodPage() {
  const [form, setForm] = useState({
    email: "",
    neighborhoodName: "",
    city: "",
    zip: "",
    state: "",
    comments: "",
  });
  const [sent, setSent] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/info-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
  }

  return (
    <FormPageShell title="Request Neighborhood" subtitle="Help us expand to your neighborhood!">
      {sent ? (
        <div style={{ padding: "24px 0", fontSize: 18, color: "#2f4b2f", fontWeight: 600 }}>
          Request received — we&apos;ll be in touch!
        </div>
      ) : (
        <form onSubmit={submit} style={{ width: "70%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label style={LABEL_STYLE}>Email *</label>
            <input className="input" type="email" placeholder="Your email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label style={LABEL_STYLE}>Neighborhood Name *</label>
            <input className="input" placeholder="Neighborhood name" value={form.neighborhoodName} onChange={set("neighborhoodName")} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.2fr", gap: 10 }}>
            <div className="field">
              <label style={LABEL_STYLE}>City *</label>
              <input className="input" placeholder="City" value={form.city} onChange={set("city")} required />
            </div>
            <div className="field">
              <label style={LABEL_STYLE}>Zip *</label>
              <input className="input" placeholder="Zip" value={form.zip} onChange={set("zip")} required />
            </div>
            <div className="field">
              <label style={LABEL_STYLE}>State *</label>
              <input className="input" placeholder="State" value={form.state} onChange={set("state")} required maxLength={2} />
            </div>
          </div>
          <div className="field">
            <label style={LABEL_STYLE}>Comments</label>
            <textarea
              className="input"
              placeholder="Additional details"
              style={{ height: 70, resize: "none" }}
              value={form.comments}
              onChange={set("comments")}
            />
          </div>
          <button type="submit" className="btn-cta" style={{ marginTop: 8 }}>
            Submit Request
          </button>
        </form>
      )}
      <div style={{ width: "70%", marginTop: 4, color: "#999", fontSize: 16 }}>
        <Link href="/neighborhoods" style={{ color: "#999" }}>
          &lt; Back
        </Link>
      </div>
    </FormPageShell>
  );
}
