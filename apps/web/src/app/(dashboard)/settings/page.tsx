"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [config, setConfig] = useState<any>({
        products: true,
        payments: false,
        analytics: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get("/api/business/me");
            setBusiness(res.data);
            if (res.data.workspaceConfig) {
                try {
                    const parsed = JSON.parse(res.data.workspaceConfig);
                    setConfig((prev: any) => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Config parse error", e);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/api/business/me", {
                name: business.name,
                workspaceConfig: config
            });
            toast.success("Settings saved successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Settings</h2>
                <p className="text-sm text-slate-500">Manage your business configuration and modules</p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Your business identity on Converso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                value={business?.name || ""}
                                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Modules */}
                <Card>
                    <CardHeader>
                        <CardTitle>Modules</CardTitle>
                        <CardDescription>Enable or disable platform features for your workspace</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Product Management</Label>
                                <p className="text-sm text-slate-500">
                                    Enable inventory tracking and dynamic product messages in flows.
                                </p>
                            </div>
                            <Switch
                                checked={config.products}
                                onCheckedChange={(c) => setConfig({ ...config, products: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Payments</Label>
                                <p className="text-sm text-slate-500">
                                    Process transactions via Razorpay/Stripe links.
                                </p>
                            </div>
                            <Switch
                                checked={config.payments}
                                onCheckedChange={(c) => setConfig({ ...config, payments: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Agent Inbox</Label>
                                <p className="text-sm text-slate-500">
                                    Enable human handoff and live chat capabilities.
                                </p>
                            </div>
                            <Switch
                                checked={config.inbox !== false} // Default true
                                onCheckedChange={(c) => setConfig({ ...config, inbox: c })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
