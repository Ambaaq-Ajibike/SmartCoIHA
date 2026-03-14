"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, RefreshCw, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Modal from "@/components/shared/Modal";
import {
  downloadBulkUploadTemplate,
  getPatients,
  registerPatient,
  uploadPatientsCsv,
} from "@/features/manager/services/patientsService";
import {
  addPatientSchema,
  type AddPatientInput,
  type Patient,
} from "@/features/manager/types/patients";
import { useAuthStore } from "@/store/useAuthStore";

const fieldClassName =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-emerald-100";

export default function ManagerPatientsPage() {
  const user = useAuthStore((state) => state.user);
  const institutionId = user?.institutionId ?? "";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddPatientInput>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      institutePatientId: "",
    },
  });

  const columns = useMemo<DataTableColumn<Patient>[]>(() => {
    if (patients.length === 0) return [];

    return Object.keys(patients[0]).map((key) => {
      if (key === "name") {
        return {
          key,
          className: "font-medium text-ink",
        } satisfies DataTableColumn<Patient>;
      }

      if (key === "enrollmentStatus") {
        return {
          key,
          header: "Enrollment Status",
          render: (value: unknown) => {
            const status = String(value ?? "Pending");
            return (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                  status,
                )}`}
              >
                {status}
              </span>
            );
          },
        } satisfies DataTableColumn<Patient>;
      }

      return { key } satisfies DataTableColumn<Patient>;
    });
  }, [patients]);

  const loadPatients = useCallback(async (refresh = false) => {
    if (!institutionId) {
      setPatients([]);
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

      const data = await getPatients(institutionId);
      setPatients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load patients.";
      setError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const onAddPatient = handleSubmit(async (values) => {
    if (!institutionId) {
      toast.error("No institution linked to your account.", { duration: 6000 });
      return;
    }

    try {
      const message = await registerPatient({
        name: values.name,
        email: values.email,
        institutionId,
        institutePatientId: values.institutePatientId,
      });

      toast.success(message, { duration: 5000 });
      setIsAddPatientModalOpen(false);
      reset({ name: "", email: "", institutePatientId: "" });
      await loadPatients(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add patient.";
      toast.error(message, { duration: 6000 });
    }
  });

  async function handleDownloadTemplate() {
    try {
      setIsDownloadingTemplate(true);
      const { blob, fileName } = await downloadBulkUploadTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded.", { duration: 4000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download template.";
      toast.error(message, { duration: 6000 });
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  async function handleUploadCsv() {
    if (!institutionId) {
      toast.error("No institution linked to your account.", { duration: 6000 });
      return;
    }

    if (!selectedFile) {
      toast.error("Please choose a CSV file before uploading.", { duration: 5000 });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid file type. Please upload a .csv file.", { duration: 5000 });
      return;
    }

    try {
      setIsUploadingCsv(true);
      const message = await uploadPatientsCsv(institutionId, selectedFile);
      toast.success(message, { duration: 5000 });
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      await loadPatients(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload CSV file.";
      toast.error(message, { duration: 6000 });
    } finally {
      setIsUploadingCsv(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Patients</h2>
          <p className="text-sm text-muted">Manage institution patients and enrollment status.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadPatients(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsAddPatientModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            Add Patient
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-emerald-100"
          >
            <Upload className="size-4" />
            Upload Patients
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
          data={patients}
          columns={columns}
          rowKey={(row) => `${row.email}-${row.name}`}
          emptyMessage="No patients found for this institution."
        />
      )}

      <Modal
        open={isAddPatientModalOpen}
        title="Add Patient"
        onClose={() => setIsAddPatientModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={onAddPatient} noValidate>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter full name"
              className={fieldClassName}
              {...register("name")}
            />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="patient@example.com"
              className={fieldClassName}
              {...register("email")}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="institutePatientId" className="text-sm font-medium text-ink">
              Institute Patient ID
            </label>
            <input
              id="institutePatientId"
              type="text"
              placeholder="Enter institute patient ID"
              className={fieldClassName}
              {...register("institutePatientId")}
            />
            {errors.institutePatientId ? (
              <p className="mt-1 text-xs text-red-600">{errors.institutePatientId.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddPatientModalOpen(false)}
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
              Save Patient
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isUploadModalOpen}
        title="Upload Patients"
        onClose={() => setIsUploadModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Download the CSV template, populate patient records, then upload it below.
          </p>

          <button
            type="button"
            onClick={() => void handleDownloadTemplate()}
            disabled={isDownloadingTemplate}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingTemplate ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Download Template
          </button>

          <div>
            <label htmlFor="patientsCsv" className="text-sm font-medium text-ink">
              CSV File
            </label>
            <input
              id="patientsCsv"
              type="file"
              accept=".csv,text/csv"
              className={`${fieldClassName} file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-emerald-200`}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
              }}
            />
            <p className="mt-1 text-xs text-muted">
              {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected yet."}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-muted transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleUploadCsv()}
              disabled={isUploadingCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingCsv ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Upload CSV
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function getStatusClasses(status: string) {
  if (status === "Verified") return "bg-emerald-100 text-emerald-800";
  if (status === "Failed") return "bg-amber-100 text-amber-800";
  if (status === "Denied") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}
