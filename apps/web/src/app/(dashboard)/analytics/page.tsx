"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, MessageCircle, BarChart2, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
    const [funnel, setFunnel] = useState<any>(null);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [engagement, setEngagement] = useState<any>(null);
    const [flows, setFlows] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [f, b, e, fl, t] = await Promise.all([
                    api.get("/api/analytics/funnel"),
                    api.get("/api/analytics/broadcasts"),
                    api.get("/api/analytics/engagement"),
                    api.get("/api/analytics/flows"),
                    api.get("/api/analytics/tags")
                ]);

                setFunnel(f.data);
                setBroadcasts(b.data);
                setEngagement(e.data);
                setFlows(fl.data);
                setTags(t.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h2>
                <p className="text-sm text-slate-500">Insights into your messaging performance.</p>
            </div>

            {/* 1. Delivery Funnel */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FunnelCard label="Messages Sent" value={funnel?.sent} icon={SendIcon} color="text-blue-600 bg-blue-50" />
                <FunnelCard label="Delivered" value={funnel?.delivered} icon={CheckIcon} color="text-green-600 bg-green-50" />
                <FunnelCard label="Read (Est.)" value={funnel?.read} icon={EyeIcon} color="text-teal-600 bg-teal-50" />
                <FunnelCard label="Replies" value={funnel?.replies} icon={ReplyIcon} color="text-purple-600 bg-purple-50" />
                <FunnelCard label="Failed" value={funnel?.failed} icon={AlertIcon} color="text-red-600 bg-red-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2. Broadcast Performance */}
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Broadcast Performance</CardTitle>
                        <CardDescription>Recent campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2 text-center">Sent</th>
                                        <th className="p-2 text-center">Read</th>
                                        <th className="p-2 text-center">Replies</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {broadcasts.map(b => (
                                        <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                            <td className="p-2 font-medium truncate max-w-[120px]">{b.name}</td>
                                            <td className="p-2 text-center">{b.sent}</td>
                                            <td className="p-2 text-center">{b.read}</td>
                                            <td className="p-2 text-center">{b.replies}</td>
                                        </tr>
                                    ))}
                                    {broadcasts.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No data</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Customer Engagement */}
                <div className="grid gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{engagement?.total}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                <span className="text-green-600 font-medium">{engagement?.new} new</span> this month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active (7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{engagement?.active}</div>
                            <div className="h-2 w-full bg-slate-100 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${(engagement?.active / engagement?.total * 100) || 0}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 4. Flow Performance */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Automation Flows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-2">Flow</th>
                                    <th className="p-2 text-center">Triggered</th>
                                    <th className="p-2 text-center">Completed</th>
                                    <th className="p-2 text-center">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flows.map((f, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="p-2">{f.name}</td>
                                        <td className="p-2 text-center">{f.triggered}</td>
                                        <td className="p-2 text-center">{f.completed}</td>
                                        <td className="p-2 text-center font-bold text-slate-700">
                                            {f.triggered ? Math.round((f.completed / f.triggered) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                                {flows.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No flow data</td></tr>}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* 5. Tag Distribution */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Audience Segments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tags.map((t, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium">{t.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min((t.count / (engagement?.total || 1)) * 100, 100)}%` }} />
                                        </div>
                                        <span className="text-sm text-slate-500 w-8 text-right">{t.count}</span>
                                    </div>
                                </div>
                            ))}
                            {tags.length === 0 && <div className="text-center text-slate-400 py-4">No tags created</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Icons
import { Send as SendIcon, CheckCircle as CheckIcon, Eye as EyeIcon, Reply as ReplyIcon, AlertCircle as AlertIcon } from "lucide-react";

function FunnelCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className={`p-2 rounded-full ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{value || 0}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
            </CardContent>
        </Card>
    );
}
