import { get, getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import type {
  FhirEndpoint,
  FhirEndpointResponse,
  UpsertFhirEndpointPayload,
} from "@/features/manager/types/fhir-endpoints";

const fhirEndpointUrl = "/api/FHIREndpoint";

export async function getInstitutionFhirEndpoint(
  institutionId: string,
): Promise<FhirEndpoint | null> {
  try {
    const response = await get<FhirEndpointResponse>(
      `${fhirEndpointUrl}/institution/${institutionId}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response?.data ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function upsertFhirEndpoint(payload: UpsertFhirEndpointPayload): Promise<string> {
  try {
    const response = await post<unknown, UpsertFhirEndpointPayload>(
      fhirEndpointUrl,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return getApiSuccessMessage(response, "FHIR endpoint saved successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
