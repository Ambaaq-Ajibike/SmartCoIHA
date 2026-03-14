import type { VerifyEmailInput } from "@/features/auth/types/verify-email";
import { getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import { RegisterInstitutionInput } from "@/features/auth/types/register-institution";

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

const verifyEmailUrl = "/api/Auth/verify-email";

export async function verifyEmail(payload: VerifyEmailInput) {
    try {
        const response = await post<unknown, VerifyEmailInput>(verifyEmailUrl, payload, {
            headers: {
                Accept: "text/plain",
            },
        });

        return getApiSuccessMessage(response, "Your email has been verified successfully.");
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}

export function decodeVerificationToken(token: string) {
    try {
        return decodeURIComponent(token);
    } catch {
        return token;
    }
}