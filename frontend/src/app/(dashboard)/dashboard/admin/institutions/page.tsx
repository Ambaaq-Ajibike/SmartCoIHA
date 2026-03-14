"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  getInstitutions,
  updateInstitutionStatus,
} from "@/features/admin/services/institutionsService";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import type { Institution } from "@/features/admin/types/institutions";

type ActionStatus = {
  id: string;
  action: "approve" | "reject";
} | null;

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<ActionStatus>(null);

  const pendingCount = useMemo(
    () => institutions.filter((institution) => institution.status === "Pending").length,
    [institutions],
  );

  const columns = useMemo<DataTableColumn<Institution>[]>(() => {
    if (institutions.length === 0) return [];

    return Object.keys(institutions[0])
      .filter((key) => key !== "id")
      .map((key) => {
        if (key === "status") {
          return {
            key,
            render: (value: unknown) => (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                  String(value ?? "Pending"),
                )}`}
              >
                {String(value ?? "Pending")}
              </span>
            ),
          } satisfies DataTableColumn<Institution>;
        }

        if (key === "name") {
          return {
            key,
            className: "font-medium text-ink",
          } satisfies DataTableColumn<Institution>;
        }

        return { key } satisfies DataTableColumn<Institution>;
      });
  }, [institutions]);

  useEffect(() => {
    void loadInstitutions();
  }, []);

  async function loadInstitutions(refresh = false) {
    try {
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getInstitutions();
      setInstitutions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load institutions.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleStatusChange(institutionId: string, status: 1 | 3) {
    const action = status === 1 ? "approve" : "reject";

    try {
      setActionStatus({ id: institutionId, action });
      const message = await updateInstitutionStatus(institutionId, status);

      setInstitutions((prev) =>
        prev.map((item) => {
          if (item.id !== institutionId) return item;
          return {
            ...item,
            status: status === 1 ? "Verified" : "Denied",
          };
        }),
      );

      toast.success(message, { duration: 4000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update institution status.";
      toast.error(message, { duration: 6000 });
    } finally {
      setActionStatus(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Institution Requests</h2>
          <p className="text-sm text-muted">Review and verify onboarding institutions.</p>
        </div>

        <button
          onClick={() => void loadInstitutions(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm text-muted">
          Total: <span className="font-semibold text-ink">{institutions.length}</span> | Pending:{" "}
          <span className="font-semibold text-amber-700">{pendingCount}</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-emerald-100 bg-white">
          <LoaderCircle className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : institutions.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-muted">
          No institutions found.
        </div>
      ) : (
        <DataTable
          data={institutions}
          columns={columns}
          rowKey="id"
          actionsHeader="Actions"
          renderActions={(institution) => {
            const isApproving =
              actionStatus?.id === institution.id && actionStatus.action === "approve";
            const isRejecting =
              actionStatus?.id === institution.id && actionStatus.action === "reject";
            const isWorking = actionStatus?.id === institution.id;

            return (
              <>
                <button
                  onClick={() => {
                    void handleStatusChange(institution.id, 1);
                  }}
                  disabled={isWorking || institution.status === "Verified"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApproving ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Approve
                </button>

                <button
                  onClick={() => {
                    void handleStatusChange(institution.id, 3);
                  }}
                  disabled={isWorking || institution.status === "Denied"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRejecting ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldX className="size-3.5" />
                  )}
                  Reject
                </button>
              </>
            );
          }}
        />
      )}
    </section>
  );
}

function getStatusClasses(status: string) {
  if (status === "Verified") return "bg-emerald-100 text-emerald-800";
  if (status === "Denied") return "bg-red-100 text-red-700";
  if (status === "Failed") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
