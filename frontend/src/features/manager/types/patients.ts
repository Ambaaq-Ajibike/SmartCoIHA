import { z } from "zod";

export type EnrollmentStatus = "Pending" | "Verified" | "Failed" | "Denied";

export interface Patient {
  institutePatientId: string,
  name: string;
  email: string;
  institution: string;
  enrollmentStatus: EnrollmentStatus;
}

export interface PatientsResponse {
  success: boolean;
  message?: string;
  data?: Patient[];
}

export const addPatientSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  institutePatientId: z.string().trim().min(1, "Institute patient ID is required."),
});

export type AddPatientInput = z.infer<typeof addPatientSchema>;

export interface AddPatientPayload extends AddPatientInput {
  institutionId: string;
}
