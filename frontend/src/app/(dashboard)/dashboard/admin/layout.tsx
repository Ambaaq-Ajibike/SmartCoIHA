"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

const navLabels: Record<string, string> = {
  "/dashboard/admin": "Overview",
  "/dashboard/admin/institutions": "Institutions",
  "/dashboard/admin/users": "Users",
  "/dashboard/admin/verification": "Verification",
  "/dashboard/admin/settings": "Settings",
};

function getActiveLabel(pathname: string): string {
  // Exact match first, then longest prefix
  if (navLabels[pathname]) return navLabels[pathname];
  const match = Object.keys(navLabels)
    .filter((k) => k !== "/dashboard/admin" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? navLabels[match] : "Dashboard";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeLabel = getActiveLabel(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center border-b border-emerald-100 bg-white px-8">
          <h1 className="font-display text-lg font-semibold text-ink">{activeLabel}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
