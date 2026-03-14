"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "Admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/manager");
    }
  }, [isHydrated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderCircle className="size-8 animate-spin text-primary" />
    </div>
  );
}
