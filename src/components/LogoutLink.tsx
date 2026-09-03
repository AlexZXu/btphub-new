"use client";

import { useRouter } from "next/navigation";

export default function LogoutLink({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button className="nav-item" onClick={logout} style={{ textAlign: "left" }}>
      {children}
    </button>
  );
}
