"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Download, ExternalLink, Loader2, Lock, Unlock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- TYPES ---
type Plan = {
    id: string;
    name: string;
    price: number; // 0 if custom
    features: string[];
    isCustom?: boolean;
};

const PLANS: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 499,
        features: ['100 Broadcasts', 'Basic Chatbot', '2 Agents']
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1299,
        features: ['Unlimited Broadcasts', 'AI Agent', 'Unlimited Agents', 'CRM Sync']
    },
    {
        id: 'lifetime',
        name: 'Custom / Lifetime',
        price: 0,
        features: ['Lifetime Access', 'One-time Payment', 'Unlimited Everything', 'No Renewal Needed'],
        isCustom: true
    }
];

const PaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    // --- STATE ---
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Plan, 2: Billing, 3: Setup, 4: Success
    const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // Default to Pro
    const [customAmount, setCustomAmount] = useState<string>("");

    // Access Code State
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [accessCode, setAccessCode] = useState("");
    const [isLifetimeUnlocked, setIsLifetimeUnlocked] = useState(false);
    const [accessError, setAccessError] = useState("");

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [paymentId, setPaymentId] = useState("");

    // Billing State
    const [couponCode, setCouponCode] = useState("");
    const [discountFreq, setDiscountFreq] = useState(0); // 0 to 1
    const [couponError, setCouponError] = useState("");

    // Calculations
    const basePrice = selectedPlan.id === 'lifetime' ? parseInt(customAmount) || 0 : selectedPlan.price;
    const discountAmount = Math.round(basePrice * discountFreq);
    const taxableAmount = basePrice - discountAmount;
    const gstAmount = Math.round(taxableAmount * 0.18);
    const totalAmount = taxableAmount + gstAmount;

    if (!isOpen) return null;

    // --- HANDLERS ---

    const handlePlanSelect = (plan: Plan) => {
        if (plan.isCustom && !isLifetimeUnlocked) {
            setShowAccessCode(true);
            setSelectedPlan(plan); // Temporarily select to show dialog context
        } else {
            setSelectedPlan(plan);
            setShowAccessCode(false);
        }
    };

    const verifyAccessCode = () => {
        if (accessCode.trim() === "PRDT20012005") {
            setIsLifetimeUnlocked(true);
            setShowAccessCode(false);
            setAccessError("");
        } else {
            setAccessError("Invalid Access Code");
        }
    };

    const applyCoupon = async () => {
        // ... (Existing coupon logic could be here, but disabled for custom plans usually? keeping it for now)
        const code = couponCode.toUpperCase().trim();
        if (!code) return;

        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:3002/api/payment/validate-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (data.success) {
                setDiscountFreq(data.discount);
                setCouponError("");
            } else {
                setDiscountFreq(0);
                setCouponError("Invalid or expired coupon");
            }
        } catch (e) {
            setCouponError("Could not verify coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = () => {
        if (!email) return alert("Please enter your email.");
        if (basePrice <= 0) return alert("Invalid amount.");

        setIsLoading(true);

        const options = {
            "key": "rzp_live_RopYFLWwX6Jd2p", // LIVE KEY
            "amount": totalAmount * 100, // Total in paisa
            "currency": "INR",
            "name": "ChatPilot Technologies",
            "description": `Payment for ${selectedPlan.name} Plan`,
            "image": "https://chatpilot.co.in/logo.png",
            "handler": function (response: any) {
                setPaymentId(response.razorpay_payment_id);
                setIsLoading(false);
                setStep(3); // Move to Account Setup
                setUsername(email.split('@')[0]); // Default username
            },
            "prefill": { "email": email },
            "theme": { "color": "#FF5500" },
            "modal": {
                "ondismiss": function () {
                    setIsLoading(false);
                }
            }
        };

        // @ts-ignore
        if (window.Razorpay) {
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        } else {
            alert("Razorpay SDK failed to load. Please refresh.");
            setIsLoading(false);
        }
    };

    const handleAccountSetup = async () => {
        if (!username || !password) return alert("Please fill in all fields.");
        setIsLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:3002/api/auth/create-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    plan: selectedPlan.id, // 'lifetime' will be sent here
                    subscriptionId: paymentId
                })
            });

            const data = await response.json();

            if (data.success) {
                setStep(4);
            } else {
                alert("Account Creation Failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Network Error: Could not connect to server.");
        } finally {
            setIsLoading(false);
        }
    };

    // ... (Invoice functions identical to previous, just ensure they use updated variables)
    const downloadInvoice = async () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text("INVOICE", 150, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("ChatPilot Technologies", 20, 20);
            doc.text("123, Tech Park, Bangalore", 20, 25);
            doc.text("Karnataka, India - 560100", 20, 30);
            doc.text("GSTIN: 29AAAAA0000A1Z5", 20, 35);
            doc.text("support@chatpilot.co.in", 20, 40);

            // Invoice Details
            doc.line(20, 45, 190, 45);

            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(`Invoice #: INV-${Math.floor(Math.random() * 100000)}`, 140, 55);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 62);
            doc.text(`Status: Paid`, 140, 69);

            doc.text(`Billed To:`, 20, 55);
            doc.setFontSize(12);
            doc.text(email, 20, 62);

            // Table
            // @ts-ignore
            const autoTable = (await import('jspdf-autotable')).default;
            // @ts-ignore
            autoTable(doc, {
                startY: 80,
                head: [['Description', 'SAC Code', 'Qty', 'Amount']],
                body: [
                    [`ChatPilot Subscription - ${selectedPlan.name}`, '9983', '1', `Rs. ${basePrice.toFixed(2)}`],
                    discountFreq > 0 ? ['Discount', '', '', `- Rs. ${discountAmount.toFixed(2)}`] : [],
                    ['', '', 'Subtotal', `Rs. ${taxableAmount.toFixed(2)}`],
                    ['', '', 'GST (18%)', `Rs. ${gstAmount.toFixed(2)}`],
                ].filter(row => row.length > 0), // Remove empty discount rows
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0] },
                columnStyles: {
                    3: { halign: 'right' }
                }
            });

            // @ts-ignore
            const finalY = (doc as any).lastAutoTable?.finalY || 100;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`Total Paid: Rs. ${totalAmount.toFixed(2)}`, 130, finalY + 15);

            // Footer
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(120);
            doc.text("This is a computer generated invoice.", 20, 280);
            doc.text("ChatPilot • secure. automated. scaler.", 20, 285);

            doc.save("ChatPilot_Invoice.pdf");
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Could not generate PDF. Please try again.");
        }
    };

    const downloadCredentials = () => {
        const content = `
ChatPilot Credentials
---------------------
Plan: ${selectedPlan.name}
Total Paid: Rs. ${totalAmount} (incl. GST)
Email: ${email}
Username: ${username}
Password: ${password}
---------------------
Login at: https://app.chatpilot.co.in
        `;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ChatPilot_Credentials.txt";
        a.click();
    };

    // --- RENDER ---
    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[90vh] h-full md:h-auto">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-bold">
                            {step === 1 && "Choose Your Plan"}
                            {step === 2 && "Billing & Payment"}
                            {step === 3 && "Setup Account"}
                            {step === 4 && "Welcome Aboard! 🚀"}
                        </h2>
                        <p className="text-sm text-zinc-500">Step {step} of 4</p>
                    </div>
                    {step < 3 && (
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-black transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 overflow-y-auto flex-1 md:flex-none">
                    {/* STEP 1: PLAN SELECTION */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => handlePlanSelect(plan)}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan.id === plan.id
                                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200'
                                        : 'border-zinc-100 hover:border-zinc-300'
                                        }`}
                                >
                                    {plan.isCustom && !isLifetimeUnlocked && (
                                        <div className="absolute top-4 right-4 text-zinc-400">
                                            <Lock size={16} />
                                        </div>
                                    )}
                                    {plan.isCustom && isLifetimeUnlocked && (
                                        <div className="absolute top-4 right-4 text-green-500">
                                            <Unlock size={16} />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg">{plan.name}</h3>
                                        {selectedPlan.id === plan.id && <CheckCircle2 className="text-orange-500" size={20} />}
                                    </div>
                                    <div className="text-3xl font-bold mb-4">
                                        {plan.isCustom && isLifetimeUnlocked ? 'Custom' : plan.price === 0 ? 'Locked' : `₹${plan.price}`}
                                        {!plan.isCustom && <span className="text-sm text-zinc-400 font-normal"> + GST</span>}
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map(f => (
                                            <li key={f} className="text-sm text-zinc-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {showAccessCode && (
                                <div className="md:col-span-3 mt-4 bg-zinc-50 p-6 rounded-xl border border-dashed border-zinc-300 animate-in slide-in-from-top-2">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <Lock size={16} /> Enter Access Code to Unlock
                                    </h4>
                                    <div className="flex gap-2 max-w-md">
                                        <input
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value)}
                                            type="text"
                                            placeholder="Enter Code (e.g. PRDT...)"
                                            className="flex-1 p-3 rounded-xl border border-zinc-200"
                                        />
                                        <button
                                            onClick={verifyAccessCode}
                                            className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800"
                                        >
                                            Unlock
                                        </button>
                                    </div>
                                    {accessError && <p className="text-red-500 text-sm mt-2">{accessError}</p>}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (selectedPlan.isCustom && !isLifetimeUnlocked) return alert("Please unlock the custom plan first.");
                                    setStep(2);
                                }}
                                className="md:col-span-3 mt-4 bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedPlan.isCustom && !isLifetimeUnlocked}
                            >
                                Continue with {selectedPlan.name}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: PAYMENT & BILLING */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                            {/* Left Col: Inputs */}
                            <div className="md:col-span-3 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        required
                                        className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="you@company.com"
                                    />
                                </div>

                                {selectedPlan.id === 'lifetime' && (
                                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                                        <label className="block text-sm font-bold text-orange-800 mb-1.5">Custom Payment Amount (₹)</label>
                                        <input
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))} // Numeric only
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xl"
                                            placeholder="Enter agreed amount..."
                                        />
                                        <p className="text-xs text-orange-600 mt-2">
                                            Please enter the exact amount agreed upon. GST will be added automatically.
                                        </p>
                                    </div>
                                )}

                                {selectedPlan.id !== 'lifetime' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Have a Coupon?</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                type="text"
                                                className="flex-1 p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black uppercase placeholder:normal-case"
                                                placeholder="Enter code"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                className="px-4 py-3 bg-zinc-100 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                                        {discountFreq > 0 && <p className="text-green-600 text-xs mt-1">Coupon applied! {discountFreq * 100}% off</p>}
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Summary */}
                            <div className="md:col-span-2 bg-zinc-50 rounded-2xl p-6 h-fit border border-zinc-100">
                                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-zinc-600">
                                        <span>{selectedPlan.name} Plan</span>
                                        <span>₹{basePrice}</span>
                                    </div>
                                    {discountFreq > 0 && selectedPlan.id !== 'lifetime' && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>- ₹{discountAmount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-zinc-600">
                                        <span>Subtotal</span>
                                        <span>₹{taxableAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-600">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount}</span>
                                    </div>
                                    <div className="pt-3 border-t border-zinc-200 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isLoading || totalAmount <= 0}
                                    className="w-full mt-6 bg-[#FF5500] text-white py-3 rounded-xl font-bold hover:bg-[#E64D00] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Pay Now"}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full mt-2 text-sm text-zinc-400 hover:text-black">
                                    Change Plan
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ACCOUNT SETUP */}
                    {step === 3 && (
                        <div className="space-y-6 max-w-sm mx-auto animate-in slide-in-from-right duration-300">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="font-bold text-lg">Payment Successful!</h3>
                                <p className="text-sm text-zinc-500">Ref: {paymentId}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Create Username</label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Create Password</label>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                onClick={handleAccountSetup}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                            >
                                Create Account
                            </button>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS & DOWNLOAD */}
                    {step === 4 && (
                        <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6">
                                <h3 className="font-bold text-xl text-green-800 mb-2">You're all set! 🎉</h3>
                                <p className="text-green-700 text-sm">Your account has been created. Save your credentials below.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={downloadInvoice}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
                                >
                                    <Download size={18} /> Download Invoice
                                </button>
                                <button
                                    onClick={downloadCredentials}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
                                >
                                    <Download size={18} /> Save Credentials
                                </button>
                            </div>

                            <div className="pt-4 border-t border-zinc-100">
                                <button
                                    onClick={() => window.location.href = "https://app.chatpilot.co.in"}
                                    className="w-full bg-[#FF5500] text-white py-4 rounded-xl font-bold hover:bg-[#E64D00] transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
