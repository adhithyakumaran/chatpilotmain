"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smartphone, CheckCircle, RefreshCcw, LogOut } from "lucide-react";

export default function ConnectPage() {
    const [status, setStatus] = useState("LOADING");
    const [phone, setPhone] = useState("");
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchStatus = async () => {
        try {
            const res = await api.get("/api/session/status");
            setStatus(res.data.status);
            if (res.data.user) setUser(res.data.user);
        } catch (e) {
            console.error("Status check failed", e);
        }
    };

    // Poll status
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handlePairing = async () => {
        if (!phone) return alert("Enter phone number");
        setLoading(true);
        try {
            const res = await api.post("/api/session/pair", { phone });
            if (res.data.code) {
                setPairingCode(res.data.code);
            }
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to get code");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm("Are you sure? This will disconnect the bot.")) return;
        setLoading(true);
        try {
            await api.post("/api/session/logout");
            setStatus("DISCONNECTED");
            setUser(null);
            setPairingCode(null);
        } catch (e) { }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pt-10">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Connect WhatsApp</h1>
                <p className="text-slate-500">Link your business number to start automating.</p>
            </div>

            <Card className="border-slate-200 shadow-lg">
                <CardHeader className="pb-4 border-b border-slate-50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-slate-500" />
                            Device Status
                        </CardTitle>
                        <Badge variant={status === 'CONNECTED' ? 'default' : 'secondary'} className={status === 'CONNECTED' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                            {status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    {/* LOADING STATE */}
                    {status === 'LOADING' && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-slate-300" />
                        </div>
                    )}

                    {/* CONNECTED STATE */}
                    {status === 'CONNECTED' && (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900">You are connected!</h3>
                                <p className="text-slate-500 mt-1">{user?.id ? `Linked as +${user.id.split(':')[0]}` : "Ready to send and receive messages."}</p>
                            </div>
                            <Button variant="destructive" onClick={handleLogout} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <LogOut className="mr-2 h-4 w-4" /> Disconnect
                            </Button>
                        </div>
                    )}

                    {/* DISCONNECTED / PAIRING STATE */}
                    {(status === 'DISCONNECTED' || status === 'IDLE' || status === 'SCANNING') && (
                        <div className="space-y-6">
                            {!pairingCode ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. 919876543210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="text-lg"
                                            />
                                            <Button onClick={handlePairing} disabled={loading || !phone} size="lg" className="bg-green-600 hover:bg-green-700">
                                                {loading ? <Loader2 className="animate-spin" /> : "Get Code"}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500">Enter full number with country code (no + symbol). Example: <span className="font-mono">919876543210</span></p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
                                        <p className="font-medium mb-2">Instructions:</p>
                                        <ol className="list-decimal pl-4 space-y-1">
                                            <li>Open WhatsApp on your phone.</li>
                                            <li>Go to <span className="font-semibold">Settings {'>'} Linked Devices</span>.</li>
                                            <li>Tap <span className="font-semibold">Link a Device</span>.</li>
                                            <li>Tap <span className="font-semibold">Link with phone number instead</span>.</li>
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 animate-in zoom-in duration-300">
                                    <h3 className="text-lg font-medium text-slate-900">Enter this code on your phone</h3>
                                    <div className="flex justify-center">
                                        <div className="bg-slate-100 px-8 py-4 rounded-xl border border-slate-300">
                                            <span className="text-4xl font-mono font-bold tracking-widest text-slate-800">
                                                {pairingCode?.toUpperCase().match(/.{1,4}/g)?.join('-')}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500">Wait for simple confirmation...</p>

                                    <Button variant="ghost" onClick={() => setPairingCode(null)} className="text-xs text-slate-400">
                                        Cancel / Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
