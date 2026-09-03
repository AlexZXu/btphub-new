import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { CheckCircleIcon } from "@/components/icons";

export default function ConfirmEmailPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <PublicNavbar />
      <div style={{ width: 500, maxWidth: "100%", padding: 48, margin: "0 auto" }}>
        <div
          style={{
            padding: 32,
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 32,
            textAlign: "center",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <CheckCircleIcon size={200} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Email Confirmed</div>
            <div style={{ fontSize: 16 }}>Your email has been successfully confirmed.</div>
          </div>
          <Link
            href="/login"
            style={{
              borderRadius: 5,
              background: "var(--green-submit)",
              color: "#363636",
              fontSize: 18,
              padding: "6px 16px",
            }}
          >
            Back to BTPHub
          </Link>
        </div>
      </div>
    </div>
  );
}
