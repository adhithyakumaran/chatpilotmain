"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Broadcast = {
    id: string;
    name: string;
    message: string;
    audienceType: string;
    status: string;
    stats: { sent: number; failed: number; total: number };
    createdAt: string;
};

export default function BroadcastHistory() {
    const [items, setItems] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/broadcasts")
            .then((res) => setItems(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="mt-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-3">Campaign Name</th>
                            <th className="p-3">Message Preview</th>
                            <th className="p-3">Audience</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Sent</th>
                            <th className="p-3 text-center">Failed</th>
                            <th className="p-3 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400">No broadcasts found.</td>
                            </tr>
                        )}
                        {items.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-medium text-slate-900">{b.name}</td>
                                <td className="p-3 text-slate-500 truncate max-w-[200px]" title={b.message}>{b.message}</td>
                                <td className="p-3 text-slate-600">
                                    <Badge variant="outline" className="font-normal">{b.audienceType}</Badge>
                                </td>
                                <td className="p-3">
                                    <Badge variant={b.status === 'COMPLETED' ? 'default' : 'secondary'}
                                        className={b.status === 'COMPLETED' ? "bg-green-100 text-green-700 pointer-events-none shadow-none" : "bg-yellow-100 text-yellow-700 shadow-none"}>
                                        {b.status}
                                    </Badge>
                                </td>
                                <td className="p-3 text-center text-slate-700">{b.stats?.sent || 0}</td>
                                <td className="p-3 text-center text-red-600">{b.stats?.failed || 0}</td>
                                <td className="p-3 text-right text-slate-400 text-xs">
                                    {new Date(b.createdAt).toLocaleDateString()} <br />
                                    {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
