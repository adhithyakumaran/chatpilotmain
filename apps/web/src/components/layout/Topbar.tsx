"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from 'next/link';

export default function Topbar() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Workspace / </span>
                <span className="text-sm font-semibold text-slate-900">General</span>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="h-8 text-xs border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 font-medium">
                    ● Connected
                </Button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <Link href="/notifications">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                        <Bell className="h-4 w-4" />
                    </button>
                </Link>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-900">Adhithya</p>
                        <p className="text-xs text-slate-500 font-medium">Owner</p>
                    </div>
                    <Avatar className="h-9 w-9 border border-slate-200 ring-2 ring-slate-50 cursor-pointer">
                        <AvatarFallback className="bg-green-600 text-white font-medium">AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
