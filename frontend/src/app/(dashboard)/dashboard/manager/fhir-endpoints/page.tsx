"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, RefreshCw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import {
  getInstitutionFhirEndpoint,
  upsertFhirEndpoint,
} from "@/features/manager/services/fhirEndpointsService";
import { validResourceTypes } from "@/features/manager/types/data-requests";
import {
  type FhirEndpointResource,
  type SupportedResourceType,
  upsertFhirEndpointSchema,
  type UpsertFhirEndpointInput,
} from "@/features/manager/types/fhir-endpoints";
import { useAuthStore } from "@/store/useAuthStore";

const fieldClassName =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-emerald-100";

export default function ManagerFhirEndpointsPage() {
  const user = useAuthStore((state) => state.user);
  const institutionId = user?.institutionId ?? "";

  const [resources, setResources] = useState<FhirEndpointResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpsertFhirEndpointInput>({
    resolver: zodResolver(upsertFhirEndpointSchema),
    defaultValues: {
      url: "",
      testingPatientId: "",
      supportedResources: [],
    },
  });

  const selectedResources = watch("supportedResources");

  const columns = useMemo<DataTableColumn<FhirEndpointResource>[]>(
    () => [
      {
        key: "resourceName",
        header: "Resource",
        className: "font-medium text-ink",
      },
      {
        key: "isVerified",
        header: "Verification",
        render: (value: unknown) => {
          const verified = value === true;
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {verified ? "Verified" : "Pending"}
            </span>
          );
        },
      },
      {
        key: "errorMessage",
        header: "Error Message",
        render: (value: unknown) => {
          const message = typeof value === "string" && value.trim() ? value : "-";
          return <span className={message === "-" ? "text-muted" : "text-red-700"}>{message}</span>;
        },
      },
    ],
    [],
  );

  const loadFhirEndpoint = useCallback(async (refresh = false) => {
    if (!institutionId) {
      setError("Your account is not linked to an institution yet.");
      setResources([]);
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

      const endpoint = await getInstitutionFhirEndpoint(institutionId);

      if (endpoint) {
        setValue("url", endpoint.url ?? "");
        setValue(
          "supportedResources",
          endpoint.resources
            .map((resource) => resource.resourceName)
            .filter((name): name is SupportedResourceType =>
              (validResourceTypes as readonly string[]).includes(name),
            ),
        );
        setResources(endpoint.resources ?? []);
      } else {
        setValue("url", "");
        setValue("supportedResources", []);
        setResources([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load FHIR endpoint.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [institutionId, setValue]);

  useEffect(() => {
    void loadFhirEndpoint();
  }, [loadFhirEndpoint]);

  function toggleResource(resource: SupportedResourceType) {
    const hasResource = selectedResources.includes(resource);
    const next = hasResource
      ? selectedResources.filter((item) => item !== resource)
      : [...selectedResources, resource];

    setValue("supportedResources", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!institutionId) {
      toast.error("No institution linked to your account.", { duration: 6000 });
      return;
    }

    try {
      const message = await upsertFhirEndpoint({
        url: values.url,
        institutionId,
        supportedResources: values.supportedResources,
        testingPatientId: values.testingPatientId,
      });

      toast.success(message, { duration: 5000 });
      await loadFhirEndpoint(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save FHIR endpoint.";
      toast.error(message, { duration: 6000 });
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">FHIR Endpoints</h2>
          <p className="text-sm text-muted">
            Configure your institution FHIR endpoint and supported resources.
          </p>
        </div>

        <button
          onClick={() => void loadFhirEndpoint(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <form
        className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="url" className="text-sm font-medium text-ink">
              FHIR Base URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://hapi.fhir.org/baseR4"
              className={fieldClassName}
              {...register("url")}
            />
            {errors.url ? <p className="mt-1 text-xs text-red-600">{errors.url.message}</p> : null}
          </div>

          <div>
            <label htmlFor="testingPatientId" className="text-sm font-medium text-ink">
              Testing Patient ID (UUID)
            </label>
            <input
              id="testingPatientId"
              type="text"
              placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
              className={fieldClassName}
              {...register("testingPatientId")}
            />
            {errors.testingPatientId ? (
              <p className="mt-1 text-xs text-red-600">{errors.testingPatientId.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Supported Resources</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {validResourceTypes.map((resource) => {
              const checked = selectedResources.includes(resource);

              return (
                <button
                  key={resource}
                  type="button"
                  onClick={() => toggleResource(resource)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    checked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-ink hover:border-emerald-200 hover:bg-emerald-50/60"
                  }`}
                >
                  <span>{resource}</span>
                  {checked ? <Check className="size-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
          {errors.supportedResources ? (
            <p className="mt-2 text-xs text-red-600">{errors.supportedResources.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Endpoint
          </button>
        </div>
      </form>

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
          data={resources}
          columns={columns}
          rowKey={(row) => row.resourceName}
          emptyMessage="No resource verification records found for this endpoint."
        />
      )}
    </section>
  );
}
