"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, LoaderCircle, Plus, RefreshCw, ShieldX } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import AppSelect from "@/components/shared/AppSelect";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Modal from "@/components/shared/Modal";
import FhirResourceViewer from "@/features/manager/components/FhirResourceViewer";
import {
  createDataRequest,
  getDataRequestResourceData,
  getIncomingDataRequests,
  getOutgoingDataRequests,
  getVerifiedInstitutions,
  updateDataRequestApprovalStatus,
} from "@/features/manager/services/dataRequestService";
import {
  createDataRequestSchema,
  validResourceTypes,
  type CreateDataRequestInput,
  type DataRequest,
  type VerifiedInstitution,
} from "@/features/manager/types/data-requests";
import { useAuthStore } from "@/store/useAuthStore";

type RowActionState = {
  requestId: string;
  status: "Verified" | "Denied";
} | null;

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

  const [incomingRequests, setIncomingRequests] = useState<DataRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifiedInstitutions, setVerifiedInstitutions] = useState<VerifiedInstitution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [rowAction, setRowAction] = useState<RowActionState>(null);
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceModalTitle, setResourceModalTitle] = useState("Resource Data");
  const [resourceData, setResourceData] = useState<unknown>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDataRequestInput>({
    resolver: zodResolver(createDataRequestSchema),
    defaultValues: {
      patientInstituteId: "",
      institutePatientId: "",
      resourceType: "Patient",
    },
  });

  const patientInstitutionOptions = useMemo(
    () =>
      verifiedInstitutions.map((institution) => ({
        value: institution.id,
        label: institution.name,
        description: institution.id,
      })),
    [verifiedInstitutions],
  );

  const columns = useMemo<DataTableColumn<DataRequest>[]>(
    () => [
      {
        key: "patientInstituteName",
        header: "Patient Institution",
        className: "font-medium text-ink",
      },
      {
        key: "institutePatientId",
        header: "Patient ID",
      },
      {
        key: "resourceType",
        header: "Resource",
      },
      {
        key: "requestedTimestamp",
        header: "Requested At",
        render: (value: unknown) => formatTimestamp(value),
      },
      {
        key: "hasPatientApproved",
        header: "Patient Approval",
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
      },
      {
        key: "institutionApprovalStatus",
        header: "Institution Status",
        render: (value: unknown) => {
          const status = typeof value === "string" ? value : "Pending";
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getInstitutionStatusClasses(
                status,
              )}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        key: "hasExpired",
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
      },
    ],
    [],
  );

  const loadRequests = useCallback(async (refresh = false) => {
    if (!institutionId) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
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

      const [incoming, outgoing] = await Promise.all([
        getIncomingDataRequests(institutionId),
        getOutgoingDataRequests(institutionId),
      ]);

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
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

  const loadVerifiedInstitutions = useCallback(async () => {
    try {
      setIsLoadingInstitutions(true);
      const data = await getVerifiedInstitutions();
      setVerifiedInstitutions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load institutions.";
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoadingInstitutions(false);
    }
  }, []);

  useEffect(() => {
    void loadVerifiedInstitutions();
  }, [loadVerifiedInstitutions]);

  const onSubmit = handleSubmit(async (values) => {
    if (!institutionId) {
      toast.error("No institution linked to your account.", { duration: 6000 });
      return;
    }

    try {
      const message = await createDataRequest({
        requestingInstitutionId: institutionId,
        patientInstituteId: values.patientInstituteId,
        institutePatientId: values.institutePatientId,
        resourceType: values.resourceType,
      });

      toast.success(message, { duration: 5000 });
      setIsModalOpen(false);
      reset({ patientInstituteId: "", institutePatientId: "", resourceType: "Patient" });
      await loadRequests(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit data request.";
      toast.error(message, { duration: 6000 });
    }
  });

  async function handleIncomingApproval(
    requestId: string,
    status: "Verified" | "Denied",
  ) {
    try {
      setRowAction({ requestId, status });
      const message = await updateDataRequestApprovalStatus(requestId, status);
      toast.success(message, { duration: 5000 });
      await loadRequests(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update request status.";
      toast.error(message, { duration: 6000 });
    } finally {
      setRowAction(null);
    }
  }

  async function handleViewResourceData(row: DataRequest) {
    try {
      setViewingRequestId(row.requestId);
      const data = await getDataRequestResourceData(row.requestId);
      setResourceData(data);
      setResourceModalTitle(`${row.resourceType} Data`);
      setResourceModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch requested resource data.";
      toast.error(message, { duration: 6000 });
    } finally {
      setViewingRequestId(null);
    }
  }

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
        <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50/70 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("incoming")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === "incoming"
                  ? "bg-primary text-white shadow"
                  : "text-ink hover:bg-emerald-100"
              }`}
            >
              Incoming ({incomingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("outgoing")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === "outgoing"
                  ? "bg-primary text-white shadow"
                  : "text-ink hover:bg-emerald-100"
              }`}
            >
              Outgoing ({outgoingRequests.length})
            </button>
          </div>

          {activeTab === "incoming" ? (
            <DataTable
              data={incomingRequests}
              columns={columns}
              rowKey={(row, index) => `${row.requestId}-incoming-${index}`}
              actionsHeader="Actions"
              renderActions={(row) => {
                const isVerifying =
                  rowAction?.requestId === row.requestId && rowAction.status === "Verified";
                const isDenying = rowAction?.requestId === row.requestId && rowAction.status === "Denied";
                const isBusy = rowAction?.requestId === row.requestId;
                const canTakeAction =
                  !row.hasExpired && row.institutionApprovalStatus === "Pending";

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        void handleIncomingApproval(row.requestId, "Verified");
                      }}
                      disabled={!canTakeAction || isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleIncomingApproval(row.requestId, "Denied");
                      }}
                      disabled={!canTakeAction || isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDenying ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <ShieldX className="size-3.5" />
                      )}
                      Reject
                    </button>
                  </>
                );
              }}
              emptyMessage="No incoming data requests."
            />
          ) : (
            <DataTable
              data={outgoingRequests}
              columns={columns}
              rowKey={(row, index) => `${row.requestId}-outgoing-${index}`}
              actionsHeader="Actions"
              renderActions={(row) => {
                const isLoadingView = viewingRequestId === row.requestId;
                const canView =
                  row.hasPatientApproved
                  && row.institutionApprovalStatus === "Verified"
                  && !row.hasExpired;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      void handleViewResourceData(row);
                    }}
                    disabled={!canView || isLoadingView}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoadingView ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    View
                  </button>
                );
              }}
              emptyMessage="No outgoing data requests."
            />
          )}
        </div>
      )}

      <Modal open={isModalOpen} title="Make Data Request" onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Controller
            name="patientInstituteId"
            control={control}
            render={({ field }) => (
              <AppSelect
                id="patientInstituteId"
                label="Patient Institution"
                value={field.value}
                onChange={field.onChange}
                options={patientInstitutionOptions}
                placeholder="Select verified institution"
                error={errors.patientInstituteId?.message}
                disabled={isSubmitting || isLoadingInstitutions}
              />
            )}
          />

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

      <Modal
        open={resourceModalOpen}
        title={resourceModalTitle}
        onClose={() => {
          setResourceModalOpen(false);
          setResourceData(null);
        }}
      >
        <FhirResourceViewer data={resourceData} />
      </Modal>
    </section>
  );
}

function formatTimestamp(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function getInstitutionStatusClasses(status: string) {
  if (status === "Verified") return "bg-emerald-100 text-emerald-800";
  if (status === "Failed") return "bg-amber-100 text-amber-800";
  if (status === "Denied") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}
