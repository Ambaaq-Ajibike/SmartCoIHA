"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, LoaderCircle, RefreshCw, UserRound, Waves } from "lucide-react";
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
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { getAdminAnalytics } from "@/features/admin/services/analyticsService";
import type {
  AdminAnalyticsActivityLog,
  AdminAnalyticsData,
  AdminAnalyticsMetricBreakdown,
  AdminAnalyticsMonthlyRegistrations,
} from "@/features/admin/types/analytics";

const piePalette = ["#047857", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6", "#14B8A6"];
const barPalette = ["#047857", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityColumns = useMemo<DataTableColumn<AdminAnalyticsActivityLog>[]>(
    () => [
      {
        key: "actionType",
        header: "Action",
        className: "font-medium text-ink",
      },
      {
        key: "entityName",
        header: "Entity",
      },
      {
        key: "userName",
        header: "Actor",
      },
      {
        key: "timestamp",
        header: "Time",
        render: (value: unknown) => formatTimestamp(value),
      },
    ],
    [],
  );

  useEffect(() => {
    void loadAnalytics();
  }, []);

  async function loadAnalytics(refresh = false) {
    try {
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard analytics.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const totalLogs = analytics?.recentActivityLogs.length ?? 0;

  const stats = [
    {
      label: "Total Institutions",
      value: analytics?.totalInstitutions ?? 0,
      icon: Building2,
      color: "text-primary",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Patients",
      value: analytics?.totalPatients ?? 0,
      icon: UserRound,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Data Requests",
      value: analytics?.totalDataRequests ?? 0,
      icon: Activity,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Active Endpoints",
      value: analytics?.activeEndpoints ?? 0,
      icon: Waves,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Admin Overview</h1>
          <p className="mt-1 text-sm text-muted">Platform-wide analytics and recent system activity.</p>
        </div>

        <button
          onClick={() => void loadAnalytics(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing || isLoading}
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
                  <p className="text-2xl font-bold text-ink">{formatNumber(value)}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold text-ink">Institution Status</h2>
                <p className="text-sm text-muted">Distribution of onboarding status across institutions.</p>
              </div>
              <PieChartCard distribution={analytics?.institutionStatusDistribution} />
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold text-ink">Monthly Registrations</h2>
                <p className="text-sm text-muted">
                  Grouped monthly trend for institutions and patients.
                </p>
              </div>
              <MonthlyHistogram data={analytics?.monthlyRegistrations} />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Recent Activity Logs</h2>
                <p className="text-sm text-muted">Latest admin and platform actions.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {formatNumber(totalLogs)} events
              </span>
            </div>

            <DataTable
              data={analytics?.recentActivityLogs ?? []}
              columns={activityColumns}
              rowKey="id"
              emptyMessage="No recent activities found."
            />
          </div>
        </>
      )}
    </section>
  );
}

function PieChartCard({ distribution }: { distribution?: AdminAnalyticsMetricBreakdown }) {
  const labels = distribution?.labels ?? [];
  const values = distribution?.data ?? [];
  const safeValues = labels.map((_, index) => Math.max(0, values[index] ?? 0));
  const total = safeValues.reduce((sum, value) => sum + value, 0);

  if (labels.length === 0 || total === 0) {
    return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">No status data available.</p>;
  }

  let angleCursor = 0;
  const segments = safeValues.map((value, index) => {
    const angle = (value / total) * 360;
    const start = angleCursor;
    angleCursor += angle;
    return {
      label: labels[index],
      value,
      color: piePalette[index % piePalette.length],
      start,
      end: angleCursor,
      percentage: (value / total) * 100,
    };
  });

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

function MonthlyHistogram({ data }: { data?: AdminAnalyticsMonthlyRegistrations }) {
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

function formatTimestamp(value: unknown) {
  if (typeof value !== "string" || !value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
