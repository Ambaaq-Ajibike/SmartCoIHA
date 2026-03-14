"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import AppSelect from "@/components/shared/AppSelect";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Modal from "@/components/shared/Modal";
import {
  createDataRequest,
  getInstitutionDataRequests,
} from "@/features/manager/services/dataRequestService";
import {
  createDataRequestSchema,
  validResourceTypes,
  type CreateDataRequestInput,
  type DataRequest,
} from "@/features/manager/types/data-requests";
import { useAuthStore } from "@/store/useAuthStore";

const fieldClassName =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-emerald-100";

const resourceTypeOptions = validResourceTypes.map((type) => ({
  value: type,
  label: type,
  description: `Request ${type} resource records`,
}));

export default function ManagerDataRequestsPage() {
  const user = useAuthStore((state) => state.user);
  const institutionId = user?.institutionId ?? "";

  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDataRequestInput>({
    resolver: zodResolver(createDataRequestSchema),
    defaultValues: {
      institutePatientId: "",
      resourceType: "Patient",
    },
  });

  const columns = useMemo<DataTableColumn<DataRequest>[]>(() => {
    if (requests.length === 0) return [];

    return Object.keys(requests[0]).map((key) => {
      if (key === "isApproved") {
        return {
          key,
          header: "Approval",
          render: (value: unknown) => {
            const approved = value === true;
            return (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {approved ? "Approved" : "Pending"}
              </span>
            );
          },
        } satisfies DataTableColumn<DataRequest>;
      }

      if (key === "hasExpired") {
        return {
          key,
          header: "Expiration",
          render: (value: unknown) => {
            const expired = value === true;
            return (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  expired ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {expired ? "Expired" : "Active"}
              </span>
            );
          },
        } satisfies DataTableColumn<DataRequest>;
      }

      if (key === "patientInstituteName") {
        return {
          key,
          header: "Patient Institution",
          className: "font-medium text-ink",
        } satisfies DataTableColumn<DataRequest>;
      }

      if (key === "institutePatientId") {
        return {
          key,
          header: "Patient ID",
        } satisfies DataTableColumn<DataRequest>;
      }

      return { key } satisfies DataTableColumn<DataRequest>;
    });
  }, [requests]);

  const loadRequests = useCallback(async (refresh = false) => {
    if (!institutionId) {
      setRequests([]);
      setError("Your account is not linked to an institution yet.");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getInstitutionDataRequests(institutionId);
      setRequests(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data requests.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const onSubmit = handleSubmit(async (values) => {
    if (!institutionId) {
      toast.error("No institution linked to your account.", { duration: 6000 });
      return;
    }

    try {
      const message = await createDataRequest({
        requestingInstitutionId: institutionId,
        institutePatientId: values.institutePatientId,
        resourceType: values.resourceType,
      });

      toast.success(message, { duration: 5000 });
      setIsModalOpen(false);
      reset({ institutePatientId: "", resourceType: "Patient" });
      await loadRequests(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit data request.";
      toast.error(message, { duration: 6000 });
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Data Requests</h2>
          <p className="text-sm text-muted">View and create cross-institution data requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadRequests(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            Make Request
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-emerald-100 bg-white">
          <LoaderCircle className="size-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          data={requests}
          columns={columns}
          rowKey={(_, index) => index}
          emptyMessage="No data requests found for this institution."
        />
      )}

      <Modal open={isModalOpen} title="Make Data Request" onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="institutePatientId" className="text-sm font-medium text-ink">
              Institute Patient ID
            </label>
            <input
              id="institutePatientId"
              type="text"
              placeholder="Enter patient ID"
              className={fieldClassName}
              {...register("institutePatientId")}
            />
            {errors.institutePatientId ? (
              <p className="mt-1 text-xs text-red-600">{errors.institutePatientId.message}</p>
            ) : null}
          </div>

          <Controller
            name="resourceType"
            control={control}
            render={({ field }) => (
              <AppSelect
                id="resourceType"
                label="Resource Type"
                value={field.value}
                onChange={field.onChange}
                options={resourceTypeOptions}
                error={errors.resourceType?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-muted transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
