import { RegisterInstitutionInput } from "@/features/auth/types/register-institution";
import { getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";

const registerManagerUrl = "/api/Auth/register-manager";

export async function registerManager(payload: RegisterInstitutionInput) {
  try {
    const response = await post<unknown, RegisterInstitutionInput>(registerManagerUrl, payload, {
      headers: {
        Accept: "text/plain",
      },
    });

    return getApiSuccessMessage(response, "Institution registration submitted successfully.");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
