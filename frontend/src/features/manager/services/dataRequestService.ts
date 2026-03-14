import { get, getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import type {
  CreateDataRequestPayload,
  DataRequest,
  DataRequestsResponse,
} from "@/features/manager/types/data-requests";

const dataRequestUrl = "/api/DataRequest";

export async function getInstitutionDataRequests(institutionId: string): Promise<DataRequest[]> {
  try {
    const response = await get<DataRequestsResponse>(
      `${dataRequestUrl}/institution/${institutionId}`,
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
