"use client";

import React from 'react';
import { Mail, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/images/chatpilot-lg.png" alt="ChatPilot" className="h-16 md:h-24 w-auto" />
                        </div>
                        <p className="text-zinc-500 mb-6 max-w-xs text-sm leading-relaxed">
                            The all-in-one automation platform for WhatsApp, Email, and AI Agents.
                        </p>
                    </div>

                    {[
                        { title: "Product", items: ["WhatsApp API", "AI Chatbots", "Email Marketing", "CRM Sync"] },
                        { title: "Company", items: ["About Us", "Careers", "Blog", "Contact"] },
                        { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Cookie Policy"] }
                    ].map((col, idx) => (
                        <div key={idx}>
                            <h4 className="text-black font-bold mb-6">{col.title}</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                {col.items.map(item => (
                                    <li key={item} className="hover:text-black cursor-pointer transition-colors">{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-400 text-sm">© 2025 ChatPilot Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-zinc-400">
                        <Globe size={20} className="hover:text-black cursor-pointer" />
                        <Mail size={20} className="hover:text-black cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
