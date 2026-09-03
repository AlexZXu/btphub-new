import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const userName = session ? `${session.firstName} ${session.lastName}` : undefined;
  return (
    <div className="shell">
      <Sidebar role="provider" userName={userName} />
      <main className="shell-main">{children}</main>
    </div>
  );
}
