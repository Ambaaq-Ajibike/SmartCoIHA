export type InstitutionStatusCode = 0 | 1 | 2 | 3;

export type InstitutionStatusLabel = "Pending" | "Verified" | "Failed" | "Denied";

export interface Institution {
  id: string;
  name: string;
  address: string;
  registrationId: string;
  status: InstitutionStatusLabel;
}

export interface InstitutionsResponse {
  success: boolean;
  message?: string;
  data?: Institution[];
}

export interface UpdateInstitutionStatusBody {
  status: 1 | 3;
}

export const statusLabelByCode: Record<InstitutionStatusCode, InstitutionStatusLabel> = {
  0: "Pending",
  1: "Verified",
  2: "Failed",
  3: "Denied",
};
