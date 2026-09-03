"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import AuthCard from "@/components/AuthCard";
import NeighborhoodFinder from "@/components/NeighborhoodFinder";
import {
  CareIcon,
  JobsIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  CheckSmallIcon,
  DotIcon,
} from "@/components/icons";
import { EMAIL_RE, passwordErrors } from "@/lib/validation";
import type { NeighborhoodRow } from "@/lib/data";

type Step = "type" | "age" | "email" | "password" | "address" | "neighborhood" | "done";
type Role = "customer" | "provider";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 2026 - 1901 + 1 }, (_, i) => 2026 - i);

const PW_RULES: [label: string, test: (pw: string) => boolean][] = [
  ["At least 6 characters", (pw) => pw.length >= 6],
  ["At least one letter", (pw) => /[A-Za-z]/.test(pw)],
  ["At least one number", (pw) => /\d/.test(pw)],
  ["At least one symbol", (pw) => /[^A-Za-z0-9]/.test(pw)],
];

export default function SignupWizard({
  initialRole,
  initialNeighborhoodId,
  neighborhoods,
  states,
}: {
  initialRole: Role | null;
  initialNeighborhoodId: string | null;
  neighborhoods: NeighborhoodRow[];
  states: { code: string }[];
}) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [step, setStep] = useState<Step>("type");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirm, setSeeConfirm] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [joinedName, setJoinedName] = useState("");
  const [submitError, setSubmitError] = useState("");

  const stepOrder: Step[] =
    role === "provider"
      ? ["type", "age", "email", "password", "address", "neighborhood"]
      : ["type", "email", "password", "address", "neighborhood"];
  const stepNumber = stepOrder.indexOf(step) + 1;
  const stepCount = stepOrder.length;
  const progress =
    step === "done" || step === "type" ? undefined : { step: Math.max(stepNumber, 1), stepCount };

  function go(next: Step) {
    setErrors([]);
    setStep(next);
  }

  function pickRole(r: Role) {
    setRole(r);
    go(r === "provider" ? "age" : "email");
  }

  function submitAge(e: React.FormEvent) {
    e.preventDefault();
    if (!month || !day || !year) return setErrors(["Please select your full date of birth."]);
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dayjs().diff(date, "year") < 13) {
      return setErrors(["Sorry — you must be at least 13 years old to babysit through BTPHub."]);
    }
    go("email");
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !firstName || !lastName) return setErrors(["Please fill in every field to continue."]);
    if (!EMAIL_RE.test(email)) return setErrors(["That email doesn't look right — please double-check it."]);
    go("password");
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    const errs = passwordErrors(password);
    if (password !== confirmPassword) errs.push("Passwords do not match.");
    if (errs.length > 0) return setErrors(errs);
    go("address");
  }

  function submitAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!streetAddress || !city || !zip) return setErrors(["Please fill in every field to continue."]);
    go("neighborhood");
  }

  async function join(n: NeighborhoodRow) {
    setBusy(true);
    setSubmitError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        email,
        firstName,
        lastName,
        password,
        birthday:
          role === "provider"
            ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : undefined,
        streetAddress,
        city,
        zip,
        neighborhoodId: n.id,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setSubmitError(body?.error ?? "Something went wrong. Please try again.");
      return;
    }
    setJoinedName(n.name);
    go("done");
  }

  const errorBlock =
    errors.length > 0 ? (
      <div className="form-alert" role="alert">
        {errors.length === 1 ? (
          errors[0]
        ) : (
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
    ) : null;

  const backLink = (to: Step) => (
    <button type="button" className="auth-back" onClick={() => go(to)}>
      <span aria-hidden="true">←</span> Back
    </button>
  );

  if (step === "neighborhood") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 14% 80px",
          background: "var(--surface-soft) url(/bgshape.svg) no-repeat bottom / 100%",
        }}
      >
        <div className="auth-steps" style={{ maxWidth: 380, marginBottom: 20 }}>
          <div className="auth-steps-label" style={{ textAlign: "center" }}>
            Step {stepNumber} of {stepCount}
          </div>
          <div
            className="auth-steps-track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={stepCount}
            aria-valuenow={stepNumber}
            aria-label="Sign-up progress"
          >
            <div className="auth-steps-fill" style={{ width: `${(stepNumber / stepCount) * 100}%` }} />
          </div>
        </div>
        <h1 className="auth-title" style={{ fontSize: 27 }}>
          Step Into Your Neighborhood
        </h1>
        <p className="auth-subtitle" style={{ maxWidth: "60ch", margin: "8px 0 24px" }}>
          Find your neighborhood below and join it to finish creating your account.
        </p>
        {submitError ? (
          <div className="form-alert" role="alert" style={{ maxWidth: 640, marginBottom: 14 }}>
            {submitError}
          </div>
        ) : null}
        <div aria-live="polite" style={{ width: "100%" }}>
          {busy ? (
            <div style={{ marginBottom: 12, color: "#5a5a5a", fontSize: 14, textAlign: "center" }}>
              Creating your account…
            </div>
          ) : null}
        </div>
        <div style={{ width: "100%", marginBottom: 6 }}>{backLink("address")}</div>
        <NeighborhoodFinder
          neighborhoods={neighborhoods}
          states={states}
          initialSelectedId={initialNeighborhoodId ?? undefined}
          onJoin={join}
        />
      </div>
    );
  }

  return (
    <AuthCard
      wide={step === "type"}
      step={progress?.step}
      stepCount={progress?.stepCount}
      title={
        step === "type"
          ? "How Will You Use BTPHub?"
          : step === "age"
            ? "Verify Your Age"
            : step === "email"
              ? "Create Your Account"
              : step === "password"
                ? "Secure Your Account"
                : step === "address"
                  ? "Where Do You Live?"
                  : "Thanks, Neighbor!"
      }
      subtitle={
        step === "type"
          ? "Pick the option that fits you best."
          : step === "age"
            ? "Babysitters must be at least 13 years old to join."
            : step === "email"
              ? "Tell us a little about yourself."
              : step === "password"
                ? "Choose a strong password to keep your account safe."
                : step === "address"
                  ? "Your address helps us match you with your neighborhood."
                  : undefined
      }
    >
      {step === "type" ? (
        <>
          <div className="role-grid">
            <button type="button" className="role-card role-card--care" onClick={() => pickRole("customer")}>
              <span className="role-card-icon role-card-icon--care">
                <CareIcon size={30} fill="var(--mauve)" />
              </span>
              <span className="role-card-title">I&apos;m Looking for Care</span>
              <span className="role-card-desc">
                Find trusted teen babysitters who live right in your neighborhood.
              </span>
            </button>
            <button type="button" className="role-card role-card--jobs" onClick={() => pickRole("provider")}>
              <span className="role-card-icon role-card-icon--jobs">
                <JobsIcon size={30} fill="var(--green-dark)" />
              </span>
              <span className="role-card-title">I&apos;m Looking for Jobs</span>
              <span className="role-card-desc">
                Earn money babysitting for families just a few doors down.
              </span>
            </button>
          </div>
          <div className="auth-foot">
            Already have an account? <Link href="/login">Log In</Link>
          </div>
        </>
      ) : null}

      {step === "age" ? (
        <form onSubmit={submitAge} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <div className="field">
            <label htmlFor="dob-month">Date of Birth</label>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr", gap: 10 }}>
              <select
                id="dob-month"
                className="input select"
                aria-label="Month"
                autoComplete="bday-month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="" disabled>
                  Month
                </option>
                {MONTHS.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="input select"
                aria-label="Day"
                autoComplete="bday-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                <option value="" disabled>
                  Day
                </option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="input select"
                aria-label="Year"
                autoComplete="bday-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="" disabled>
                  Year
                </option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-hint">We only use this to confirm you&apos;re old enough to babysit.</div>
          </div>
          {errorBlock}
          <button type="submit" className="btn-cta" style={{ marginTop: 4 }}>
            Continue
          </button>
          <div style={{ textAlign: "center" }}>{backLink("type")}</div>
        </form>
      ) : null}

      {step === "email" ? (
        <form onSubmit={submitEmail} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="su-first">First Name</label>
              <input
                id="su-first"
                className="input"
                name="firstName"
                placeholder="Jamie"
                autoComplete="given-name"
                spellCheck={false}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="su-last">Last Name</label>
              <input
                id="su-last"
                className="input"
                name="lastName"
                placeholder="Rivera"
                autoComplete="family-name"
                spellCheck={false}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="su-email">Email</label>
            <input
              id="su-email"
              type="email"
              className="input"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errorBlock}
          <button type="submit" className="btn-cta" style={{ marginTop: 4 }}>
            Continue
          </button>
          <div style={{ textAlign: "center" }}>{backLink(role === "provider" ? "age" : "type")}</div>
        </form>
      ) : null}

      {step === "password" ? (
        <form
          onSubmit={submitPassword}
          style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
        >
          <div className="field">
            <label htmlFor="su-password">Password</label>
            <div className="input-affix">
              <input
                id="su-password"
                className="input"
                type={seePassword ? "text" : "password"}
                name="new-password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="affix-btn"
                onClick={() => setSeePassword(!seePassword)}
                aria-label={seePassword ? "Hide password" : "Show password"}
              >
                {seePassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} stroke="currentColor" />}
              </button>
            </div>
            <div className="pw-checks">
              {PW_RULES.map(([label, test]) => {
                const met = test(password);
                return (
                  <div key={label} className={"pw-check" + (met ? " pw-check--met" : "")}>
                    {met ? <CheckSmallIcon aria-hidden="true" /> : <DotIcon aria-hidden="true" />}
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="field">
            <label htmlFor="su-confirm">Confirm Password</label>
            <div className="input-affix">
              <input
                id="su-confirm"
                className="input"
                type={seeConfirm ? "text" : "password"}
                name="confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="affix-btn"
                onClick={() => setSeeConfirm(!seeConfirm)}
                aria-label={seeConfirm ? "Hide password" : "Show password"}
              >
                {seeConfirm ? <EyeOffIcon size={20} /> : <EyeIcon size={20} stroke="currentColor" />}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== password ? (
              <div className="field-hint" style={{ color: "#8c3a3a" }}>
                Passwords do not match.
              </div>
            ) : null}
          </div>
          {errorBlock}
          <button type="submit" className="btn-cta" style={{ marginTop: 4 }}>
            Continue
          </button>
          <div style={{ textAlign: "center" }}>{backLink("email")}</div>
        </form>
      ) : null}

      {step === "address" ? (
        <form
          onSubmit={submitAddress}
          style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
        >
          <div className="field">
            <label htmlFor="su-street">Street Address</label>
            <input
              id="su-street"
              className="input"
              name="streetAddress"
              placeholder="123 Main Street"
              autoComplete="address-line1"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="su-city">City</label>
              <input
                id="su-city"
                className="input"
                name="city"
                placeholder="Atlanta"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="su-zip">ZIP Code</label>
              <input
                id="su-zip"
                className="input"
                name="zip"
                placeholder="30306"
                autoComplete="postal-code"
                inputMode="numeric"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>
          {errorBlock}
          <button type="submit" className="btn-cta" style={{ marginTop: 4 }}>
            Continue
          </button>
          <div style={{ textAlign: "center" }}>{backLink("password")}</div>
        </form>
      ) : null}

      {step === "done" ? (
        <>
          <CheckCircleIcon size={64} />
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#555", textAlign: "center", margin: 0, maxWidth: "42ch" }}>
            Welcome to <strong>{joinedName}</strong>! We&apos;ll email you as soon as someone from your community
            approves your request to join.
          </p>
          <Link href="/login" className="btn-cta" style={{ marginTop: 6 }}>
            Log In
          </Link>
        </>
      ) : null}
    </AuthCard>
  );
}
