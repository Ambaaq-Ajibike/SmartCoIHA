import { create } from 'zustand';

export type UserRole = 'Admin' | 'InstitutionManager';

export interface AuthUser {
    email: string;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
    isInstitutionVerified: boolean;
    institutionId: string | null;
    institutionName: string | null;
}

interface AuthState {
    user: AuthUser | null;
    isHydrated: boolean;
    setAuth: (user: AuthUser, token: string) => void;
    hydrate: () => void;
    logout: () => void;
}

const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isHydrated: false,

    setAuth: (user, token) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        set({ user });
    },

    hydrate: () => {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            const user = stored ? (JSON.parse(stored) as AuthUser) : null;
            set({ user, isHydrated: true });
        } catch {
            set({ user: null, isHydrated: true });
        }
    },

    logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        set({ user: null });
    },
}));