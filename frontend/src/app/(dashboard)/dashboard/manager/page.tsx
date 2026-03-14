"use client";

import { Building2, CheckCircle2, FileBadge2, MailCheck, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ManagerOverviewPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.fullName}</h2>
        <p className="mt-1 text-sm text-muted">Track your institution onboarding and account readiness.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          title="Institution"
          value={user?.institutionName || "Not provided"}
          icon={Building2}
          tone="primary"
        />
        <StatusCard
          title="Registration"
          value={user?.institutionId || "Not linked yet"}
          icon={FileBadge2}
          tone="blue"
        />
        <StatusCard
          title="Email Verification"
          value={user?.isEmailVerified ? "Verified" : "Pending"}
          icon={user?.isEmailVerified ? CheckCircle2 : ShieldAlert}
          tone={user?.isEmailVerified ? "success" : "amber"}
        />
        <StatusCard
          title="Institution Verification"
          value={user?.isInstitutionVerified ? "Approved" : "Awaiting review"}
          icon={user?.isInstitutionVerified ? MailCheck : ShieldAlert}
          tone={user?.isInstitutionVerified ? "success" : "amber"}
        />
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink">Next Steps</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>Ensure your institution profile details are accurate.</li>
          <li>Use the profile tab to confirm account information.</li>
          <li>Once approved by admin, integration features will be enabled.</li>
        </ul>
      </div>
    </section>
  );
}

function StatusCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "blue" | "success" | "amber";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-emerald-50 text-primary"
      : tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
    </article>
  );
}
