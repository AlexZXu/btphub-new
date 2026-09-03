export const dynamic = "force-dynamic";

import { listNeighborhoods, listStates } from "@/lib/data";
import AdminNeighborhoods from "./AdminNeighborhoods";

export default async function AdminNeighborhoodsPage() {
  const [neighborhoods, states] = await Promise.all([listNeighborhoods(), listStates()]);
  return (
    <AdminNeighborhoods
      neighborhoods={neighborhoods}
      states={states.map((s) => ({ code: s.code, minHourlyWage: s.minHourlyWage }))}
    />
  );
}
