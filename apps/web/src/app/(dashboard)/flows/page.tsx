"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Edit, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Flow {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
}

export default function FlowsPage() {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadFlows = async () => {
        try {
            const res = await api.get("/api/flows/business/me");
            setFlows(res.data);
        } catch (e) {
            console.error("Failed to load flows", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFlows();
    }, []);

    const activateFlow = async (id: string) => {
        try {
            await api.post(`/api/flows/${id}/activate`);
            loadFlows();
        } catch (e) {
            console.error("Failed to toggle status", e);
        }
    };

    const deleteFlow = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flow?")) return;
        try {
            await api.delete(`/api/flows/${id}`);
            loadFlows();
        } catch (e) {
            console.error("Failed to delete flow", e);
            alert("Failed to delete flow");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Flows</h2>
                    <p className="text-sm text-slate-500">Manage your conversation workflows</p>
                </div>
                <Button onClick={() => router.push("/flows/new")} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> New Flow
                </Button>
            </div>

            <div className="space-y-3">
                {flows.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-200">
                        <p className="text-slate-500 mb-4">No flows found. Create your first one!</p>
                        <Button variant="outline" onClick={() => router.push("/flows/new")}>
                            Create Flow
                        </Button>
                    </div>
                )}

                {flows.map((flow) => (
                    <Card key={flow.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="flex justify-between items-center p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg text-slate-900">{flow.name}</h3>
                                    {flow.isActive ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500 bg-slate-50">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 font-mono text-xs">ID: {flow.id}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                        checked={flow.isActive}
                                        onCheckedChange={() => activateFlow(flow.id)}
                                    />
                                    <span className={`text-xs font-medium ${flow.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                        {flow.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/flows/${flow.id}`)}
                                    className="text-slate-700 border-slate-200 hover:bg-slate-50"
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => deleteFlow(flow.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Flow
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
