export const dynamic = "force-dynamic";

import { listNeighborhoods, listStates } from "@/lib/data";
import SignupWizard from "./SignupWizard";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; nbh?: string }>;
}) {
  const [{ role, nbh }, neighborhoods, states] = await Promise.all([
    searchParams,
    listNeighborhoods(),
    listStates(),
  ]);
  return (
    <SignupWizard
      initialRole={role === "customer" || role === "provider" ? role : null}
      initialNeighborhoodId={nbh ?? null}
      neighborhoods={neighborhoods}
      states={states.map((s) => ({ code: s.code }))}
    />
  );
}
