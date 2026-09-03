"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthCard from "@/components/AuthCard";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const { role } = await res.json();
      const from = params.get("from");
      router.push(from ?? (role === "provider" ? "/home/provider" : role === "admin" ? "/admin" : "/home/customer"));
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "That email and password combination didn't work. Please try again.");
      setBusy(false);
      emailRef.current?.focus();
    }
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Log in to your BTPHub account.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            ref={emailRef}
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
        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className="link-green" style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>
          <div className="input-affix">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="affix-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} stroke="currentColor" />}
            </button>
          </div>
        </div>
        {error ? (
          <div className="form-alert" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn-cta" disabled={busy} style={{ marginTop: 4 }}>
          {busy ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Logging In…
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>
      <div className="auth-foot">
        Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
