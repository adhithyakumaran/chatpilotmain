"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Bot,
    Database,
    CheckCircle2,
    ArrowRight,
    Image as ImageIcon,
    BarChart,
} from 'lucide-react';
import Script from 'next/script';
import { motion } from 'framer-motion';

// --- 1. UTILITY COMPONENTS ---

const ImagePlaceholder = ({ label, height = "h-full", iconScale = 1 }: { label?: string, height?: string, iconScale?: number }) => (
    <div className={`w-full ${height} bg-zinc-50 border border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400 gap-4 p-6 transition-all hover:bg-zinc-100 group border-dashed relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center border border-zinc-200 group-hover:scale-110 transition-transform duration-500 shadow-sm z-10`}>
            <ImageIcon className="text-zinc-400" size={32 * iconScale} />
        </div>
        <p className="text-sm font-semibold tracking-wide uppercase z-10 text-zinc-500">{label || "Asset Placeholder"}</p>
    </div>
);

// --- 2. SECTIONS ---

import Navbar from '@/components/Navbar';
import FAQ from '@/components/FAQ';

const Hero = ({ onLetGoClick }: { onLetGoClick: () => void }) => {
    return (
        <section className="relative pt-24 md:pt-40 pb-16 md:pb-20 overflow-hidden bg-[#FDFDFD]">
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-zinc-50 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 mb-6 md:mb-8 max-w-5xl leading-[1.05]"
                >
                    The Fastest Way To <br />
                    <span className="text-zinc-400">Automate</span> Your Growth.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-base md:text-xl text-zinc-500 max-w-2xl mb-10 md:mb-12 leading-relaxed font-medium"
                >
                    Effortlessly transform customer conversations into revenue.
                    Bulk WhatsApp broadcasting, AI chatbots, and CRM automation.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={onLetGoClick}
                    className="bg-[#FF5500] text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-lg font-bold hover:bg-[#E64D00] shadow-xl shadow-orange-500/20 mb-16 md:mb-20 flex items-center gap-2"
                >
                    Let's Go — Start Now
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-full mt-6 md:mt-10"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="w-full bg-[#F8F9FA] rounded-2xl md:rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-1 md:p-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                        <img
                            src="/images/cover-2.png"
                            alt="Dashboard UI"
                            className="w-full h-auto object-cover md:object-contain rounded-xl md:rounded-[2rem] shadow-sm transform transition-transform duration-700 group-hover:scale-[1.01]"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

const Logos = () => {
    const logos = [
        "Borrowbox", "Kind", "Hatchhub", "Blueprint", "Cornerstone Cafe",
        "GreenLeaf Studios", "Grewbie", "The House of Medussa"
    ];

    // Duplicate logos to ensure seamless scrolling
    const marqueeLogos = [...logos, ...logos];

    return (
        <section className="py-12 bg-white border-b border-zinc-100 overflow-hidden">
            <div className="max-w-[100vw]">
                <p className="text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">Trusted by growing companies</p>
                <div className="flex w-max animate-marquee group hover:[animation-play-state:paused]">
                    {marqueeLogos.map((logo, i) => (
                        <div key={i} className="flex items-center justify-center mx-6 md:mx-12 grayscale opacity-40 hover:opacity-100 transition-all duration-300">
                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 whitespace-nowrap">{logo}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    return (
        <section id="features" className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <div className="mx-auto w-12 h-12 mb-6 text-black">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full animate-spin-slow">
                            <path d="M12 2v20M2 12h20M4.929 4.929l14.142 14.142M4.929 19.071L19.071 4.929" />
                        </svg>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight"
                    >
                        Transform Your Data Into <br />Actionable Insights
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="md:col-span-2 bg-[#F5F5F7] rounded-[2rem] p-10 hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                <MessageSquare className="w-8 h-8 text-green-600" />
                            </div>
                            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-zinc-600 border border-zinc-100">Most Popular</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 mb-4">WhatsApp Automation</h3>
                        <p className="text-zinc-500 text-lg mb-10 max-w-md leading-relaxed">
                            Broadcast messages to thousands. 98% open rates. The ultimate engagement channel.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="md:col-span-1 bg-zinc-900 text-white rounded-[2rem] p-10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                        <div>
                            <div className="p-4 bg-zinc-800 w-fit rounded-2xl mb-8">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">AI Agents</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                24/7 Support bots that actually sound human.
                            </p>
                        </div>
                        <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between cursor-pointer group/link">
                            <span className="font-bold">Configure</span>
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover/link:translate-x-2 transition-transform">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-1 bg-white border border-zinc-200 rounded-[2rem] p-10 hover:border-zinc-300 transition-colors"
                    >
                        <div className="p-4 bg-blue-50 w-fit rounded-2xl mb-8">
                            <Database className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 mb-4">CRM Sync</h3>
                        <p className="text-zinc-500 mb-8">
                            Push leads directly to Salesforce, HubSpot, or Zoho instantly.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="md:col-span-2 bg-orange-50 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-10 hover:bg-orange-100/50 transition-colors border border-orange-100"
                    >
                        <div className="flex-1">
                            <div className="p-4 bg-white w-fit rounded-2xl mb-8 shadow-sm">
                                <BarChart className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-4">Deep Analytics</h3>
                            <p className="text-zinc-600 text-lg mb-6">
                                Track open rates, click-throughs, and revenue attribution in real-time.
                            </p>
                            <ul className="space-y-3">
                                {['Real-time Dashboards', 'Export to PDF/CSV', 'ROI Calculator'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-zinc-800 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-orange-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const CTA = () => {
    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-zinc-800/50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600/30 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                        Ready to scale?
                    </h2>
                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                        Join 1,000+ businesses using ChatPilot to automate their growth engine today.
                    </p>
                    <motion.a
                        href="/pricing"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-zinc-200 transition-all shadow-xl shadow-white/20"
                    >
                        View Pricing →
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

// --- MODALS ---

import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import PaymentModal from '@/components/PaymentModal';
import ContactForm from '@/components/ContactForm';

import Footer from '@/components/Footer';

// --- 3. MAIN EXPORT ---

export default function Home() {
    const [showContact, setShowContact] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <Navbar onTalkClick={() => setShowContact(true)} />
            <main>
                <Hero onLetGoClick={() => setShowPayment(true)} />
                <Logos />
                <Features />
                <FAQ />
                <CTA />
                <ContactForm />
            </main>
            <Footer />

            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
            <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />
        </div>
    );
}
