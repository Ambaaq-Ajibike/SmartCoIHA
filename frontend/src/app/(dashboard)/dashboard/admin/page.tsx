import { Building2, Users, ShieldCheck, Activity } from "lucide-react";

const stats = [
  { label: "Total Institutions", value: "—", icon: Building2, color: "text-primary", bg: "bg-emerald-50" },
  { label: "Registered Users", value: "—", icon: Users, color: "text-accent", bg: "bg-blue-50" },
  { label: "Pending Verification", value: "—", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Active Sessions", value: "—", icon: Activity, color: "text-secondary", bg: "bg-emerald-50" },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted">Platform-wide summary and quick actions.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
