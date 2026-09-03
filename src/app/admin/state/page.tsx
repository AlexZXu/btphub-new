export const dynamic = "force-dynamic";

import { listStates } from "@/lib/data";
import StateList from "./StateList";

export default async function AdminStatePage() {
  const states = await listStates();
  return (
    <StateList
      states={states.map((s) => ({ code: s.code, name: s.name, minHourlyWage: s.minHourlyWage }))}
    />
  );
}
