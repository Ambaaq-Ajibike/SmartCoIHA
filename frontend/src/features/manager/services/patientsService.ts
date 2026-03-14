import { apiClient } from "@/lib/api-client";
import { get, getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import type {
  AddPatientPayload,
  EnrollmentStatus,
  Patient,
  PatientsResponse,
} from "@/features/manager/types/patients";

const patientsUrl = "/api/Patients";

export async function getPatients(institutionId: string): Promise<Patient[]> {
  try {
    const response = await get<PatientsResponse>(
      `${patientsUrl}?institutionId=${encodeURIComponent(institutionId)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((patient) => ({
      ...patient,
      enrollmentStatus: normalizeEnrollmentStatus(patient.enrollmentStatus),
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function registerPatient(payload: AddPatientPayload): Promise<string> {
  try {
    const response = await post<unknown, AddPatientPayload>(
      `${patientsUrl}/register`,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return getApiSuccessMessage(response, "Patient registered successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function downloadBulkUploadTemplate(): Promise<{ blob: Blob; fileName: string }> {
  try {
    const response = await apiClient.get<Blob>(`${patientsUrl}/bulk-upload-template`, {
      responseType: "blob",
      headers: {
        Accept: "text/csv,application/octet-stream,application/json",
      },
    });

    return {
      blob: response.data,
      fileName: getFileNameFromHeader(response.headers["content-disposition"]),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function uploadPatientsCsv(institutionId: string, file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `${patientsUrl}/bulk-upload/${institutionId}`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return getApiSuccessMessage(response.data, "Patient CSV uploaded successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

function normalizeEnrollmentStatus(value: unknown): EnrollmentStatus {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "verified") return "Verified";
    if (normalized === "failed") return "Failed";
    if (normalized === "denied") return "Denied";
  }

  return "Pending";
}

function getFileNameFromHeader(dispositionHeader?: string): string {
  if (!dispositionHeader) {
    return "patients-bulk-upload-template.csv";
  }

  const utf8Match = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = dispositionHeader.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return "patients-bulk-upload-template.csv";
}
