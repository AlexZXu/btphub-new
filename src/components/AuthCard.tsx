import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";

export default function AuthCard({
  title,
  subtitle,
  wide = false,
  step,
  stepCount,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  step?: number;
  stepCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <main className={"auth-card" + (wide ? " auth-card--wide" : "")}>
        <Link href="/" aria-label="BTPHub home">
          <Image src={logo} alt="BTPHub" height={48} priority />
        </Link>
        {step && stepCount ? (
          <div className="auth-steps">
            <div className="auth-steps-label">
              Step {step} of {stepCount}
            </div>
            <div
              className="auth-steps-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={stepCount}
              aria-valuenow={step}
              aria-label="Sign-up progress"
            >
              <div className="auth-steps-fill" style={{ width: `${(step / stepCount) * 100}%` }} />
            </div>
          </div>
        ) : null}
        <div className="auth-head">
          <h1 className="auth-title">{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
