'use client';

import { useState, useEffect } from 'react';
import { getNotifications } from '@/services/userApi';
import { Bell, Loader2, MessageSquare, Info } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">WhatsApp CRM alerts and campaign updates for your workspace.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative pl-12">
                            <div className="absolute left-4 top-4">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${notif.courseId ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {notif.courseId ? <MessageSquare className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {notif.message}
                                </p>
                                {notif.courseId && (
                                    <div className="pt-2">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            Course Update
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
