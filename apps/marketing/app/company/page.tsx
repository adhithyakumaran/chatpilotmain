"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import BackButton from '@/components/BackButton';
import { Target, Lightbulb, Shield, Zap, TrendingUp, Heart, Users, Briefcase } from 'lucide-react';

export default function CompanyPage() {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 relative">
            <BackButton />
            <Navbar onTalkClick={() => setShowContact(true)} />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 font-bold text-sm uppercase tracking-wider mb-8 border border-orange-100">
                        About ChatPilot
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-zinc-900">
                        Automation for <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                            Every Business
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed mb-12">
                        ChatPilot is a next-generation customer communication and automation platform built to help businesses grow faster with less effort.
                        We empower companies to turn conversations into revenue through AI chatbots, WhatsApp broadcasting, email automation, and a unified CRM — all in one simple dashboard.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Target size={24} />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                            <p className="text-zinc-500 leading-relaxed">
                                To become the most trusted automation platform for SMBs globally — where businesses can manage conversations, build AI workflows, and scale customer engagement without increasing operational costs.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                                <Lightbulb size={24} />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                            <ul className="space-y-3 text-zinc-500">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                                    Help businesses automate 80% of customer communication
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                                    Reduce support response time to under 10 seconds
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                                    Enable WhatsApp, email, and AI campaigns for everyone
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                                    Enterprise-grade automation at small-business pricing
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Stand For */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">What We Stand For</h2>
                        <p className="text-zinc-500">Our core values that drive every decision we make.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "Simplicity",
                                desc: "Automation shouldn’t be complicated. We design every feature to be easy, intuitive, and beginner-friendly.",
                                color: "text-yellow-500",
                                bg: "bg-yellow-50"
                            },
                            {
                                icon: Heart,
                                title: "Customer First",
                                desc: "Your growth is our priority. We focus on real-world tools that improve your sales, support, and retention.",
                                color: "text-red-500",
                                bg: "bg-red-50"
                            },
                            {
                                icon: Shield,
                                title: "Security",
                                desc: "End-to-end safe data handling and reliable infrastructure to protect your customer conversations.",
                                color: "text-green-500",
                                bg: "bg-green-50"
                            },
                            {
                                icon: TrendingUp,
                                title: "Innovation",
                                desc: "We constantly push the boundaries with AI, automation, and communication technologies.",
                                color: "text-purple-500",
                                bg: "bg-purple-50"
                            }
                        ].map((value, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 group">
                                <div className={`w-12 h-12 ${value.bg} rounded-2xl flex items-center justify-center ${value.color} mb-6 group-hover:scale-110 transition-transform`}>
                                    <value.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.2]"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Why Businesses Choose Us</h2>
                        <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            "Easy-to-use AI automation",
                            "Affordable WhatsApp & email broadcasting",
                            "Seamless integration with tools",
                            "Reliable all-in-one platform",
                            "Fast customer support",
                            "Scales with your business"
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                                <span className="text-lg font-medium text-zinc-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-orange-600 font-bold uppercase tracking-wider text-sm mb-4 block">Our Story</span>
                    <h2 className="text-4xl font-bold mb-8">From Idea to Platform</h2>
                    <div className="prose prose-lg mx-auto text-zinc-500">
                        <p className="mb-6">
                            ChatPilot started with a simple idea: <strong>Small businesses deserve enterprise-level automation without paying enterprise-level prices.</strong>
                        </p>
                        <p>
                            What began as a simple WhatsApp automation tool evolved into a complete customer engagement platform — trusted by marketers, startups, and growing businesses across industries. We saw the gap between complex, expensive enterprise tools and simple, limited plugins. ChatPilot fills that gap.
                        </p>
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-20 bg-zinc-50 border-t border-zinc-100">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="bg-black rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid.svg')] opacity-10"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/30 rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Join Us building the future.</h2>
                            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                                Whether you're a startup, agency, or enterprise, ChatPilot helps you communicate smarter, automate faster, and grow predictably.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200"
                                >
                                    Get In Touch
                                </button>
                                <a
                                    href="/pricing"
                                    className="px-8 py-4 bg-transparent border border-zinc-700 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                                >
                                    View Pricing
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </div>
    );
};

// Start Icon helper
function CheckCircle2({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

