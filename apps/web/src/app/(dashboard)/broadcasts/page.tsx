"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import BroadcastHistory from "@/components/broadcast/BroadcastHistory";

export default function BroadcastsPage() {
    const router = useRouter();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Broadcasts</h2>
                    <p className="text-sm text-slate-500">Track your past campaigns and performance.</p>
                </div>
                <Button onClick={() => router.push("/broadcasts/new")} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> New Broadcast
                </Button>
            </div>

            <BroadcastHistory />
        </div>
    );
}
