"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Building2, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';

const ContactForm = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formPayload = {
                name: formData.name,
                email: formData.email,
                company: formData.company,
                message: formData.message,
                _subject: `New Contact from ${formData.name} - ChatPilot`,
            };

            // Submit to both Formspree forms in parallel
            const responses = await Promise.all([
                fetch('https://formspree.io/f/xdanokrz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formPayload)
                }),
                fetch('https://formspree.io/f/mqezkavd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formPayload)
                })
            ]);

            // Check if both succeeded
            if (responses.every(r => r.ok)) {
                setSuccess(true);
                setFormData({ name: '', email: '', company: '', message: '' });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (err) {
            console.error('Form error:', err);
            alert("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 px-6 bg-gradient-to-b from-white to-zinc-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                    {/* Left Side - Text Content */}
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                            Get In Touch
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-tight">
                            Let's Build Something <span className="text-orange-500">Amazing</span> Together
                        </h2>
                        <p className="text-xl text-zinc-600 leading-relaxed">
                            Whether you're looking to automate your WhatsApp marketing, integrate AI chatbots, or scale your customer engagement — we're here to help you succeed.
                        </p>
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900">Quick Response</h4>
                                    <p className="text-zinc-600 text-sm">We'll get back to you within 24 hours</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900">Free Consultation</h4>
                                    <p className="text-zinc-600 text-sm">Schedule a demo at your convenience</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-2xl shadow-zinc-200/50 p-8 md:p-10 border border-zinc-100 relative overflow-hidden"
                    >
                        {/* Gradient overlay on success */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center z-20 rounded-3xl"
                            >
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                    >
                                        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-zinc-900 mb-2">Message Sent! 🎉</h3>
                                    <p className="text-zinc-600 text-lg">We'll be in touch very soon.</p>
                                </div>
                            </motion.div>
                        )}

                        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Send us a message</h3>
                        <p className="text-zinc-500 mb-8">Fill out the form below and we'll get back to you shortly.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Your Name *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none transition-colors text-zinc-900 placeholder:text-zinc-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none transition-colors text-zinc-900 placeholder:text-zinc-400"
                                        placeholder="john@company.com"
                                    />
                                </div>
                            </div>

                            {/* Company Field */}
                            <div>
                                <label htmlFor="company" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Building2 size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none transition-colors text-zinc-900 placeholder:text-zinc-400"
                                        placeholder="Your Company"
                                    />
                                </div>
                            </div>

                            {/* Message Field */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-zinc-700 mb-2">
                                    Your Message *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-4 text-zinc-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none transition-colors resize-none text-zinc-900 placeholder:text-zinc-400"
                                        placeholder="Tell us about your project or requirements..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <Send size={20} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactForm;
