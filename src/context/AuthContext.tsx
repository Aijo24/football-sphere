'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    loading: true,
    signIn: async (email: string, password: string) => {},
    signOut: async () => {},
    logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (user: User) => {
        setUser(user);
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                setUser(null);
                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const signIn = async (email: string, password: string) => {
        // Implement your sign in logic here
    };

    const signOut = async () => {
        // You can reuse your logout logic here or implement new logic
        return logout();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}