"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Is the WhatsApp API official?",
        answer: "Yes, ChatPilot uses the official Meta Cloud API (formerly WhatsApp Business API). This ensures high delivery rates, official green tick eligibility, and zero chance of being banned for legitimate use."
    },
    {
        question: "Can I use my existing number?",
        answer: "Yes, you can migrate your existing WhatsApp Business number to the API platform. However, once migrated, it cannot be used with the standard WhatsApp mobile app anymore—you'll manage everything through ChatPilot."
    },
    {
        question: "How does the AI Chatbot work?",
        answer: "Our AI agents are powered by advanced LLMs (like GPT-4). You simply upload your PDF documents, website links, or text instructions, and the bot learns to answer customer queries instantly based on that data."
    },
    {
        question: "Is there a free trial?",
        answer: "We offer a risk-free 14-day money-back guarantee on all our plans. You can also start with our 'Starter' plan to test the waters with essential features."
    },
    {
        question: "Do you offer enterprise custom solutions?",
        answer: "Absolutely. For large organizations, we offer custom integrations, dedicated account managers, and white-label options. Contact our sales team for a tailored quote."
    }
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-zinc-200 last:border-none">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
            >
                <span className={`text-lg font-semibold transition-colors ${isOpen ? 'text-orange-600' : 'text-zinc-800 group-hover:text-zinc-900'}`}>
                    {question}
                </span>
                <span className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-zinc-600 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-zinc-50">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-zinc-500">
                        Everything you need to know about ChatPilot.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
