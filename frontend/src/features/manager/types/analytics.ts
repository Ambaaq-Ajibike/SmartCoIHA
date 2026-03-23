export interface InstitutionAnalyticsMetricBreakdown {
  labels: string[];
  data: number[];
}

export interface InstitutionAnalyticsMonthlyDataset {
  label: string;
  data: number[];
}

export interface InstitutionAnalyticsMonthlyDataRequests {
  labels: string[];
  datasets: InstitutionAnalyticsMonthlyDataset[];
}

export interface InstitutionAnalyticsData {
  totalPatients: number;
  totalVerifiedPatients: number;
  totalPendingPatients: number;
  totalDataRequests: number;
  incomingDataRequests: number;
  outgoingDataRequests: number;
  patientVerificationDistribution: InstitutionAnalyticsMetricBreakdown;
  monthlyDataRequests: InstitutionAnalyticsMonthlyDataRequests;
}

export interface InstitutionAnalyticsResponse {
  success: boolean;
  message?: string;
  data?: InstitutionAnalyticsData;
}
