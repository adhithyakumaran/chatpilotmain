"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const servicesMenu = [
    {
        title: "AI & Automation",
        items: ["AI Chatbots (WhatsApp, Website)", "Lead Automation", "CRM Automation", "Email & Campaign Automation"]
    },
    {
        title: "Web Development",
        items: ["Corporate Websites", "Landing Pages", "E-Commerce Websites", "Custom Portals (app.chatpilot.co.in)"]
    },
    {
        title: "Digital Marketing",
        items: ["Social Media Management", "Google Ads / Meta Ads", "SEO Optimization", "Branding & Creative Design"]
    },
    {
        title: "Business Solutions",
        items: ["Inventory/ERP Systems", "Workflow Automation", "Billing & Invoicing Systems", "CRM Implementation"]
    }
];

const resourcesMenu = [
    {
        title: "Blog",
        items: ["Marketing", "Automation", "Tech Posts"]
    },
    {
        title: "Guides",
        items: ["WhatsApp Automation Guide", "Social Media Branding", "AI Customer Support"]
    },
    {
        title: "Templates",
        items: ["WhatsApp Message Templates", "Social Media Post Templates", "Landing Page Template", "Email Marketing Copy"]
    },
    {
        title: "Case Studies",
        items: ["Success Stories", "Client ROI", "Industry Reports"]
    }
];

const companyMenu = [
    {
        title: "Company",
        items: ["About Us", "Our Mission", "Our Vision", "Team"]
    },
    {
        title: "Legal & Contact",
        items: ["Careers", "Contact", "Privacy Policy", "Terms of Use"]
    }
];

const pricingMenu = [
    {
        title: "Regular",
        price: "₹499",
        period: "/month",
        desc: "Individuals & small teams",
        features: ["100 Broadcasts", "Basic Chatbot", "2 Agent Accounts"],
        color: "orange",
        highlight: false
    },
    {
        title: "Pro",
        price: "₹1299",
        period: "/month",
        desc: "Growing businesses",
        features: ["Unlimited Broadcasts", "ChatGPT Agent", "20 GB Storage"],
        color: "blue",
        highlight: true
    },
    {
        title: "Enterprise",
        price: "Custom",
        period: "",
        desc: "Large organizations",
        features: ["SLA Guarantee", "Custom Integrations", "Dedicated Support"],
        color: "red",
        highlight: false
    }
];

const Navbar = ({ onTalkClick }: { onTalkClick: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-zinc-100' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 py-2 md:py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5 cursor-pointer group">
                    <Link href="/">
                        <img
                            src="/images/chatpilot-lg.png"
                            alt="ChatPilot"
                            className="w-auto h-20 md:h-32 transition-transform group-hover:scale-105"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </Link>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-black transition-colors py-4">
                            Services <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full -left-10 w-[600px] bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 grid grid-cols-2 gap-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                            {servicesMenu.map((category) => (
                                <div key={category.title}>
                                    <h4 className="font-bold text-zinc-900 mb-3 text-sm">{category.title}</h4>
                                    <ul className="space-y-2">
                                        {category.items.map((item) => (
                                            <li key={item}>
                                                <a href="#" className="text-sm text-zinc-500 hover:text-[#FF5500] transition-colors block">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Pricing Dropdown */}
                    <div className="relative group">
                        <Link href="/pricing" className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-black transition-colors py-4">
                            Pricing <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </Link>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[900px] bg-white rounded-3xl shadow-2xl border border-zinc-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                            <Link href="/pricing" className="block">
                                <div className="grid grid-cols-3 gap-2 p-2">
                                    {pricingMenu.map((plan) => (
                                        <div key={plan.title} className={`p-6 rounded-2xl border ${plan.highlight ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'} transition-all group/card hover:-translate-y-1`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className={`font-bold ${plan.highlight ? 'text-white' : 'text-zinc-900'}`}>{plan.title}</h4>
                                                    <p className={`text-xs ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>{plan.desc}</p>
                                                </div>
                                                {plan.highlight && <span className="text-[10px] font-bold bg-blue-600 px-2 py-0.5 rounded-full text-white">POPULAR</span>}
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-zinc-900'}`}>{plan.price}</span>
                                                <span className={`text-xs ${plan.highlight ? 'text-zinc-500' : 'text-zinc-500'}`}>{plan.period}</span>
                                            </div>
                                            <ul className="space-y-2 mb-6">
                                                {plan.features.map(feat => (
                                                    <li key={feat} className={`text-xs flex items-center gap-2 ${plan.highlight ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                        <CheckCircle2 size={12} className={plan.highlight ? 'text-blue-500' : 'text-orange-500'} /> {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div
                                                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors text-center ${plan.highlight ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-300'}`}>
                                                {plan.price === "Custom" ? "Contact Sales" : "Choose Plan"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                            <Link href="/pricing" className="bg-zinc-50 rounded-b-[1.2rem] p-4 flex items-center justify-between border-t border-zinc-100 mx-2 mb-2 rounded-xl hover:bg-zinc-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-zinc-900">🔥 Extras & Add-ons available</span>
                                    <span className="text-xs text-zinc-500">Green Tick, Dedicated Server, Custom Dev</span>
                                </div>
                                <span className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                    View Extras <ArrowRight size={12} />
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-black transition-colors py-4">
                            Resources <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full -left-48 w-[600px] bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 grid grid-cols-2 gap-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                            {resourcesMenu.map((category) => (
                                <div key={category.title}>
                                    <h4 className="font-bold text-zinc-900 mb-3 text-sm">{category.title}</h4>
                                    <ul className="space-y-2">
                                        {category.items.map((item) => (
                                            <li key={item}>
                                                <a href="#" className="text-sm text-zinc-500 hover:text-[#FF5500] transition-colors block">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <Link href="/company" className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-black transition-colors py-4">
                            Company <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </Link>
                        <div className="absolute top-full -left-10 w-[400px] bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 grid grid-cols-2 gap-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                            {companyMenu.map((category) => (
                                <div key={category.title}>
                                    <h4 className="font-bold text-zinc-900 mb-3 text-sm">{category.title}</h4>
                                    <ul className="space-y-2">
                                        {category.items.map((item) => (
                                            <li key={item}>
                                                <Link href="/company" className="text-sm text-zinc-500 hover:text-[#FF5500] transition-colors block">
                                                    {item}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={onTalkClick}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-zinc-200">
                        Talk to Business
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-900 p-2">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-24 left-0 w-full bg-white border-b border-zinc-100 p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-5 shadow-xl h-[calc(100vh-6rem)] overflow-y-auto">
                    <div>
                        <button
                            onClick={() => setIsServicesOpen(!isServicesOpen)}
                            className="flex items-center justify-between w-full text-xl font-medium text-zinc-800"
                        >
                            Services <ChevronDown size={20} className={`transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isServicesOpen && (
                            <div className="mt-4 space-y-6 pl-4 border-l border-zinc-100 ml-1">
                                {servicesMenu.map((category) => (
                                    <div key={category.title}>
                                        <h5 className="font-bold text-zinc-900 text-sm mb-2">{category.title}</h5>
                                        <ul className="space-y-2">
                                            {category.items.map((item) => (
                                                <li key={item}>
                                                    <a href="#" className="text-sm text-zinc-600 block py-1" onClick={() => setIsOpen(false)}>
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => setIsPricingOpen(!isPricingOpen)}
                            className="flex items-center justify-between w-full text-xl font-medium text-zinc-800"
                        >
                            Pricing <ChevronDown size={20} className={`transition-transform ${isPricingOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isPricingOpen && (
                            <div className="mt-4 space-y-4 pl-4 border-l border-zinc-100 ml-1">
                                {pricingMenu.map((plan) => (
                                    <div key={plan.title} className="bg-zinc-50 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-zinc-900">{plan.title}</span>
                                            <span className="text-sm font-bold">{plan.price}</span>
                                        </div>
                                        <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-sm text-orange-600 font-medium block">
                                            View Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                            className="flex items-center justify-between w-full text-xl font-medium text-zinc-800"
                        >
                            Resources <ChevronDown size={20} className={`transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isResourcesOpen && (
                            <div className="mt-4 space-y-6 pl-4 border-l border-zinc-100 ml-1">
                                {resourcesMenu.map((category) => (
                                    <div key={category.title}>
                                        <h5 className="font-bold text-zinc-900 text-sm mb-2">{category.title}</h5>
                                        <ul className="space-y-2">
                                            {category.items.map((item) => (
                                                <li key={item}>
                                                    <a href="#" className="text-sm text-zinc-600 block py-1" onClick={() => setIsOpen(false)}>
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                            className="flex items-center justify-between w-full text-xl font-medium text-zinc-800"
                        >
                            Company <ChevronDown size={20} className={`transition-transform ${isCompanyOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCompanyOpen && (
                            <div className="mt-4 space-y-6 pl-4 border-l border-zinc-100 ml-1">
                                {companyMenu.map((category) => (
                                    <div key={category.title}>
                                        <h5 className="font-bold text-zinc-900 text-sm mb-2">{category.title}</h5>
                                        <ul className="space-y-2">
                                            {category.items.map((item) => (
                                                <li key={item}>
                                                    <Link href="/company" className="text-sm text-zinc-600 block py-1" onClick={() => setIsOpen(false)}>
                                                        {item}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { setIsOpen(false); onTalkClick(); }}
                        className="bg-black text-white w-full py-4 rounded-full font-bold text-lg">
                        Talk to Business
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
