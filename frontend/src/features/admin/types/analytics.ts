export interface AdminAnalyticsMetricBreakdown {
  labels: string[];
  data: number[];
}

export interface AdminAnalyticsMonthlyDataset {
  label: string;
  data: number[];
}

export interface AdminAnalyticsMonthlyRegistrations {
  labels: string[];
  datasets: AdminAnalyticsMonthlyDataset[];
}

export interface AdminAnalyticsActivityLog {
  id: string;
  actionType: string;
  entityName: string;
  timestamp: string;
  userName: string;
}

export interface AdminAnalyticsData {
  totalInstitutions: number;
  totalPatients: number;
  totalDataRequests: number;
  activeEndpoints: number;
  institutionStatusDistribution: AdminAnalyticsMetricBreakdown;
  monthlyRegistrations: AdminAnalyticsMonthlyRegistrations;
  recentActivityLogs: AdminAnalyticsActivityLog[];
}

export interface AdminAnalyticsResponse {
  success: boolean;
  message?: string;
  data?: AdminAnalyticsData;
}
