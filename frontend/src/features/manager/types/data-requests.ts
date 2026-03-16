import { z } from "zod";

export type DataRequestApprovalStatus = "Pending" | "Verified" | "Failed" | "Denied";

export interface DataRequest {
  requestId: string;
  patientInstituteName: string;
  institutePatientId: string;
  resourceType: string;
  hasPatientApproved: boolean;
  institutionApprovalStatus: DataRequestApprovalStatus;
  hasExpired: boolean;
  requestedTimestamp: string;
}

export interface DataRequestsResponse {
  success: boolean;
  message?: string;
  data?: DataRequest[];
}

export interface DataRequestResourceDataResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface VerifiedInstitution {
  id: string;
  name: string;
}

export interface VerifiedInstitutionsResponse {
  success: boolean;
  message?: string;
  data?: VerifiedInstitution[];
}

export const validResourceTypes = [
  "Patient",
  "Observation",
  "Condition",
  "MedicationRequest",
  "DiagnosticReport",
  "Procedure",
  "Encounter",
  "AllergyIntolerance",
  "Immunization",
  "CarePlan",
  "Goal",
  "DocumentReference",
] as const;

export const createDataRequestSchema = z.object({
  patientInstituteId: z
    .string()
    .trim()
    .uuid("Select a valid patient institution."),
  institutePatientId: z
    .string()
    .trim()
    .min(1, "Institute patient ID is required."),
  resourceType: z.enum(validResourceTypes),
});

export type CreateDataRequestInput = z.infer<typeof createDataRequestSchema>;

export interface CreateDataRequestPayload extends CreateDataRequestInput {
  requestingInstitutionId: string;
}
