"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";

export default function PublicNavbar({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  return (
    <header
      className={
        "site-nav " +
        (overlay ? "site-nav--overlay" : "site-nav--solid") +
        (overlay && scrolled ? " site-nav--scrolled" : "")
      }
    >
      <div
        className="land-wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 92,
        }}
      >
        <Link href="/" aria-label="BTPHub home" style={{ display: "flex" }}>
          <Image src={logo} alt="BTPHub" height={60} priority className="site-nav-logo" />
        </Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/neighborhoods" className="site-nav-link nav-link-secondary">
            View Neighborhoods
          </Link>
          <Link href="/login" className="btn-pill btn-pill--outline">
            Log In
          </Link>
          <Link href="/signup" className="btn-pill btn-pill--solid">
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
