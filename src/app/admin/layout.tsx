export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";
import { HomeIcon, PeopleIcon, ListIcon, GearIcon } from "@/components/icons";
import logo from "../../../public/logo.png";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer?.session.role !== "admin") redirect("/login?from=/admin");

  const items = [
    { href: "/admin/neighborhoods", label: "Neighborhoods", icon: <HomeIcon size={22} strokeWidth={1.6} /> },
    { href: "/admin/providers", label: "Providers", icon: <PeopleIcon size={22} strokeWidth={1.6} /> },
    { href: "/admin/neighborhoods/requests", label: "Pending Requests", icon: <ListIcon size={22} strokeWidth={1.6} /> },
    { href: "/admin/state", label: "States", icon: <GearIcon size={22} strokeWidth={1.6} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      <div className="admin-nav">
        <Link href="/admin/neighborhoods" style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Image src={logo} alt="BTPHub" height={56} priority />
        </Link>
        {items.map((i) => (
          <Link key={i.label} href={i.href} className="admin-nav-item">
            {i.icon}
            <div>{i.label}</div>
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
