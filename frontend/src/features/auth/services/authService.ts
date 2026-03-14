import type { VerifyEmailInput } from "@/features/auth/types/verify-email";
import { getApiErrorMessage, getApiSuccessMessage, post } from "@/lib/api-request";
import { RegisterInstitutionInput } from "@/features/auth/types/register-institution";
import type { LoginInput } from "@/features/auth/types/login";
import type { AuthUser } from "@/store/useAuthStore";

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
    token: string;
    user: AuthUser;
};

export async function login(payload: LoginInput): Promise<LoginResult> {
    try {
        const response = await post<unknown, LoginInput>(loginUrl, payload, {
            headers: {
                Accept: "text/plain",
            },
        });

        const data = getObjectValue(response, "data") ?? (response as Record<string, unknown>);
        const token = getStringValue(data, "token")
            || getStringValue(data, "accessToken")
            || getStringValue(data, "jwt");

        if (!token) {
            throw new Error("Authentication token not received from server.");
        }

        const user: AuthUser = {
            email: getStringValue(data, "email") ?? "",
            fullName: getStringValue(data, "fullName") ?? "",
            role: (getStringValue(data, "role") ?? "InstitutionManager") as AuthUser["role"],
            isEmailVerified: getBoolValue(data, "isEmailVerified"),
            isInstitutionVerified: getBoolValue(data, "isInstitutionVerified"),
            institutionId: getStringValue(data, "institutionId") ?? null,
            institutionName: getStringValue(data, "institutionName") ?? null,
        };

        return {
            message: getApiSuccessMessage(response, "Login successful."),
            token,
            user,
        };
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
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

function getBoolValue(source: unknown, key: string): boolean {
    if (!source || typeof source !== "object") {
        return false;
    }

    const value = (source as Record<string, unknown>)[key];
    return value === true || value === "True" || value === "true";
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
