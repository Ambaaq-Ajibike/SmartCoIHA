import { z } from "zod";
import { validResourceTypes } from "@/features/manager/types/data-requests";

const resourceTypeEnum = z.enum(validResourceTypes);

export type SupportedResourceType = z.infer<typeof resourceTypeEnum>;

export interface FhirEndpointResource {
  resourceName: string;
  isVerified: boolean;
  errorMessage: string | null;
}

export interface FhirEndpoint {
  id: string;
  url: string;
  resources: FhirEndpointResource[];
}

export interface FhirEndpointResponse {
  success: boolean;
  message?: string;
  data?: FhirEndpoint | null;
}

export const upsertFhirEndpointSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "FHIR endpoint URL is required.")
    .url("Enter a valid URL (e.g. https://hapi.fhir.org/baseR4)."),
  testingPatientId: z
    .string()
    .trim()
    .min(1, "Testing patient ID is required.")
    .uuid("Testing patient ID must be a valid UUID."),
  supportedResources: z
    .array(resourceTypeEnum)
    .min(1, "Select at least one supported resource."),
});

export type UpsertFhirEndpointInput = z.infer<typeof upsertFhirEndpointSchema>;

export interface UpsertFhirEndpointPayload extends UpsertFhirEndpointInput {
  institutionId: string;
}
