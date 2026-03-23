"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, CheckCircle2, Clock3, LoaderCircle, RefreshCw, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { getInstitutionAnalytics } from "@/features/manager/services/analyticsService";
import type {
  InstitutionAnalyticsData,
  InstitutionAnalyticsMetricBreakdown,
  InstitutionAnalyticsMonthlyDataRequests,
} from "@/features/manager/types/analytics";
import { useAuthStore } from "@/store/useAuthStore";

const piePalette = ["#059669", "#EAB308", "#EF4444", "#3B82F6", "#8B5CF6"];
const barPalette = ["#059669", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function ManagerOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const institutionId = user?.institutionId ?? "";

  const [analytics, setAnalytics] = useState<InstitutionAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (refresh = false) => {
    if (!institutionId) {
      setError("Your account is not linked to an institution yet.");
      setAnalytics(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getInstitutionAnalytics(institutionId);
      setAnalytics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load institution analytics.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const stats = [
    {
      title: "Total Patients",
      value: analytics?.totalPatients ?? 0,
      icon: Users,
      tone: "primary" as const,
    },
    {
      title: "Verified Patients",
      value: analytics?.totalVerifiedPatients ?? 0,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      title: "Pending Patients",
      value: analytics?.totalPendingPatients ?? 0,
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      title: "Total Data Requests",
      value: analytics?.totalDataRequests ?? 0,
      icon: RefreshCw,
      tone: "blue" as const,
    },
    {
      title: "Incoming Requests",
      value: analytics?.incomingDataRequests ?? 0,
      icon: ArrowDownToLine,
      tone: "primary" as const,
    },
    {
      title: "Outgoing Requests",
      value: analytics?.outgoingDataRequests ?? 0,
      icon: ArrowUpRight,
      tone: "blue" as const,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.fullName}</h2>
          <p className="mt-1 text-sm text-muted">
            Institution analytics for {user?.institutionName ?? "your organization"}.
          </p>
        </div>

        <button
          onClick={() => {
            void loadAnalytics(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-emerald-100 bg-white">
          <LoaderCircle className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatusCard
                key={stat.title}
                title={stat.title}
                value={formatNumber(stat.value)}
                icon={stat.icon}
                tone={stat.tone}
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold text-ink">Patient Verification Status</h3>
                <p className="text-sm text-muted">Verified, pending, and rejected patient distribution.</p>
              </div>
              <PieChartCard distribution={analytics?.patientVerificationDistribution} />
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold text-ink">Monthly Data Requests</h3>
                <p className="text-sm text-muted">Incoming vs outgoing request trend by month.</p>
              </div>
              <MonthlyHistogram data={analytics?.monthlyDataRequests} />
            </div>
          </div>
        </>
      )}
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

function PieChartCard({ distribution }: { distribution?: InstitutionAnalyticsMetricBreakdown }) {
  const labels = distribution?.labels ?? [];
  const values = distribution?.data ?? [];
  const safeValues = labels.map((_, index) => Math.max(0, values[index] ?? 0));
  const total = safeValues.reduce((sum, value) => sum + value, 0);

  if (labels.length === 0 || total === 0) {
    return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">No verification data available.</p>;
  }

  const segments = safeValues.reduce<Array<{
    label: string;
    value: number;
    start: number;
    end: number;
    color: string;
    percentage: number;
  }>>((acc, value, index) => {
    const angle = (value / total) * 360;
    const start = index === 0 ? 0 : acc[index - 1].end;
    const end = start + angle;

    acc.push({
      label: labels[index],
      value,
      start,
      end,
      color: piePalette[index % piePalette.length],
      percentage: (value / total) * 100,
    });

    return acc;
  }, []);

  const pieBackground = `conic-gradient(${segments
    .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
    .join(", ")})`;

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <div className="relative mx-auto size-44 shrink-0 rounded-full" style={{ background: pieBackground }}>
        <div className="absolute inset-6 rounded-full bg-white shadow-inner" />
      </div>

      <ul className="space-y-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-ink">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              {segment.label}
            </span>
            <span className="text-muted">
              {formatNumber(segment.value)} ({segment.percentage.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthlyHistogram({ data }: { data?: InstitutionAnalyticsMonthlyDataRequests }) {
  const labels = data?.labels ?? [];
  const datasets = data?.datasets ?? [];

  if (labels.length === 0 || datasets.length === 0) {
    return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">No monthly data available.</p>;
  }

  const chartData = labels.map((monthLabel, monthIndex) => {
    const item: Record<string, string | number> = { month: monthLabel };

    datasets.forEach((dataset) => {
      item[dataset.label] = Math.max(0, dataset.data[monthIndex] ?? 0);
    });

    return item;
  });

  const maxValue = Math.max(
    ...datasets.flatMap((dataset) => dataset.data.map((value) => Math.max(0, value))),
    0,
  );

  if (maxValue === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
        Monthly values are currently all zero.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        {datasets.map((dataset, datasetIndex) => (
          <li key={dataset.label} className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: barPalette[datasetIndex % barPalette.length] }}
              aria-hidden="true"
            />
            {dataset.label}
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#D1FAE5" strokeDasharray="4 4" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#A7F3D0" }} />
              <YAxis
                allowDecimals={false}
                tickFormatter={formatNumber}
                tickLine={false}
                axisLine={{ stroke: "#A7F3D0" }}
                domain={[0, Math.max(maxValue, 1)]}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? formatNumber(value) : String(value)
                }
                contentStyle={{ borderRadius: 12, borderColor: "#A7F3D0" }}
              />
              <Legend />
              {datasets.map((dataset, datasetIndex) => (
                <Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={barPalette[datasetIndex % barPalette.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}
