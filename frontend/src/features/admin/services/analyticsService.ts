import { get, getApiErrorMessage } from "@/lib/api-request";
import type {
  AdminAnalyticsData,
  AdminAnalyticsResponse,
} from "@/features/admin/types/analytics";

const adminAnalyticsUrl = "/api/Analytics/admin";

const emptyAnalytics: AdminAnalyticsData = {
  totalInstitutions: 0,
  totalPatients: 0,
  totalDataRequests: 0,
  activeEndpoints: 0,
  institutionStatusDistribution: {
    labels: [],
    data: [],
  },
  monthlyRegistrations: {
    labels: [],
    datasets: [],
  },
  recentActivityLogs: [],
};

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  try {
    const response = await get<AdminAnalyticsResponse>(adminAnalyticsUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    return response?.data ?? emptyAnalytics;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
