"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "For Institutions", href: "#for-institutions" },
  { label: "For Patients", href: "#for-patients" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
          : "bg-transparent backdrop-blur-none"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 lg:px-8"
      >
        <a
          href="#home"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          aria-label="SmartCoIHA home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
            S
          </span>
          SmartCoIHA
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-primary"
          >
            Login
          </a>
          <a
            href="#"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Register Institution
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-700 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white/95 px-5 pb-6 pt-4 shadow-sm backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-primary"
                onClick={closeMobile}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <a
              href="#"
              className="rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
              onClick={closeMobile}
            >
              Login
            </a>
            <a
              href="#"
              className="rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={closeMobile}
            >
              Register Institution
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
