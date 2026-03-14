"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function ManagerProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-sm text-muted">Your account and institution details.</p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" value={user?.fullName || "-"} />
          <Field label="Email" value={user?.email || "-"} />
          <Field label="Role" value={user?.role || "-"} />
          <Field label="Institution Name" value={user?.institutionName || "-"} />
          <Field label="Institution ID" value={user?.institutionId || "-"} />
          <Field
            label="Email Verified"
            value={user?.isEmailVerified ? "Yes" : "No"}
          />
          <Field
            label="Institution Verified"
            value={user?.isInstitutionVerified ? "Yes" : "No"}
          />
        </dl>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
