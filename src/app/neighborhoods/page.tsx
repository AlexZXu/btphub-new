export const dynamic = "force-dynamic";

import PublicNavbar from "@/components/PublicNavbar";
import { listNeighborhoods, listStates } from "@/lib/data";
import SeeNeighborhoods from "./SeeNeighborhoods";

export default async function NeighborhoodsPage() {
  const [neighborhoods, states] = await Promise.all([listNeighborhoods(), listStates()]);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff url(/bgshape.svg) no-repeat bottom / 100%",
      }}
    >
      <PublicNavbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexGrow: 1,
          padding: "12px 14% 24px",
        }}
      >
        <div className="font-display" style={{ fontSize: 26, fontWeight: 500, marginBottom: 16 }}>
          Step into your neighborhood
        </div>
        <SeeNeighborhoods
          neighborhoods={neighborhoods}
          states={states.map((s) => ({ code: s.code }))}
        />
      </div>
    </div>
  );
}
