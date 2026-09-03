"use client";

import { useState } from "react";
import Link from "next/link";
import FormPageShell from "@/components/FormPageShell";

const FIELD_STYLE: React.CSSProperties = { width: "70%", display: "flex", flexDirection: "column", gap: 12 };
const LABEL_STYLE: React.CSSProperties = { fontSize: 17, fontWeight: 500, color: "#333" };

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
  }

  return (
    <FormPageShell title="Contact Us" subtitle="We'd love to hear from you. Send us a message!">
      {sent ? (
        <div style={{ padding: "24px 0", fontSize: 18, color: "#2f4b2f", fontWeight: 600 }}>
          Thanks! Your message is on its way.
        </div>
      ) : (
        <form onSubmit={submit} style={FIELD_STYLE}>
          <div className="field">
            <label style={LABEL_STYLE}>Name *</label>
            <input className="input" placeholder="Your name" value={form.name} onChange={set("name")} required />
          </div>
          <div className="field">
            <label style={LABEL_STYLE}>Email *</label>
            <input className="input" type="email" placeholder="Your email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label style={LABEL_STYLE}>Subject *</label>
            <input className="input" placeholder="What is this about?" value={form.subject} onChange={set("subject")} required />
          </div>
          <div className="field">
            <label style={LABEL_STYLE}>Message *</label>
            <textarea
              className="input"
              placeholder="Your message here..."
              style={{ height: 130, resize: "none" }}
              value={form.message}
              onChange={set("message")}
              required
            />
          </div>
          <button type="submit" className="btn-cta" style={{ marginTop: 8 }}>
            Send Message
          </button>
        </form>
      )}
      <div style={{ width: "70%", marginTop: 4, color: "#999", fontSize: 16 }}>
        <Link href="/" style={{ color: "#999" }}>
          &lt; Back
        </Link>
      </div>
    </FormPageShell>
  );
}
