"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AuthGuard from "@/components/AuthGuard";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isInbox = pathname === '/inbox';
    const isNewBroadcast = pathname === '/broadcasts/new';
    const isFullWidth = isInbox || isNewBroadcast;

    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0">
                    <Topbar />
                    <main className={`flex-1 overflow-y-auto scrollbar-hide bg-slate-50/50 ${isFullWidth ? 'p-0' : 'p-6'}`}>
                        {isFullWidth ? (
                            <div className="h-full w-full">
                                {children}
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto space-y-6">
                                {children}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
