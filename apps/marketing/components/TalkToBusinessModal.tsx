"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';

const TalkToBusinessModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // @ts-ignore
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await fetch('http://127.0.0.1:3002/api/email/contact-us', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3000);
        } catch (err) {
            alert("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full">
                    <X size={20} />
                </button>

                {success ? (
                    <div className="text-center py-10">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">Request Sent!</h3>
                        <p className="text-zinc-500">We'll be in touch shortly.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Talk to Business</h2>
                        <p className="text-zinc-500 mb-6">Tell us about your needs.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input name="name" required className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Work Email</label>
                                <input name="email" type="email" required className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black" placeholder="john@company.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Requirement</label>
                                <textarea name="interest" required className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black h-24 resize-none" placeholder="I need WhatsApp automation for..." />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Submit Request"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default TalkToBusinessModal;
