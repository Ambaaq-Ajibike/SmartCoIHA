import { create } from 'zustand';

interface User {
    email: string;
    fullName: string;
    role: string;
    institutionId?: string;
}

interface AuthState {
    user: User | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user });
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null });
    },
}));