"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import ManagerSidebar from "@/components/dashboard/ManagerSidebar";
import { useAuthStore } from "@/store/useAuthStore";

const navLabels: Record<string, string> = {
  "/dashboard/manager": "Overview",
  "/dashboard/manager/patients": "Patients",
  "/dashboard/manager/fhir-endpoints": "FHIR Endpoints",
  "/dashboard/manager/data-requests": "Data Requests",
  "/dashboard/manager/profile": "Profile",
};

function getActiveLabel(pathname: string): string {
  if (navLabels[pathname]) return navLabels[pathname];
  const match = Object.keys(navLabels)
    .filter((k) => k !== "/dashboard/manager" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? navLabels[match] : "Manager Dashboard";
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "Admin") {
      router.replace("/dashboard/admin");
      return;
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLabel = getActiveLabel(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b border-emerald-100 bg-white px-8">
          <h1 className="font-display text-lg font-semibold text-ink">{activeLabel}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
