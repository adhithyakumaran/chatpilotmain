"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TalkToBusinessModal from '@/components/TalkToBusinessModal';
import BackButton from '@/components/BackButton';
import { FileText, AlertCircle, CreditCard, Ban, UserX, RefreshCw, Shield, Scale } from 'lucide-react';

export default function TermsAndConditionsPage() {
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
                        Terms & Conditions
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-zinc-900">
                        Terms of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                            Service
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed mb-6">
                        Welcome to ChatPilot. By using our services, you agree to these terms. Please read them carefully.
                    </p>
                    <p className="text-sm text-zinc-400">
                        Last Updated: December 19, 2025
                    </p>
                </div>
            </section>

            {/* Quick Summary */}
            <section className="py-20 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Key Terms Summary</h2>
                        <p className="text-zinc-500">Important points you should know</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: FileText,
                                title: "Service Agreement",
                                desc: "By using ChatPilot, you agree to follow our terms and use the platform responsibly",
                                color: "text-blue-500",
                                bg: "bg-blue-50"
                            },
                            {
                                icon: CreditCard,
                                title: "Payment Terms",
                                desc: "Subscription fees are billed in advance and are non-refundable unless stated",
                                color: "text-green-500",
                                bg: "bg-green-50"
                            },
                            {
                                icon: Shield,
                                title: "Your Responsibilities",
                                desc: "You're responsible for maintaining account security and content you create",
                                color: "text-purple-500",
                                bg: "bg-purple-50"
                            },
                            {
                                icon: AlertCircle,
                                title: "Acceptable Use",
                                desc: "Don't use ChatPilot for spam, illegal activities, or anything that violates policies",
                                color: "text-red-500",
                                bg: "bg-red-50"
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
                        {/* Acceptance of Terms */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">1. Acceptance of Terms</h2>
                            </div>

                            <p className="text-zinc-600">
                                By accessing or using ChatPilot's services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not use our services. These Terms apply to all users, including visitors, registered users, and subscribers.
                            </p>

                            <p className="text-zinc-600">
                                We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the modified Terms.
                            </p>
                        </div>

                        {/* Eligibility */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <UserX size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">2. Eligibility</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">To use ChatPilot, you must:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>Be at least 18 years old or have parental/guardian consent</li>
                                <li>Have the legal capacity to enter into a binding agreement</li>
                                <li>Provide accurate and complete registration information</li>
                                <li>Not be prohibited from using our services under applicable laws</li>
                            </ul>
                        </div>

                        {/* Account Registration */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">3. Account Registration and Security</h2>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 mt-8">3.1 Account Creation</h3>
                            <p className="text-zinc-600">
                                You must create an account to access certain features of ChatPilot. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate and current.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">3.2 Account Security</h3>
                            <ul className="space-y-2 text-zinc-600">
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You must notify us immediately of any unauthorized access or security breach</li>
                                <li>You are liable for all activities that occur under your account</li>
                                <li>We are not liable for any loss or damage from your failure to protect your account</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-8">3.3 Account Termination</h3>
                            <p className="text-zinc-600">
                                We reserve the right to suspend or terminate your account if you violate these Terms or engage in activities that harm ChatPilot or other users.
                            </p>
                        </div>

                        {/* Services */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                    <RefreshCw size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">4. ChatPilot Services</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">ChatPilot provides various automation and communication services including:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>WhatsApp Business API integration and broadcasting</li>
                                <li>AI-powered chatbots and automation</li>
                                <li>Customer Relationship Management (CRM) tools</li>
                                <li>Email automation and campaigns</li>
                                <li>Analytics and reporting</li>
                                <li>Integration with third-party services</li>
                            </ul>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800 m-0">
                                    <strong>Service Availability:</strong> We strive to provide 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience unforeseen downtime.
                                </p>
                            </div>
                        </div>

                        {/* Acceptable Use */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                    <Ban size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">5. Acceptable Use Policy</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">You agree NOT to use ChatPilot for any of the following:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li><strong>Spam or Unsolicited Messages:</strong> Sending bulk messages to recipients who have not opted in</li>
                                <li><strong>Illegal Activities:</strong> Any activity that violates local, national, or international laws</li>
                                <li><strong>Harassment or Abuse:</strong> Threatening, harassing, or abusing others</li>
                                <li><strong>Fraud or Deception:</strong> Misleading or deceiving users or third parties</li>
                                <li><strong>Malware Distribution:</strong> Distributing viruses, malware, or harmful code</li>
                                <li><strong>Infringement:</strong> Violating intellectual property rights or privacy rights of others</li>
                                <li><strong>System Abuse:</strong> Attempting to hack, disrupt, or compromise our infrastructure</li>
                                <li><strong>Impersonation:</strong> Pretending to be someone else or misrepresenting your affiliation</li>
                            </ul>

                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-800 m-0">
                                    <strong>Violation Consequences:</strong> Violations may result in immediate account suspension or termination without refund, and we may report illegal activities to law enforcement.
                                </p>
                            </div>
                        </div>

                        {/* Subscription and Payment */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">6. Subscription and Payment Terms</h2>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 mt-8">6.1 Pricing and Plans</h3>
                            <p className="text-zinc-600">
                                ChatPilot offers various subscription plans with different features and pricing. Prices are displayed on our website and may be changed with 30 days' notice.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">6.2 Billing</h3>
                            <ul className="space-y-2 text-zinc-600">
                                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                                <li>Payment is due immediately upon subscription renewal</li>
                                <li>All payments are processed securely through Razorpay</li>
                                <li>Taxes (if applicable) will be added to your invoice</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-8">6.3 Refund Policy</h3>
                            <p className="text-zinc-600">
                                All subscription fees are non-refundable except as required by law or as explicitly stated in our refund policy. If you cancel your subscription, you will retain access until the end of your current billing period.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">6.4 Free Trials</h3>
                            <p className="text-zinc-600">
                                We may offer free trials for certain plans. If you do not cancel before the trial period ends, you will be automatically charged for the subscription. Trial eligibility is limited to one per user or organization.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">6.5 Failed Payments</h3>
                            <p className="text-zinc-600">
                                If a payment fails, we may suspend your account until payment is received. Continued failure to pay may result in account termination.
                            </p>
                        </div>

                        {/* Intellectual Property */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <Scale size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">7. Intellectual Property Rights</h2>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 mt-8">7.1 ChatPilot's Rights</h3>
                            <p className="text-zinc-600">
                                All content, features, and functionality of ChatPilot (including but not limited to design, text, graphics, logos, software, and code) are owned by ChatPilot or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">7.2 Your Content</h3>
                            <p className="text-zinc-600 mb-4">
                                You retain ownership of content you upload or create using ChatPilot ("Your Content"). By using our services, you grant us a limited, worldwide, non-exclusive license to:
                            </p>
                            <ul className="space-y-2 text-zinc-600">
                                <li>Host, store, and process Your Content to provide our services</li>
                                <li>Use Your Content to improve our AI and platform features (anonymized and aggregated)</li>
                                <li>Display Your Content as part of the services you've configured</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-8">7.3 Restrictions</h3>
                            <p className="text-zinc-600">
                                You may not copy, modify, distribute, sell, or lease any part of ChatPilot without our express written permission.
                            </p>
                        </div>

                        {/* User Content */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">8. User Content and Conduct</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">You are solely responsible for:</p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>The accuracy, legality, and appropriateness of Your Content</li>
                                <li>Obtaining necessary consents and permissions for data you collect or process</li>
                                <li>Complying with all applicable laws (including data protection, anti-spam, and consumer protection laws)</li>
                                <li>Maintaining opt-in consent records for your marketing communications</li>
                            </ul>

                            <p className="text-zinc-600 mt-4">
                                ChatPilot does not monitor or control Your Content but reserves the right to review and remove content that violates these Terms.
                            </p>
                        </div>

                        {/* Third-Party Services */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                    <RefreshCw size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">9. Third-Party Services and Links</h2>
                            </div>

                            <p className="text-zinc-600">
                                ChatPilot integrates with third-party services (e.g., WhatsApp, payment processors, analytics providers). Your use of these services is subject to their respective terms and policies. We are not responsible for the actions, content, or policies of third-party services.
                            </p>

                            <p className="text-zinc-600 mt-4">
                                Our platform may contain links to external websites. We do not endorse or control these sites and are not responsible for their content.
                            </p>
                        </div>

                        {/* Disclaimers */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                                    <AlertCircle size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">10. Disclaimers</h2>
                            </div>

                            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                                <p className="text-zinc-700 font-semibold mb-2">SERVICE PROVIDED "AS IS"</p>
                                <p className="text-zinc-600 text-sm m-0">
                                    ChatPilot is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, error-free, or completely secure.
                                </p>
                            </div>

                            <p className="text-zinc-600">
                                We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. Your use of ChatPilot is at your own risk.
                            </p>
                        </div>

                        {/* Limitation of Liability */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">11. Limitation of Liability</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">
                                To the fullest extent permitted by law, ChatPilot and its affiliates, officers, employees, and partners shall not be liable for:
                            </p>

                            <ul className="space-y-2 text-zinc-600">
                                <li>Indirect, incidental, consequential, or punitive damages</li>
                                <li>Loss of profits, revenue, data, or business opportunities</li>
                                <li>Service interruptions, errors, or data loss</li>
                                <li>Actions or content of third-party services or users</li>
                            </ul>

                            <p className="text-zinc-600 mt-4">
                                Our total liability for any claim related to ChatPilot shall not exceed the amount you paid us in the 12 months preceding the claim.
                            </p>
                        </div>

                        {/* Indemnification */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Scale size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">12. Indemnification</h2>
                            </div>

                            <p className="text-zinc-600">
                                You agree to indemnify, defend, and hold harmless ChatPilot and its affiliates from any claims, liabilities, damages, losses, or expenses (including legal fees) arising from:
                            </p>

                            <ul className="space-y-2 text-zinc-600 mt-4">
                                <li>Your use or misuse of ChatPilot services</li>
                                <li>Your violation of these Terms or applicable laws</li>
                                <li>Your Content or activities on the platform</li>
                                <li>Infringement of third-party rights</li>
                            </ul>
                        </div>

                        {/* Termination */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                    <UserX size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">13. Termination</h2>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 mt-8">13.1 By You</h3>
                            <p className="text-zinc-600">
                                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-8">13.2 By ChatPilot</h3>
                            <p className="text-zinc-600 mb-4">
                                We may suspend or terminate your account immediately if:
                            </p>
                            <ul className="space-y-2 text-zinc-600">
                                <li>You violate these Terms or our policies</li>
                                <li>Your account is involved in fraudulent or illegal activities</li>
                                <li>You fail to pay subscription fees</li>
                                <li>We are required to do so by law</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-8">13.3 Effect of Termination</h3>
                            <p className="text-zinc-600">
                                Upon termination, your access to ChatPilot will cease, and we may delete Your Content after 30 days. Provisions that should survive termination (including payment obligations, disclaimers, and limitations of liability) will remain in effect.
                            </p>
                        </div>

                        {/* Governing Law */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <Scale size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">14. Governing Law and Dispute Resolution</h2>
                            </div>

                            <p className="text-zinc-600">
                                These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of ChatPilot shall be subject to the exclusive jurisdiction of the courts in [Your City/State, India].
                            </p>

                            <p className="text-zinc-600 mt-4">
                                We encourage you to contact us first to resolve any disputes informally. If informal resolution fails, both parties agree to seek resolution through binding arbitration.
                            </p>
                        </div>

                        {/* Modifications */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                    <RefreshCw size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">15. Modifications to Terms</h2>
                            </div>

                            <p className="text-zinc-600">
                                We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or through the platform. Continued use after changes constitutes acceptance of the modified Terms.
                            </p>
                        </div>

                        {/* Severability */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">16. Severability</h2>
                            </div>

                            <p className="text-zinc-600">
                                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
                            </p>
                        </div>

                        {/* Entire Agreement */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">17. Entire Agreement</h2>
                            </div>

                            <p className="text-zinc-600">
                                These Terms, along with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and ChatPilot regarding the use of our services.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <AlertCircle size={20} />
                                </div>
                                <h2 className="text-3xl font-bold m-0">18. Contact Information</h2>
                            </div>

                            <p className="text-zinc-600 mb-4">
                                If you have questions about these Terms or need support, please contact us:
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-zinc-400 text-lg mb-8">
                        Join thousands of businesses automating their growth with ChatPilot.
                    </p>
                    <button
                        onClick={() => setShowContact(true)}
                        className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200"
                    >
                        Get In Touch
                    </button>
                </div>
            </section>

            <Footer />
            <TalkToBusinessModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </div>
    );
}
