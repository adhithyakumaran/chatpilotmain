'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Sync user to backend
            if (currentUser) {
                try {
                    const { syncUserProfile } = await import('@/services/userApi');
                    await syncUserProfile({
                        userId: currentUser.uid,
                        email: currentUser.email,
                        name: currentUser.displayName,
                        photoUrl: currentUser.photoURL,
                        provider: currentUser.providerData[0]?.providerId || 'unknown'
                    });
                } catch (e) {
                    console.error("Failed to sync user", e);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/inbox');
        } catch (error: any) {
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('User cancelled login.'); // Info level instead of error
                toast.error('Sign-in cancelled', {
                    description: 'You closed the login popup before signing in.'
                });
            } else {
                console.error('Error signing in with Google', error);
                toast.error('Sign-in failed', {
                    description: error.message || 'Something went wrong. Please try again.'
                });
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
