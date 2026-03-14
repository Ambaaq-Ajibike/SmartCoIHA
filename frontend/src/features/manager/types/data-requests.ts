import { z } from "zod";

export interface DataRequest {
  patientInstituteName: string;
  institutePatientId: string;
  resourceType: string;
  isApproved: boolean;
  hasExpired: boolean;
}

export interface DataRequestsResponse {
  success: boolean;
  message?: string;
  data?: DataRequest[];
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
