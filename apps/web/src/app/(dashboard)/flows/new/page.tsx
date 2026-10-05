"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Play, FileText, ShoppingBag, Stethoscope, Utensils, MessageCircle, ChevronRight, Check, Sparkles } from "lucide-react";

export default function NewFlowPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        api.get('/api/flows/templates')
            .then(res => setTemplates(res.data))
            .finally(() => setLoading(false));
    }, []);

    const createFromTemplate = async (templateId: string) => {
        setCreating(true);
        try {
            await api.post("/api/flows/templates/instantiate", { templateId });
            router.push("/flows");
        } catch (e) {
            alert("Failed to create flow");
            setCreating(false);
        }
    };

    const createBlank = async () => {
        setCreating(true);
        try {
            const startId = 'n_' + Math.random().toString(36).substr(2, 9);
            await api.post("/api/flows", {
                name: "Untitled Flow",
                type: "KEYWORD",
                nodes: [{ id: startId, type: "MESSAGE", position: { x: 50, y: 50 }, data: { label: "Start" } }],
                edges: [],
            });
            router.push("/flows");
        } catch (e) {
            alert("Failed to create flow");
            setCreating(false);
        }
    };

    const getIcon = (industry: string) => {
        switch (industry) {
            case 'boutique': return <ShoppingBag className="h-5 w-5 text-pink-600" />;
            case 'clinic': return <Stethoscope className="h-5 w-5 text-blue-600" />;
            case 'restaurant': return <Utensils className="h-5 w-5 text-orange-600" />;
            case 'support': return <MessageCircle className="h-5 w-5 text-purple-600" />;
            default: return <FileText className="h-5 w-5 text-slate-600" />;
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Flow</h1>
                    <p className="text-slate-500">Choose a production-ready template or start from scratch.</p>
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guided Builder (New) */}
                <Card className="hover:border-blue-400 transition-all cursor-pointer group border-blue-100 bg-blue-50/50" onClick={() => router.push('/flows/guided')}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900">Guided Builder</h3>
                                <p className="text-slate-600 text-sm">Standard flow? Let us build it for you.</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-blue-300 group-hover:text-blue-600" />
                    </CardContent>
                </Card>

                {/* Blank Option */}
                <Card className="hover:border-green-400 transition-all cursor-pointer group" onClick={createBlank}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <PlusIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900">Blank Flow</h3>
                                <p className="text-slate-500 text-sm">Start with an empty canvas</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-green-600" />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="font-semibold text-lg text-slate-800">Production Templates</h2>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((t) => (
                            <Card key={t.id} className="group hover:shadow-md transition-all border-slate-200">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-md">
                                            {getIcon(t.meta.industry)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-slate-900">{t.meta.title}</CardTitle>
                                            <Badge variant="secondary" className="mt-1 text-xs font-normal text-slate-500">
                                                {t.meta.industry.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                                        {t.meta.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button
                                        className="w-full bg-slate-900 group-hover:bg-green-600 transition-colors"
                                        onClick={() => createFromTemplate(t.id)}
                                        disabled={creating}
                                    >
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                        Use Template
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
