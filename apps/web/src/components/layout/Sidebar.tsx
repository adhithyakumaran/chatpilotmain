"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Workflow,
    BarChart3,
    Image as ImageIcon,
    Users,
    Settings,
    Send,
    Tag,
    UserCircle,
    UsersRound,
    MessageSquare,
    Smartphone,
    Package
} from "lucide-react";

// Navigation Groups
const groups = [
    {
        label: "Apps",
        items: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard },
            { name: "Inbox", href: "/inbox", icon: MessageSquare },
            { name: "Broadcasts", href: "/broadcasts", icon: Send },
            { name: "Flows", href: "/flows", icon: Workflow },
            { name: "Customers", href: "/customers", icon: UsersRound },
        ]
    },
    {
        label: "Admin Panel",
        items: [
            { name: "Inventory", href: "/products", icon: Package },
            { name: "Tags & Vars", href: "/tags", icon: Tag },
            { name: "Payments", href: "/payments", icon: BarChart3 },
            { name: "Media", href: "/media", icon: ImageIcon },
            { name: "Connect", href: "/connect", icon: Smartphone },
            { name: "Workspace", href: "/settings", icon: Settings },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col h-full shadow-sm z-20">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="font-bold text-white">C</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    ChatPilot
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-6">
                {groups.map((group, i) => (
                    <div key={i}>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                            {group.label}
                        </h4>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                                            isActive
                                                ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-100 hidden">
                {/* Hidden users link for now as it duplicates customers/settings? 
                    Actually nav has UsersRound for customers. 
                    Let's keep settings in nav array to be consistent. 
                 */}
            </div>
        </aside>
    );
}
