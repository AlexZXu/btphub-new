import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import heroCare from "../../public/hero-care.jpg";
import carousel from "../../public/carousel1.jpg";
import familyGame from "../../public/family-game.jpg";
import sitterPark from "../../public/sitter-park.jpg";
import aerial from "../../public/hero.jpg";

function StrokeIcon({
  children,
  size = 40,
  stroke,
  strokeWidth = 1.6,
}: {
  children: React.ReactNode;
  size?: number;
  stroke: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const FAMILY_CARDS = [
  {
    text: "Sitters who live a few doors down",
    icon: (
      <>
        <path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
  },
  {
    text: "Book a night out or a weekly slot",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    text: "Every member is approved by a neighbor",
    icon: (
      <>
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3.5 19c.6-3 2.3-4.5 4.5-4.5S11.9 16 12.5 19" />
        <path d="M11.5 19c.6-3 2.3-4.5 4.5-4.5s3.9 1.5 4.5 4.5" />
      </>
    ),
  },
  {
    text: "See each sitter's rate up front",
    icon: (
      <>
        <path d="M11.5 3H20v8.5l-8.6 8.6a2 2 0 0 1-2.8 0L3.4 15a2 2 0 0 1 0-2.8L11.5 3z" />
        <circle cx="15.5" cy="7.5" r="1.4" />
      </>
    ),
  },
];

const SITTER_CARDS = [
  {
    text: "Set your own hours and rates",
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="16" rx="2" />
        <path d="M3.5 10h17M8 2.5V7M16 2.5V7" />
      </>
    ),
  },
  {
    text: "Get paid for watching kids nearby",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 8.5c-.7-.8-1.8-1.2-3-1.2-1.8 0-3 .9-3 2.2 0 2.9 6 1.5 6 4.4 0 1.3-1.2 2.2-3 2.2-1.2 0-2.3-.4-3-1.2" />
        <path d="M12 5.5v13" />
      </>
    ),
  },
  {
    text: "Sit for families your parents know",
    icon: (
      <>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 9.5V20h12V9.5" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
  },
  {
    text: "Walk to every job",
    icon: (
      <>
        <circle cx="13" cy="4.5" r="2" />
        <path d="M12.5 8.5L10 13l3 2.5V21" />
        <path d="M10 13l-2.5 2M12.5 8.5l3 2 2.5-.5" />
        <path d="M9.5 21l1.5-4" />
      </>
    ),
  },
];

const STEPS = [
  {
    title: "Join your neighborhood",
    text: "Sign up with your address. A current member approves your request.",
  },
  {
    title: "Post or browse hours",
    text: "Sitters list when they're free. Families pick a time that works.",
  },
  {
    title: "Book the sit",
    text: "Send a request. When the sitter accepts, it goes on both calendars.",
  },
];

const STATS = [
  ["70+", "neighborhoods"],
  ["1,000+", "bookings made"],
  ["500+", "teen sitters"],
  ["4.9★", "average rating from families"],
];

export default function LandingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#fff" }}>
      <PublicNavbar overlay />

      {/* Hero */}
      <section className="hero-full">
        <Image
          src={heroCare}
          alt="A babysitter reading a picture book with a young boy on the living room floor"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center 32%" }}
        />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="land-wrap hero-content">
          <h1 className="font-display">Find a babysitter in your neighborhood</h1>
          <p className="hero-sub">
            BTPHub connects families with teen babysitters who live nearby. Every member is approved by a
            neighbor before they can join.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
            <Link href="/signup?role=customer" className="btn-pill btn-pill--solid btn-pill--lg">
              Find Care
            </Link>
            <Link href="/signup?role=provider" className="btn-pill btn-pill--mauve btn-pill--lg">
              Find a Job
            </Link>
          </div>
          <div className="hero-login">
            Already a member? <Link href="/login">Log in</Link>
          </div>
        </div>
      </section>

      {/* Why BTPHub */}
      <section style={{ padding: "76px 0 84px" }}>
        <div className="land-wrap" style={{ display: "flex", flexDirection: "column", gap: 64 }}>
          <h2 className="land-h2" style={{ marginBottom: -18 }}>Why BTPHub</h2>
          <div className="feature-row">
            <div className="feature-img">
              <Image
                src={familyGame}
                alt="Parents and their two boys playing a board game at the coffee table"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 920px) 100vw, 530px"
              />
              <div className="feature-badge">
                <strong>4.9★</strong> average rating from families
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="feature-eyebrow" style={{ color: "var(--mauve)" }}>
                For Families
              </div>
              {FAMILY_CARDS.map((c) => (
                <div key={c.text} className="land-why-card">
                  <StrokeIcon stroke="#AE8484" size={34}>{c.icon}</StrokeIcon>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
          <div className="feature-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="feature-eyebrow" style={{ color: "var(--green-dark)" }}>
                For Babysitters
              </div>
              {SITTER_CARDS.map((c) => (
                <div key={c.text} className="land-why-card">
                  <StrokeIcon stroke="#9AB87C" size={34}>{c.icon}</StrokeIcon>
                  {c.text}
                </div>
              ))}
            </div>
            <div className="feature-img feature-img--flip">
              <Image
                src={sitterPark}
                alt="A young sitter on a picnic blanket in the park with a baby"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 920px) 100vw, 530px"
              />
              <div className="feature-badge">
                <strong>500+</strong> teen sitters
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          background: "url(/bgshape.svg) no-repeat bottom / 100%",
          paddingBottom: 20,
        }}
      >
        <div className="land-wrap">
          <h2 className="land-h2" style={{ textAlign: "center" }}>
            How It Works
          </h2>
          <div className="land-steps" style={{ marginTop: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="land-step-card">
                <div className="land-step-num">{i + 1}</div>
                <div className="font-display" style={{ fontWeight: 600, fontSize: 20, color: "#1c1e1a" }}>
                  {s.title}
                </div>
                <div className="land-sub" style={{ fontSize: 15 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section style={{ background: "var(--green)", padding: "16px 0 56px" }}>
        <div className="land-wrap land-stats">
          <div
            style={{
              position: "relative",
              height: 400,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            <Image src={carousel} alt="A babysitter doing crafts with two kids at a table" fill style={{ objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "#fff",
                padding: "42px 56px",
                borderRadius: 16,
                border: "1px solid var(--border)",
                width: "100%",
                maxWidth: 420,
              }}
            >
              <div className="font-display" style={{ fontWeight: 600, fontSize: 23, marginBottom: 20, color: "#1c1e1a" }}>
                BTPHub by the Numbers
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {STATS.map(([n, label]) => (
                  <div key={label} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 22,
                        color: "var(--green-stat)",
                        minWidth: 84,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {n}
                    </div>
                    <div style={{ color: "#444", fontSize: 15 }}>{label}</div>
                  </div>
                ))}
                <Link
                  href="/signup"
                  className="btn-pill btn-pill--mauve"
                  style={{ textAlign: "center", marginTop: 12 }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find your neighborhood */}
      <section style={{ padding: "76px 0" }}>
        <div className="land-wrap land-cols" style={{ alignItems: "center", rowGap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
            <h2 className="land-h2">Find Your Neighborhood</h2>
            <p className="land-sub" style={{ maxWidth: "46ch" }}>
              See which neighborhoods are on BTPHub and how many sitters are in each.
            </p>
            <Link href="/neighborhoods" className="btn-pill btn-pill--solid btn-pill--lg" style={{ marginTop: 8 }}>
              See Neighborhoods
            </Link>
          </div>
          <div style={{ position: "relative", height: 300, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <Image
              src={aerial}
              alt="Streets and homes in a residential neighborhood from above"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 920px) 100vw, 540px"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(135deg, var(--green-pale) 0%, #d4dcc7 100%)", borderTop: "1px solid #c9d5be" }}>
        <div
          className="land-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 48,
            padding: "48px 24px 40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: "#2f4b2f" }}>
              BTPHub
            </div>
            <div style={{ fontSize: 14, color: "#55614c" }}>Atlanta, Georgia</div>
          </div>
          <div style={{ display: "flex", gap: 72, flexWrap: "wrap" }}>
            <div className="land-foot-links">
              <div className="land-foot-h">Explore</div>
              <Link href="/neighborhoods">View Neighborhoods</Link>
              <Link href="/request-neighborhood">Request a Neighborhood</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div className="land-foot-links">
              <div className="land-foot-h">Account</div>
              <Link href="/login">Log In</Link>
              <Link href="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #c9d5be" }}>
          <div className="land-wrap" style={{ padding: "16px 24px", fontSize: 13, color: "#55614c" }}>
            © 2026 BTPHub
          </div>
        </div>
      </footer>
    </div>
  );
}
