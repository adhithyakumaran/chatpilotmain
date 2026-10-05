"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import BackButton from '@/components/BackButton';
import { Shield, Lock, Eye, Database, UserCheck, Bell, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 relative">
            <BackButton />
            <Navbar onTalkClick={() => setShowContact(true)} />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-sm uppercase tracking-wider mb-8 border border-blue-100">
                        Privacy Policy
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-zinc-900">
                        Your Data, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Your Privacy
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed mb-6">
                        At ChatPilot, we take your privacy seriously. This policy outlines how we collect, use, and protect your information.
                    </p>
                    <p className="text-sm text-zinc-400">
                        Last Updated: December 19, 2025
                    </p>
                </div>
            </section>

            {/* Quick Overview */}
            <section className="py-20 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Privacy at a Glance</h2>
                        <p className="text-zinc-500">Key principles that guide our data practices</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Data Protection",
                                desc: "Industry-standard encryption for all data in transit and at rest",
                                color: "text-blue-500",
                                bg: "bg-blue-50"
                            },
                            {
                                icon: Lock,
                                title: "Secure Storage",
                                desc: "Your data is stored on secure, compliant cloud infrastructure",
                                color: "text-green-500",
                                bg: "bg-green-50"
                            },
                            {
                                icon: Eye,
                                title: "Transparency",
                                desc: "Clear information about what we collect and how we use it",
                                color: "text-purple-500",
                                bg: "bg-purple-50"
                            },
                            {
                                icon: UserCheck,
                                title: "Your Control",
                                desc: "You can access, modify, or delete your data at any time",
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

            {/* Main Content */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="prose prose-lg max-w-none">
                        {/* Information We Collect */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Database size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">1. Information We Collect</h2>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 mt-8">1.1 Information You Provide</h3>
                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Account Information:</strong> Name, email address, phone number, and business details when you sign up</li>
                                <li><strong>Payment Information:</strong> Billing details and payment method (processed securely through Razorpay)</li>
                                <li><strong>Communication Data:</strong> Messages, contacts, and conversation history you create or manage through ChatPilot</li>
                                <li><strong>Customer Data:</strong> Information about your customers that you upload or manage within our platform</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-8">1.2 Information We Automatically Collect</h3>
                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Usage Data:</strong> How you interact with our platform, features used, and performance metrics</li>
                                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                                <li><strong>Cookies & Analytics:</strong> We use cookies to enhance your experience and understand platform usage</li>
                            </ul>
                        </div>

                        {/* How We Use Your Information */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">2. How We Use Your Information</h2>
                            </div>

                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Provide Services:</strong> To operate and maintain your ChatPilot account and deliver the services you've requested</li>
                                <li><strong>Improve Platform:</strong> To analyze usage patterns and enhance features, performance, and user experience</li>
                                <li><strong>Customer Support:</strong> To respond to your inquiries, troubleshoot issues, and provide technical assistance</li>
                                <li><strong>Communications:</strong> To send important updates, notifications, and marketing communications (you can opt out anytime)</li>
                                <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, or security issues</li>
                                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our terms of service</li>
                            </ul>
                        </div>

                        {/* Data Sharing */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                    <UserCheck size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">3. How We Share Your Information</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">We do not sell your personal information. We may share your data only in the following circumstances:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (e.g., cloud hosting, payment processing, analytics)</li>
                                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                                <li><strong>Legal Requirements:</strong> When required by law, legal process, or government request</li>
                                <li><strong>Protection:</strong> To protect our rights, privacy, safety, or property, and that of our users</li>
                            </ul>
                        </div>

                        {/* Data Security */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                    <Lock size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">4. Data Security</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">We implement robust security measures to protect your information:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>End-to-end encryption for sensitive communications</li>
                                <li>Secure HTTPS connections for all data transmission</li>
                                <li>Regular security audits and vulnerability assessments</li>
                                <li>Access controls and authentication mechanisms</li>
                                <li>Data backup and disaster recovery procedures</li>
                            </ul>

                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-sm text-yellow-800 m-0">
                                    <strong>Note:</strong> While we use industry-standard security practices, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                                </p>
                            </div>
                        </div>

                        {/* Your Rights */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                    <UserCheck size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">5. Your Privacy Rights</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">You have the following rights regarding your personal data:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate or incomplete information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                                <li><strong>Restriction:</strong> Request limitation on how we process your data</li>
                            </ul>

                            <p className="text-zinc-600 mt-4">To exercise these rights, contact us at <a href="mailto:support@chatpilot.co.in" className="text-blue-600 hover:underline">support@chatpilot.co.in</a></p>
                        </div>

                        {/* Data Retention */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Database size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">6. Data Retention</h2>
                            </div>

                            <p className="text-zinc-600">
                                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your data within 30 days, unless we are required to retain it for legal, regulatory, or security purposes.
                            </p>
                        </div>

                        {/* Third-Party Services */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">7. Third-Party Services</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">ChatPilot integrates with third-party services to enhance functionality:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>WhatsApp Business API:</strong> For messaging services (subject to Meta's privacy policy)</li>
                                <li><strong>Payment Processors:</strong> Razorpay for secure payment handling</li>
                                <li><strong>Analytics Tools:</strong> To understand platform usage and improve services</li>
                                <li><strong>Cloud Providers:</strong> For hosting and data storage</li>
                            </ul>

                            <p className="text-zinc-600 mt-4">
                                These third parties have their own privacy policies. We encourage you to review them.
                            </p>
                        </div>

                        {/* Cookies */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                                    <Eye size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">8. Cookies and Tracking</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">We use cookies and similar technologies to:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>Remember your preferences and settings</li>
                                <li>Analyze platform performance and usage</li>
                                <li>Provide personalized experiences</li>
                                <li>Deliver targeted marketing (with your consent)</li>
                            </ul>

                            <p className="text-zinc-600 mt-4">
                                You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
                            </p>
                        </div>

                        {/* Children's Privacy */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">9. Children's Privacy</h2>
                            </div>

                            <p className="text-zinc-600">
                                ChatPilot is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected data from a child, we will delete it immediately. If you believe we have collected information from a child, please contact us.
                            </p>
                        </div>

                        {/* International Transfers */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                                    <Database size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">10. International Data Transfers</h2>
                            </div>

                            <p className="text-zinc-600">
                                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that your data receives adequate protection wherever it is processed.
                            </p>
                        </div>

                        {/* Changes to Policy */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">11. Changes to This Policy</h2>
                            </div>

                            <p className="text-zinc-600">
                                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically. Continued use of ChatPilot after changes constitutes acceptance of the updated policy.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Mail size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">12. Contact Us</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">
                                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                            </p>

                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                                <p className="text-zinc-700 mb-2"><strong>Email:</strong> <a href="mailto:support@chatpilot.co.in" className="text-blue-600 hover:underline">support@chatpilot.co.in</a></p>
                                <p className="text-zinc-700 m-0"><strong>ChatPilot</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-zinc-900 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions About Privacy?</h2>
                    <p className="text-zinc-400 text-lg mb-8">
                        We're here to help. Reach out to our team with any concerns.
                    </p>
                    <button
                        onClick={() => setShowContact(true)}
                        className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200"
                    >
                        Contact Support
                    </button>
                </div>
            </section>

            <Footer />
            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </div>
    );
}
