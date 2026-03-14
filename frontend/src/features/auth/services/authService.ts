import type { VerifyEmailInput } from "@/features/auth/types/verify-email";
import { getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import { RegisterInstitutionInput } from "@/features/auth/types/register-institution";
import type { LoginInput } from "@/features/auth/types/login";

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

const loginUrl = "/api/Auth/login";

export type LoginResult = {
    message: string;
    token?: string;
};

export async function login(payload: LoginInput): Promise<LoginResult> {
    try {
        const response = await post<unknown, LoginInput>(loginUrl, payload, {
            headers: {
                Accept: "text/plain",
            },
        });

        return {
            message: getApiSuccessMessage(response, "Login successful."),
            token: getAuthToken(response),
        };
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}

function getAuthToken(responseData: unknown): string | undefined {
    if (!responseData || typeof responseData !== "object") {
        return undefined;
    }

    const rootToken = getStringValue(responseData, "token")
        || getStringValue(responseData, "accessToken")
        || getStringValue(responseData, "jwt");

    if (rootToken) {
        return rootToken;
    }

    const nestedData = getObjectValue(responseData, "data");
    if (!nestedData) {
        return undefined;
    }

    return getStringValue(nestedData, "token")
        || getStringValue(nestedData, "accessToken")
        || getStringValue(nestedData, "jwt");
}

function getStringValue(source: unknown, key: string): string | undefined {
    if (!source || typeof source !== "object") {
        return undefined;
    }

    const value = (source as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
        return value;
    }

    return undefined;
}

function getObjectValue(source: unknown, key: string): Record<string, unknown> | undefined {
    if (!source || typeof source !== "object") {
        return undefined;
    }

    const value = (source as Record<string, unknown>)[key];
    if (value && typeof value === "object") {
        return value as Record<string, unknown>;
    }

    return undefined;
}
