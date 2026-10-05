"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Trash } from "lucide-react";

// Steps configuration
const STEPS = [
    { id: 'goal', title: 'Goal', description: 'What do you want to achieve?' },
    { id: 'trigger', title: 'Trigger', description: 'What should start this flow?' },
    { id: 'config', title: 'Configure', description: 'Customize your flow' },
    { id: 'actions', title: 'Action', description: 'Final check & actions' },
    { id: 'publish', title: 'Publish', description: 'Name your automation' },
];

export default function GuidedBuilderPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Blueprint State
    const [blueprint, setBlueprint] = useState({
        name: "",
        goal: "SALES", // "SALES" | "APPOINTMENT" | "SUPPORT" | "WELCOME" | "RESTAURANT" | "BUTTONS_MENU" | "AGENT_HANDOFF"
        trigger: { values: ["order", "chicken", "menu"] },
        // Sales / Restaurant
        menu: { enabled: true, source: "PRODUCTS", sendImages: true, limit: 5 },
        cart: { askQuantity: true },
        // Welcome
        businessName: "My Business",
        openingHours: "9am - 9pm",
        welcomeMessage: "👋 Hi there! Welcome to {{businessName}}.",
        // Buttons Menu
        buttons: ["Sales", "Support", "Talk to Agent"],
        message: "How can we help you today?",
        // Handoff
        handoffMessage: "A human agent will be with you shortly.",
        // Shared
        confirmation: { enabled: true, message: "Do you want to confirm?" },
        onConfirm: [{ action: "NOTIFY_ADMIN" }],
        // Custom Form
        formSteps: [] as any[]
    });

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handlePublish = async () => {
        if (!blueprint.name) {
            alert("Please provide a name for your flow");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/flows/compile", { blueprint });
            router.push("/flows");
        } catch (e) {
            console.error(e);
            alert("Failed to compile flow");
            setLoading(false);
        }
    };

    const updateBlueprint = (section: string, key: string, value: any) => {
        setBlueprint(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [key]: value
            }
        }));
    };

    const setGoal = (goal: string, triggers: string[]) => {
        setBlueprint({ ...blueprint, goal, trigger: { values: triggers } });
    }

    // GOAL BASED STEPS
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Goal Selection
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'SALES' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("SALES", ["order", "buy"])}
                        >
                            <h4 className="font-semibold text-slate-900">🛍 Sales / Cart</h4>
                            <p className="text-xs text-slate-500 mt-1">Sell products, take orders, and collect payments.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'RESTAURANT' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("RESTAURANT", ["menu", "eat"])}
                        >
                            <h4 className="font-semibold text-slate-900">🍔 Restaurant Menu</h4>
                            <p className="text-xs text-slate-500 mt-1">Digital menu order taking for food & beverages.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'APPOINTMENT' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("APPOINTMENT", ["book", "appointment"])}
                        >
                            <h4 className="font-semibold text-slate-900">📅 Appointments</h4>
                            <p className="text-xs text-slate-500 mt-1">Book slots, capture dates, and schedule visits.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'SUPPORT' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("SUPPORT", ["help", "support"])}
                        >
                            <h4 className="font-semibold text-slate-900">🎧 Customer Support</h4>
                            <p className="text-xs text-slate-500 mt-1">Create tickets and categorize issues.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'WELCOME' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("WELCOME", ["hi", "hello"])}
                        >
                            <h4 className="font-semibold text-slate-900">👋 Welcome Greeting</h4>
                            <p className="text-xs text-slate-500 mt-1">Auto-reply to Hi/Hello with business info.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'BUTTONS_MENU' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("BUTTONS_MENU", ["options", "start"])}
                        >
                            <h4 className="font-semibold text-slate-900">🔘 Button Main Menu</h4>
                            <p className="text-xs text-slate-500 mt-1">Simple menu with up to 3 clickable buttons.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'AGENT_HANDOFF' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("AGENT_HANDOFF", ["agent", "human"])}
                        >
                            <h4 className="font-semibold text-slate-900">👤 Talk to Agent</h4>
                            <p className="text-xs text-slate-500 mt-1">Escalate conversation to a human.</p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${blueprint.goal === 'CUSTOM_FORM' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'hover:bg-slate-50'}`}
                            onClick={() => setGoal("CUSTOM_FORM", ["start"])}
                        >
                            <h4 className="font-semibold text-slate-900">📝 Custom Form Wizard</h4>
                            <p className="text-xs text-slate-500 mt-1">Build a custom sequence of questions and messages.</p>
                        </div>
                    </div>
                );
            case 1: // Trigger
                return (
                    <div className="space-y-4">
                        <Label>Keywords (comma separated)</Label>
                        <Input
                            value={blueprint.trigger.values.join(", ")}
                            onChange={(e) => setBlueprint({
                                ...blueprint,
                                trigger: { values: e.target.value.split(",").map(s => s.trim()) }
                            })}
                        />
                        <p className="text-sm text-slate-500">Trigger words to start this {blueprint.goal.toLowerCase()} flow.</p>
                    </div>
                );
            case 2: // Configuration (Dynamic based on Goal)
                if (['SALES', 'RESTAURANT'].includes(blueprint.goal)) {
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label>Show Product Menu?</Label>
                                <Switch
                                    checked={blueprint.menu.enabled}
                                    onCheckedChange={(c) => updateBlueprint('menu', 'enabled', c)}
                                />
                            </div>
                            {blueprint.menu.enabled && (
                                <div className="ml-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Send Images?</Label>
                                        <Switch
                                            checked={blueprint.menu.sendImages}
                                            onCheckedChange={(c) => updateBlueprint('menu', 'sendImages', c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Ask Quantity?</Label>
                                        <Switch
                                            checked={blueprint.cart.askQuantity}
                                            onCheckedChange={(c) => updateBlueprint('cart', 'askQuantity', c)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                } else if (blueprint.goal === 'WELCOME') {
                    return (
                        <div className="space-y-4">
                            <div>
                                <Label>Greeting Message</Label>
                                <Input
                                    value={blueprint.welcomeMessage}
                                    onChange={(e) => setBlueprint({ ...blueprint, welcomeMessage: e.target.value })}
                                    placeholder="e.g. Hi there! Welcome to..."
                                />
                            </div>
                            <div>
                                <Label>Business Name</Label>
                                <Input value={blueprint.businessName} onChange={(e) => setBlueprint({ ...blueprint, businessName: e.target.value })} />
                            </div>
                            <div>
                                <Label>Opening Hours</Label>
                                <Input value={blueprint.openingHours} onChange={(e) => setBlueprint({ ...blueprint, openingHours: e.target.value })} />
                            </div>
                        </div>
                    );
                } else if (blueprint.goal === 'BUTTONS_MENU') {
                    return (
                        <div className="space-y-4">
                            <div>
                                <Label>Menu Message</Label>
                                <Input value={blueprint.message} onChange={(e) => setBlueprint({ ...blueprint, message: e.target.value })} />
                            </div>
                            <div>
                                <Label>Button 1</Label>
                                <Input value={blueprint.buttons[0]} onChange={(e) => {
                                    const newBtns = [...blueprint.buttons]; newBtns[0] = e.target.value;
                                    setBlueprint({ ...blueprint, buttons: newBtns });
                                }} />
                            </div>
                            <div>
                                <Label>Button 2</Label>
                                <Input value={blueprint.buttons[1]} onChange={(e) => {
                                    const newBtns = [...blueprint.buttons]; newBtns[1] = e.target.value;
                                    setBlueprint({ ...blueprint, buttons: newBtns });
                                }} />
                            </div>
                            <div>
                                <Label>Button 3</Label>
                                <Input value={blueprint.buttons[2]} onChange={(e) => {
                                    const newBtns = [...blueprint.buttons]; newBtns[2] = e.target.value;
                                    setBlueprint({ ...blueprint, buttons: newBtns });
                                }} />
                            </div>
                        </div>
                    );
                } else if (blueprint.goal === 'AGENT_HANDOFF') {
                    return (
                        <div className="space-y-4">
                            <div>
                                <Label>Wait Message</Label>
                                <Input value={blueprint.handoffMessage} onChange={(e) => setBlueprint({ ...blueprint, handoffMessage: e.target.value })} />
                            </div>
                        </div>
                    );
                }
                else if (blueprint.goal === 'APPOINTMENT') {
                    return (
                        <div className="text-center py-8 text-slate-500">
                            <p>We will automatically add questions for <b>Service Type</b> and <b>Preferred Date</b>.</p>
                        </div>
                    );
                } else if (blueprint.goal === 'SUPPORT') {
                    return (
                        <div className="text-center py-8 text-slate-500">
                            <p>We will automatically ask for <b>Issue Description</b> and create a <b>Support Ticket</b>.</p>
                        </div>
                    );
                } else if (blueprint.goal === 'CUSTOM_FORM') {
                    // Custom Form Builder
                    const addStep = (type: string, subtype?: string) => {
                        const newStep = { type, subtype, text: "", question: "", variable: "" };
                        setBlueprint(prev => ({ ...prev, formSteps: [...prev.formSteps, newStep] }));
                    };

                    const removeStep = (index: number) => {
                        setBlueprint(prev => ({ ...prev, formSteps: prev.formSteps.filter((_, i) => i !== index) }));
                    };

                    const updateStep = (index: number, field: string, value: string) => {
                        const newSteps = [...blueprint.formSteps];
                        newSteps[index] = { ...newSteps[index], [field]: value };
                        setBlueprint(prev => ({ ...prev, formSteps: newSteps }));
                    };

                    return (
                        <div className="space-y-6">
                            {/* Component Palette */}
                            <div className="flex flex-wrap gap-2 pb-4 border-b">
                                <Button variant="outline" size="sm" onClick={() => addStep('MSG')} className="gap-2">
                                    💬 Text
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addStep('ASK', 'text')} className="gap-2">
                                    ❓ Ask Text
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addStep('ASK', 'number')} className="gap-2">
                                    🔢 Ask Number
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => addStep('PRODUCTS')} className="gap-2">
                                    🛍 Show Products
                                </Button>
                            </div>

                            {/* Steps List */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {blueprint.formSteps.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                                        <p>No steps yet. Add a component above to start!</p>
                                    </div>
                                )}
                                {blueprint.formSteps.map((step, idx) => (
                                    <div key={idx} className="border rounded-md p-3 relative bg-slate-50 group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => removeStep(idx)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="bg-slate-200 text-xs px-2 py-0.5 rounded font-mono font-bold text-slate-600">Step {idx + 1}</span>
                                            <span className="text-xs font-semibold uppercase text-slate-500">{step.type} {step.subtype ? `(${step.subtype})` : ''}</span>
                                        </div>

                                        {step.type === 'MSG' && (
                                            <div className="space-y-2">
                                                <Label className="text-xs">Message Text</Label>
                                                <Input
                                                    value={step.text}
                                                    onChange={e => updateStep(idx, 'text', e.target.value)}
                                                    placeholder="Send a message..."
                                                    className="bg-white"
                                                />
                                            </div>
                                        )}

                                        {step.type === 'ASK' && (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Question</Label>
                                                        <Input
                                                            value={step.question}
                                                            onChange={e => updateStep(idx, 'question', e.target.value)}
                                                            placeholder="What do you want to ask?"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Save Answer As (Variable)</Label>
                                                        <Input
                                                            value={step.variable}
                                                            onChange={e => updateStep(idx, 'variable', e.target.value)}
                                                            placeholder="e.g. user_name"
                                                            className="bg-white font-mono text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {step.type === 'PRODUCTS' && (
                                            <div className="p-2 bg-white rounded border text-sm text-slate-600 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-purple-500" />
                                                Will display top 5 products with images.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Hints */}
                            {blueprint.formSteps.length > 0 && (
                                <div className="text-xs text-slate-500 italic flex items-center gap-2 bg-blue-50 p-2 rounded text-blue-700">
                                    <Sparkles className="h-3 w-3" />
                                    {blueprint.formSteps[blueprint.formSteps.length - 1].type === 'ASK'
                                        ? "Tip: After asking a question, user input will be saved automatically. You can verify it or ask another question."
                                        : "Tip: Keep messages short and engaging."}
                                </div>
                            )}
                        </div>
                    );
                }
                return null;

            case 3: // Confirmation & Actions
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label>Enable Confirmation Step?</Label>
                            <Switch
                                checked={blueprint.confirmation.enabled}
                                onCheckedChange={(c) => updateBlueprint('confirmation', 'enabled', c)}
                            />
                        </div>
                        {blueprint.confirmation.enabled && (
                            <div className="ml-4">
                                <Label>Confirmation Message</Label>
                                <Input
                                    value={blueprint.confirmation.message}
                                    onChange={(e) => updateBlueprint('confirmation', 'message', e.target.value)}
                                />
                            </div>
                        )}
                        <div className="pt-4 border-t">
                            <Label className="mb-2 block">On Success</Label>
                            <div className="flex items-center gap-2">
                                <Switch checked={true} disabled />
                                <span className="text-sm">Notify Admin</span>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Publish
                return (
                    <div className="space-y-4">
                        <Label>Automation Name</Label>
                        <Input
                            value={blueprint.name}
                            onChange={(e) => setBlueprint({ ...blueprint, name: e.target.value })}
                            placeholder={`e.g. My ${blueprint.goal} Flow`}
                            autoFocus
                        />
                        <div className={`p-4 rounded-lg border flex items-center gap-2 bg-slate-50`}>
                            <Sparkles className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-800">Ready to build {blueprint.goal} automation</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <Card className="border-t-4 border-t-green-600 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Guided Flow Builder</CardTitle>
                            <CardDescription>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</CardDescription>
                        </div>
                        <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="min-h-[300px] pt-6">
                    <h3 className="text-lg font-medium text-slate-800 mb-6">{STEPS[currentStep].description}</h3>
                    {renderStepContent()}
                </CardContent>

                <CardFooter className="flex justify-between bg-slate-50 border-t p-6">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        <Button onClick={handlePublish} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Automation
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="bg-slate-900 group">
                            Next
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
