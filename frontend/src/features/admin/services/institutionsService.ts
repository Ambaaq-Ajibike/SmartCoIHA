import { get, getApiErrorMessage, getApiSuccessMessage, put } from "@/lib/api-request";
import {
  type Institution,
  type InstitutionStatusCode,
  type InstitutionStatusLabel,
  type InstitutionsResponse,
  type UpdateInstitutionStatusBody,
  statusLabelByCode,
} from "@/features/admin/types/institutions";

const institutionsUrl = "/api/Institutions";

export async function getInstitutions(): Promise<Institution[]> {
  try {
    const response = await get<InstitutionsResponse>(institutionsUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((institution) => ({
      ...institution,
      status: normalizeStatusLabel(institution.status),
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateInstitutionStatus(
  institutionId: string,
  status: 1 | 3,
): Promise<string> {
  try {
    const response = await put<unknown, UpdateInstitutionStatusBody>(
      `${institutionsUrl}/${institutionId}/status`,
      { status },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return getApiSuccessMessage(response, "Institution status updated successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

function normalizeStatusLabel(value: unknown): InstitutionStatusLabel {
  if (typeof value === "number" && value in statusLabelByCode) {
    return statusLabelByCode[value as InstitutionStatusCode];
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "pending") return "Pending";
    if (normalized === "verified") return "Verified";
    if (normalized === "failed") return "Failed";
    if (normalized === "denied") return "Denied";
  }

  return "Pending";
}
