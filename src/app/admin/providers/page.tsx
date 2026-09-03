export const dynamic = "force-dynamic";

import { listProvidersAdmin, listStates } from "@/lib/data";
import AdminProviders from "./AdminProviders";

export default async function AdminProvidersPage() {
  const [providers, states] = await Promise.all([listProvidersAdmin(), listStates()]);
  return <AdminProviders providers={providers} states={states.map((s) => ({ code: s.code }))} />;
}
