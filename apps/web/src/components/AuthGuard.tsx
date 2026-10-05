"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const { token, initialize } = useAuth();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        initialize();
        setChecked(true);
    }, []);

    useEffect(() => {
        // Only redirect after initialization check
        if (checked && !token) {
            // Simple check: In local dev, we rely on token presence in localStorage
            const stored = localStorage.getItem("token");
            if (!stored) {
                router.push("/login");
            }
        }
    }, [token, checked, router]);

    if (!checked || (!token && typeof window !== "undefined" && !localStorage.getItem("token"))) {
        // Show loading spinner while checking auth
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
