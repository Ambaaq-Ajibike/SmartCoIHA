import { z } from "zod";

export const registerInstitutionSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    institutionName: z.string().trim().min(2, "Institution name is required"),
    institutionAddress: z.string().trim().min(5, "Institution address is required"),
    institutionRegistrationId: z
      .string()
      .trim()
      .min(3, "Institution registration ID is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInstitutionInput = z.infer<typeof registerInstitutionSchema>;