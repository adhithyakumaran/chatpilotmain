"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import BackButton from '@/components/BackButton';
import { Trash2, Shield, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function DataDeletionPage() {
    const [showContact, setShowContact] = useState(false);
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Here you would typically send this to your backend API
        // For now, we'll just show a success message
        console.log('Data deletion request:', { email, reason });

        // You can integrate with your contact form or create a separate endpoint
        setSubmitted(true);
        setEmail('');
        setReason('');
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 relative">
            <BackButton />
            <Navbar onTalkClick={() => setShowContact(true)} />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-bold text-sm uppercase tracking-wider mb-8 border border-red-100">
                        Data Deletion
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-zinc-900">
                        Request Data <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                            Deletion
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                        You have the right to request deletion of your personal data. We'll process your request within 30 days.
                    </p>
                </div>
            </section>

            {/* Information Section */}
            <section className="py-20 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">What Gets Deleted?</h2>
                        <p className="text-zinc-500">Here's what happens when you request data deletion</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Account Data",
                                desc: "Your profile information, email, and account settings",
                                color: "text-blue-500",
                                bg: "bg-blue-50"
                            },
                            {
                                icon: Trash2,
                                title: "User Content",
                                desc: "Messages, contacts, campaigns, and all data you created",
                                color: "text-red-500",
                                bg: "bg-red-50"
                            },
                            {
                                icon: CheckCircle,
                                title: "Usage Data",
                                desc: "Analytics, logs, and activity history associated with your account",
                                color: "text-green-500",
                                bg: "bg-green-50"
                            },
                            {
                                icon: AlertCircle,
                                title: "Backup Data",
                                desc: "All backup copies will be deleted from our systems",
                                color: "text-orange-500",
                                bg: "bg-orange-50"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 group">
                                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Request Form Section */}
            <section className="py-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Submit Deletion Request</h2>
                        <p className="text-zinc-500">Fill out the form below to request deletion of your data</p>
                    </div>

                    {submitted && (
                        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-900 mb-2">Request Submitted Successfully</h3>
                                <p className="text-green-700 text-sm">
                                    We've received your data deletion request. You'll receive a confirmation email shortly.
                                    We'll process your request within 30 days as required by privacy regulations.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                                <p className="text-sm text-zinc-500 mt-2">
                                    Enter the email address associated with your ChatPilot account
                                </p>
                            </div>

                            <div>
                                <label htmlFor="reason" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Reason for Deletion (Optional)
                                </label>
                                <textarea
                                    id="reason"
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please let us know why you're requesting data deletion..."
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-semibold mb-1">Important Notice</p>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>• Data deletion is permanent and cannot be undone</li>
                                            <li>• Your account will be deactivated immediately</li>
                                            <li>• Complete deletion occurs within 30 days</li>
                                            <li>• Some data may be retained for legal compliance</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] duration-200"
                            >
                                Submit Deletion Request
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Process Timeline */}
            <section className="py-20 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Deletion Process</h2>
                        <p className="text-zinc-500">What happens after you submit your request</p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-200 hidden md:block"></div>

                            {/* Timeline items */}
                            <div className="space-y-8">
                                {[
                                    {
                                        step: "1",
                                        title: "Request Received",
                                        desc: "We receive your deletion request and send a confirmation email",
                                        time: "Immediate",
                                        color: "bg-blue-500"
                                    },
                                    {
                                        step: "2",
                                        title: "Identity Verification",
                                        desc: "We verify your identity to ensure account security",
                                        time: "1-2 days",
                                        color: "bg-purple-500"
                                    },
                                    {
                                        step: "3",
                                        title: "Account Deactivation",
                                        desc: "Your account is immediately deactivated and inaccessible",
                                        time: "2-3 days",
                                        color: "bg-orange-500"
                                    },
                                    {
                                        step: "4",
                                        title: "Data Deletion",
                                        desc: "All your data is permanently deleted from our systems",
                                        time: "Within 30 days",
                                        color: "bg-red-500"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg z-10`}>
                                            {item.step}
                                        </div>
                                        <div className="flex-1 bg-white p-6 rounded-2xl border border-zinc-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold">{item.title}</h3>
                                                <span className="text-sm font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                                                    {item.time}
                                                </span>
                                            </div>
                                            <p className="text-zinc-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-zinc-500">Common questions about data deletion</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Can I recover my data after deletion?",
                                a: "No, data deletion is permanent. Once completed, your data cannot be recovered. We recommend downloading any important data before submitting a deletion request."
                            },
                            {
                                q: "What data is retained for legal purposes?",
                                a: "We may retain minimal transaction records and billing information for tax and legal compliance purposes as required by law. This data is kept secure and is not used for any other purposes."
                            },
                            {
                                q: "How long does the deletion process take?",
                                a: "Your account is deactivated within 2-3 days. Complete deletion of all data from our systems occurs within 30 days of your request."
                            },
                            {
                                q: "Can I cancel my deletion request?",
                                a: "Yes, you can cancel your request before your account is deactivated by contacting our support team. After deactivation, the process cannot be reversed."
                            },
                            {
                                q: "Will my subscription be refunded?",
                                a: "Data deletion requests do not automatically trigger refunds. Please refer to our refund policy or contact support for subscription-related questions."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
                                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                                    <span className="text-red-600">Q:</span>
                                    <span>{faq.q}</span>
                                </h3>
                                <p className="text-zinc-600 ml-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-zinc-900 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Help?</h2>
                    <p className="text-zinc-400 text-lg mb-8">
                        If you have questions about data deletion or our privacy practices, contact our support team.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setShowContact(true)}
                            className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200"
                        >
                            Contact Support
                        </button>
                        <a
                            href="/privacy"
                            className="px-8 py-4 bg-transparent border border-zinc-700 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                        >
                            View Privacy Policy
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </div>
    );
}
