"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactFlowProvider } from '@xyflow/react';
import FlowBuilder from "@/components/flow/FlowBuilder";

export default function EditFlowPage() {
    const { id } = useParams();
    const router = useRouter();
    const [flow, setFlow] = useState<any>(null);

    useEffect(() => {
        api.get(`/api/flows/${id}`).then((res) => {
            setFlow(res.data);
        });
    }, [id]);

    const handleSave = async (nodes: any[], edges: any[]) => {
        try {
            await api.put(`/api/flows/${id}`, {
                nodes: nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    position: n.position,
                    data: n.data
                })),
                edges: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    data: e.data
                })),
                name: flow.name,
                type: flow.type,
                priority: flow.priority,
                status: flow.status
            });
            alert("Flow saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save");
        }
    };

    if (!flow) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-80px)] w-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-3 bg-white border-b">
                <Button variant="ghost" size="icon" onClick={() => router.push("/flows")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-semibold text-slate-800">{flow.name}</h1>
                    <p className="text-xs text-slate-500 uppercase">{flow.type}</p>
                </div>
            </div>

            <div className="flex-1 w-full h-full">
                <ReactFlowProvider>
                    <FlowBuilder
                        initialData={{
                            nodes: (flow.nodes || []).map((n: any) => ({
                                ...n,
                                position: {
                                    x: Number(n.position?.x) || 0,
                                    y: Number(n.position?.y) || 0
                                }
                            })),
                            edges: flow.edges || []
                        }}
                        onSave={handleSave}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
