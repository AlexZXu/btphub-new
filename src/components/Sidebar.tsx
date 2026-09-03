"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../public/logo.png";
import {
  BellIcon,
  BookmarkIcon,
  CalendarIcon,
  GearIcon,
  HomeIcon,
  PencilIcon,
  PersonIcon,
} from "@/components/icons";
import LogoutLink from "@/components/LogoutLink";

const ICON_SIZE = 20;

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Pathname that marks this item active; null = never highlighted. */
  activePath?: string | null;
};

export default function Sidebar({
  role,
  userName,
}: {
  role: "customer" | "provider";
  userName?: string;
}) {
  const pathname = usePathname();
  const base = `/home/${role}`;
  const iconProps = { size: ICON_SIZE, stroke: "currentColor" } as const;

  const top: Item[] =
    role === "customer"
      ? [
          { href: base, label: "Home", icon: <HomeIcon {...iconProps} /> },
          { href: `${base}/bookings`, label: "Bookings", icon: <BookmarkIcon {...iconProps} /> },
          { href: `${base}/find`, label: "Find A Babysitter", icon: <PencilIcon {...iconProps} /> },
        ]
      : [
          { href: base, label: "Home", icon: <HomeIcon {...iconProps} /> },
          { href: `${base}/bookings`, label: "Bookings", icon: <BookmarkIcon {...iconProps} /> },
          { href: `${base}/availabilities`, label: "Availabilities", icon: <PencilIcon {...iconProps} /> },
        ];
  const bottom: Item[] = [
    {
      href: role === "provider" ? `${base}/pending` : `${base}/bookings?tab=requested`,
      label: "Awaiting Response",
      icon: <BellIcon {...iconProps} />,
      activePath: role === "provider" ? undefined : null,
    },
    { href: `${base}/schedule`, label: "Calendar", icon: <CalendarIcon {...iconProps} /> },
    {
      href: role === "provider" ? `${base}/profile` : base,
      label: "Profile",
      icon: <PersonIcon {...iconProps} />,
      activePath: role === "provider" ? undefined : null,
    },
  ];

  function isActive(item: Item): boolean {
    if (item.activePath === null) return false;
    const path = (item.activePath ?? item.href).split("?")[0];
    return path === base ? pathname === base : pathname.startsWith(path);
  }

  const renderItem = (item: Item) => (
    <Link
      key={item.label}
      href={item.href}
      className={"nav-item" + (isActive(item) ? " nav-item--active" : "")}
      aria-current={isActive(item) ? "page" : undefined}
    >
      {item.icon} {item.label}
    </Link>
  );

  const initials = userName
    ? userName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <nav className="sidebar">
      <Link href={base} className="sidebar-logo" aria-label={`BTPHub ${role} home`}>
        <Image src={logo} alt="BTPHub" height={40} priority />
      </Link>
      <div className="sidebar-group">{top.map(renderItem)}</div>
      <div className="sidebar-spacer" />
      <div className="sidebar-group">
        {bottom.map(renderItem)}
        <LogoutLink>
          <GearIcon {...iconProps} /> Log Out
        </LogoutLink>
      </div>
      {userName ? (
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role">{role === "provider" ? "Babysitter" : "Family"}</div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
