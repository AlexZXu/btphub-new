"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import { CheckCircleIcon } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check Your Email">
        <div
          aria-live="polite"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}
        >
          <CheckCircleIcon size={56} />
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#555", textAlign: "center", margin: 0 }}>
            If an account exists for <strong>{email}</strong>, a password reset link is on its way. It may take a
            few minutes to arrive.
          </p>
        </div>
        <div className="auth-foot">
          <Link href="/login">← Back to Log In</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle="Enter the email for your account and we'll send you a reset link."
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-cta" disabled={busy} style={{ marginTop: 4 }}>
          {busy ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
      <div className="auth-foot">
        Remembered it? <Link href="/login">Back to Log In</Link>
      </div>
    </AuthCard>
  );
}
