import { get, getApiErrorMessage, getApiSuccessMessage, post, put } from "@/lib/api-request";
import type {
  CreateDataRequestPayload,
  DataRequest,
  DataRequestApprovalStatus,
  DataRequestsResponse,
  VerifiedInstitution,
  VerifiedInstitutionsResponse,
} from "@/features/manager/types/data-requests";

const dataRequestUrl = "/api/DataRequest";
const verifiedInstitutionsUrl = "/api/Institutions/verified";

export async function getIncomingDataRequests(institutionId: string): Promise<DataRequest[]> {
  try {
    const response = await get<DataRequestsResponse>(
      `${dataRequestUrl}/institution/${institutionId}/incoming`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getOutgoingDataRequests(institutionId: string): Promise<DataRequest[]> {
  try {
    const response = await get<DataRequestsResponse>(
      `${dataRequestUrl}/institution/${institutionId}/outgoing`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createDataRequest(payload: CreateDataRequestPayload): Promise<string> {
  try {
    const response = await post<unknown, CreateDataRequestPayload>(
      dataRequestUrl,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return getApiSuccessMessage(response, "Data request submitted successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getVerifiedInstitutions(): Promise<VerifiedInstitution[]> {
  try {
    const response = await get<VerifiedInstitutionsResponse>(verifiedInstitutionsUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateDataRequestApprovalStatus(
  requestId: string,
  status: Extract<DataRequestApprovalStatus, "Verified" | "Denied">,
): Promise<string> {
  try {
    const response = await put<unknown, { status: string }>(
      `${dataRequestUrl}/${requestId}/approval-status`,
      { status },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return getApiSuccessMessage(response, "Request approval status updated successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
