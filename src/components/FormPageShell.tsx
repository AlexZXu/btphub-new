import PublicNavbar from "@/components/PublicNavbar";

export default function FormPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <PublicNavbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          padding: 25,
          backgroundImage: "url(/bgshape.svg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
          backgroundSize: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 50px 25px",
            gap: 20,
            width: "70%",
            maxWidth: 973,
            background: "var(--surface-soft)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <div className="font-display" style={{ fontSize: 26, fontWeight: 500, textAlign: "center" }}>
            {title}
          </div>
          <div style={{ fontSize: 16, color: "#666", marginBottom: 4 }}>{subtitle}</div>
          {children}
        </div>
      </div>
    </div>
  );
}
