"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import PaymentModal from '@/components/PaymentModal';
import Link from 'next/link';
import { CheckCircle2, Zap, ArrowLeft } from 'lucide-react';
import Script from 'next/script';
import BackButton from '@/components/BackButton';

const Pricing = ({ onTalkClick, onPaymentClick }: { onTalkClick: () => void, onPaymentClick: () => void }) => {
    return (
        <section className="py-32 bg-zinc-50 relative overflow-hidden min-h-screen pt-40">
            {/* Background enhancement */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.4]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-200/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full overflow-hidden">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">Choose the perfect plan for your growth journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
                    {/* Regular Plan */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 border border-zinc-200/80 shadow-lg flex flex-col hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 to-orange-500"></div>
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-[10px] uppercase tracking-wider mb-4 border border-orange-100/50 shadow-sm">
                                Starter
                            </span>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-bold text-zinc-900 tracking-tight">₹499</span>
                                <span className="text-zinc-400 font-medium text-sm">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed">Perfect for individuals & small teams just getting started.</p>
                        </div>

                        <div className="flex-1 mb-8">
                            <ul className="space-y-4">
                                {[
                                    "100 WhatsApp broadcasts",
                                    "100 email broadcasts",
                                    "AI Chatbot (basic)",
                                    "WhatsApp, Email, Web integrations",
                                    "2 agent accounts",
                                    "AI chatbot builder",
                                    "Basic automation workflows (5 workflows)",
                                    "2 GB media storage",
                                    "Inbox + CRM",
                                    "Basic analytics",
                                    "Standard support (email only)"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-zinc-600 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={onPaymentClick}
                            className="w-full py-4 text-center rounded-xl border border-zinc-200 font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-all bg-white shadow-sm text-sm">
                            Get Started
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 shadow-2xl shadow-blue-900/20 flex flex-col transform md:-translate-y-4 hover:-translate-y-6 transition-all duration-300 relative z-10 overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 right-0 p-6 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/30">
                                MOST POPULAR
                            </div>
                        </div>
                        <div className="mb-8 mt-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-4 border border-zinc-700">
                                Pro
                            </span>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-bold text-white tracking-tight">₹1299</span>
                                <span className="text-zinc-400 font-medium text-sm">/month</span>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed">For growing businesses that need power and scale.</p>
                        </div>

                        <div className="flex-1 mb-10">
                            <ul className="space-y-4">
                                {[
                                    "Unlimited WhatsApp broadcast",
                                    "Unlimited email campaigns",
                                    "Unlimited agent accounts",
                                    "Advanced automation flows (unlimited)",
                                    "Priority delivery for WhatsApp API",
                                    "Dedicated support team",
                                    "ChatGPT-powered AI agent",
                                    "20 GB media storage",
                                    "Advanced analytics dashboard",
                                    "Custom chatbot templates",
                                    "Role-based access control",
                                    "API access + webhook triggers",
                                    "Team collaboration tools"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={onPaymentClick}
                            className="w-full py-4 text-center rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-blue-500/25 text-sm">
                            Get Pro Plan
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 border border-zinc-200/80 shadow-lg flex flex-col hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-pink-500"></div>
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider mb-4 border border-red-100/50 shadow-sm">
                                Enterprise
                            </span>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-bold text-zinc-900 tracking-tight">Custom</span>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed">Custom tailored solutions for large organizations.</p>
                        </div>

                        <div className="flex-1 mb-8">
                            <ul className="space-y-4">
                                {[
                                    "SLA guarantee",
                                    "Custom integrations",
                                    "Unlimited storage",
                                    "White-label platform",
                                    "Dedicated account manager",
                                    "Advanced security package",
                                    "Multi-brand management",
                                    "24×7 phone support"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-zinc-600 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={onTalkClick}
                            className="w-full py-4 text-center rounded-xl border border-zinc-900 bg-zinc-900 text-white font-bold hover:bg-black transition-all shadow-lg text-sm">
                            Talk to Sales
                        </button>
                    </div>
                </div>

                {/* Extras Section */}
                <div className="max-w-4xl mx-auto px-4 md:px-0 pb-20">
                    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
                            <div className="flex-1 w-full">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <span className="text-2xl">🔥</span> Extras & Add-ons
                                </h3>
                                <p className="text-zinc-400 mb-8 text-sm">Customize your plan with premium power-ups as you need them.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                    {[
                                        "Extra WhatsApp templates",
                                        "Additional storage blocks",
                                        "Dedicated number rental",
                                        "Custom chatbot development",
                                        "Verified WhatsApp Green Tick",
                                        "Dedicated cloud hosting"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                            <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                            <span className="text-xs font-medium text-zinc-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={onTalkClick}
                                    className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-colors whitespace-nowrap shadow-lg hover:shadow-white/20">
                                    Chat with Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default function PricingPage() {
    const [showContact, setShowContact] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 relative">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <BackButton />

            <Navbar onTalkClick={() => setShowContact(true)} />
            <Pricing onTalkClick={() => setShowContact(true)} onPaymentClick={() => setShowPayment(true)} />
            <Footer />

            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
            <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />
        </div>
    );
}
