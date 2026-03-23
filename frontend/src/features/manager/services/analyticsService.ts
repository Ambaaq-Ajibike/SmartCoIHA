import { get, getApiErrorMessage } from "@/lib/api-request";
import type {
  InstitutionAnalyticsData,
  InstitutionAnalyticsResponse,
} from "@/features/manager/types/analytics";

const analyticsBaseUrl = "/api/Analytics/institution";

const emptyAnalytics: InstitutionAnalyticsData = {
  totalPatients: 0,
  totalVerifiedPatients: 0,
  totalPendingPatients: 0,
  totalDataRequests: 0,
  incomingDataRequests: 0,
  outgoingDataRequests: 0,
  patientVerificationDistribution: {
    labels: [],
    data: [],
  },
  monthlyDataRequests: {
    labels: [],
    datasets: [],
  },
};

export async function getInstitutionAnalytics(
  institutionId: string,
): Promise<InstitutionAnalyticsData> {
  try {
    const response = await get<InstitutionAnalyticsResponse>(
      `${analyticsBaseUrl}/${institutionId}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response?.data ?? emptyAnalytics;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
