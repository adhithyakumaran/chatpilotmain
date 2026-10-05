'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/inbox');
        }
    }, [user, loading, router]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex flex-col items-center gap-0 cursor-pointer group">
                        <span className="text-2xl font-bold tracking-tight text-zinc-900">ChatPilot</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to ChatPilot CRM
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <a href="/" className="font-medium text-brand-primary hover:text-indigo-500">
                        return to home
                    </a>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <button
                            onClick={signInWithGoogle}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-3"
                        >
                            <Chrome className="w-5 h-5 bg-white rounded-full text-brand-primary p-0.5" />
                            Continue with Google
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    WhatsApp automation & inbox
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
