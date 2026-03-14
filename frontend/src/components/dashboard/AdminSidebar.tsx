"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/institutions", label: "Institutions", icon: Building2 },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-emerald-100 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-emerald-100 px-6">
        <ShieldCheck className="size-6 text-primary" />
        <span className="font-display text-lg font-semibold text-primary">SmartCoIHA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard/admin"
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-ink hover:bg-emerald-50 hover:text-primary"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User menu */}
      <div className="relative border-t border-emerald-100 p-3">
        {/* Sign-out button — slides in above the user card */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            menuOpen ? "mb-1 max-h-16 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4 shrink-0" />
            Sign out
          </button>
        </div>

        {/* Clickable user card */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50"
          aria-expanded={menuOpen}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {user?.fullName?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <ChevronUp
            className={`size-4 shrink-0 text-muted transition-transform duration-200 ${
              menuOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
