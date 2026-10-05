"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // Access axios instance directly for upload
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, Users, MessageSquare, Eye, Paperclip, X, Image as ImageIcon } from "lucide-react";
import TagChip from "@/components/broadcast/TagChip";
import { fetchTags, createBroadcast, executeBroadcast, Tag } from "@/lib/broadcast";
import { cn } from "@/lib/utils";
import MediaLibraryModal from "@/components/media/MediaLibraryModal";

export default function NewBroadcastPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Data
    const [tags, setTags] = useState<Tag[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            fetchTags(),
            api.get("/api/templates").then(res => res.data).catch(() => [])
        ]).then(([tagsData, templatesData]) => {
            setTags(tagsData);
            setTemplates(templatesData);
            setInitializing(false);
        }).catch(() => setInitializing(false));
    }, []);

    // Form State
    const [name, setName] = useState("");
    const [audienceType, setAudienceType] = useState<"ALL" | "TAGS">("ALL");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [tagLogic, setTagLogic] = useState<"OR" | "AND">("OR");
    const [message, setMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaName, setMediaName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(false);

    useEffect(() => {
        fetchTags()
            .then(data => {
                setTags(data);
                setInitializing(false);
            })
            .catch(() => setInitializing(false));
    }, []);

    const toggleTag = (id: string) => {
        setSelectedTagIds(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (mediaName.trim()) formData.append("name", mediaName);

        try {
            const res = await api.post("/api/upload", formData);
            setMediaUrl(res.data.url); // Use full URL for preview
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload media");
        } finally {
            setUploading(false);
        }
    };

    const handleSend = async () => {
        setLoading(true);
        try {
            // 1. Create
            const res = await createBroadcast({
                name: name || `Campaign ${new Date().toLocaleDateString()}`,
                audienceType,
                tagLogic,
                tagIds: selectedTagIds,
                message,
                mediaUrl
            });

            const broadcastId = res.broadcastId;

            // 2. Execute
            await executeBroadcast(broadcastId);

            router.push("/broadcasts");
        } catch (e) {
            console.error(e);
            alert("Failed to send broadcast");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    const canProceedToStep2 = audienceType === 'ALL' || (audienceType === 'TAGS' && selectedTagIds.length > 0);
    const canProceedToStep3 = step === 2 && name.trim() !== '' && message.trim() !== '';

    return (
        // Full viewport height container (minus topbar handled by layout)
        <div className="flex h-full w-full bg-white animate-in fade-in duration-300">

            {/* Left Column: Form Configuration (Scrollable) */}
            <div className="flex-1 flex flex-col border-r border-slate-200 min-w-[500px]">
                {/* Header */}
                <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => router.back()} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">New Broadcast</h2>
                            <p className="text-xs text-slate-500">Step {step} of 3</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Step 1: Audience */}
                    <div className={cn("transition-opacity duration-300", step !== 1 && step > 1 ? "opacity-50 pointer-events-none grayscale" : "")}>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>1</span>
                            Audience Selection
                        </h3>

                        <Card className="shadow-none border border-slate-200">
                            <CardContent className="p-4 space-y-4">
                                <RadioGroup value={audienceType} onValueChange={(v) => setAudienceType(v as "ALL" | "TAGS")}>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-slate-50 cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="ALL" id="all" />
                                            <Label htmlFor="all" className="cursor-pointer font-medium">All Customers</Label>
                                        </div>
                                        <Badge variant="secondary" className="font-normal">Broad Reach</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-slate-50 cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="TAGS" id="tags" />
                                            <Label htmlFor="tags" className="cursor-pointer font-medium">Filter by Tags</Label>
                                        </div>
                                        <Badge variant="secondary" className="font-normal">Targeted</Badge>
                                    </div>
                                </RadioGroup>

                                {audienceType === 'TAGS' && (
                                    <div className="pl-9 pt-2 space-y-4 animate-in slide-in-from-top-2">
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <TagChip
                                                    key={tag.id}
                                                    label={tag.name}
                                                    active={selectedTagIds.includes(tag.id)}
                                                    onClick={() => toggleTag(tag.id)}
                                                />
                                            ))}
                                            {tags.length === 0 && <span className="text-sm text-slate-400">No tags found.</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                            <span className="font-medium">Match Logic:</span>
                                            <div className="flex bg-white rounded border border-slate-200 p-0.5">
                                                <button onClick={() => setTagLogic("OR")} className={cn("px-2 py-0.5 rounded transition-colors", tagLogic === "OR" ? "bg-green-100 text-green-700 font-bold" : "hover:bg-slate-50")}>ANY</button>
                                                <div className="w-px bg-slate-200 mx-0.5"></div>
                                                <button onClick={() => setTagLogic("AND")} className={cn("px-2 py-0.5 rounded transition-colors", tagLogic === "AND" ? "bg-green-100 text-green-700 font-bold" : "hover:bg-slate-50")}>ALL</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Step 2: Message */}
                    <div className={cn("transition-opacity duration-300", step !== 2 && step < 2 ? "opacity-30 blur-[1px] pointer-events-none" : "", step > 2 ? "opacity-50" : "")}>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                            Content & Media
                        </h3>

                        <Card className="shadow-none border border-slate-200">
                            <CardContent className="p-4 space-y-4">
                                {/* Template Selector */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Use Template (Optional)</Label>
                                    <select
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                        onChange={(e) => {
                                            const tId = e.target.value;
                                            if (!tId) return;
                                            const t = templates.find(temp => temp.id === tId);
                                            if (t) {
                                                setMessage(t.content);
                                                if (t.media) {
                                                    setMediaUrl(t.media.url);
                                                    setMediaName(t.media.name); // Optional
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">Select a template...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Internal Campaign Name</Label>
                                    <Input
                                        placeholder="e.g., Summer Sale Blast 2024"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-slate-500">Message Body</Label>
                                        <div className="text-xs text-slate-400 space-x-1">
                                            <span onClick={() => setMessage(m => m + " {{name}} ")} className="cursor-pointer hover:text-green-600 font-medium bg-slate-100 px-1 rounded transition-colors">+ Name</span>
                                            <span onClick={() => setMessage(m => m + " {{phone}} ")} className="cursor-pointer hover:text-green-600 font-medium bg-slate-100 px-1 rounded transition-colors">+ Phone</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Hi {{name}}, we have a new offer..."
                                        className="min-h-[140px] resize-none font-sans text-[15px] leading-relaxed"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button variant="outline" className="relative h-9 text-slate-600 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50" disabled={uploading}>
                                        {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Paperclip className="w-4 h-4 mr-2" />}
                                        {mediaUrl ? "Change Media" : "Upload New"}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf,video/*" onChange={handleUpload} />
                                    </Button>

                                    <Button variant="secondary" className="h-9" onClick={() => setLibraryOpen(true)}>
                                        <ImageIcon className="w-4 h-4 mr-2" /> Select from Library
                                    </Button>
                                </div>

                                {mediaUrl ? null : (
                                    <div className="pt-2">
                                        <Label className="text-xs text-slate-500 mb-1 block">Save Media As (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Promo Image"
                                            className="h-8 text-sm"
                                            value={mediaName}
                                            onChange={e => setMediaName(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="pt-2">
                                    {mediaUrl && (
                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded text-xs text-green-700 border border-green-200 max-w-[200px]">
                                            <Eye className="w-3 h-3" />
                                            <span className="truncate">{mediaUrl.split('/').pop()}</span>
                                            <X className="w-3 h-3 cursor-pointer hover:text-green-900 ml-1" onClick={() => setMediaUrl(null)} />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center sticky bottom-0 z-20">
                    {step === 1 ? (
                        <div className="flex gap-2 w-full">
                            <Button variant="ghost" disabled className="invisible">Back</Button>
                            <Button onClick={() => setStep(2)} disabled={!canProceedToStep2} className="ml-auto bg-slate-900 hover:bg-slate-800 text-white px-8">
                                Next: Content <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                        </div>
                    ) : step === 2 ? (
                        <div className="flex gap-2 w-full">
                            <Button variant="outline" onClick={() => setStep(1)} className="text-slate-600">Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!canProceedToStep3} className="ml-auto bg-slate-900 hover:bg-slate-800 text-white px-8">
                                Preview & Send <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full">
                            <Button variant="outline" onClick={() => setStep(2)} className="text-slate-600">Edit Message</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Preview Pane (Fixed) */}
            <div className="w-[400px] bg-slate-100 flex flex-col border-l border-slate-200 relative">
                <div className="p-6 h-full flex flex-col justify-center items-center overflow-hidden">

                    {/* Phone Frame */}
                    <div className="w-[90%] max-w-[320px] aspect-[9/19] bg-white rounded-[3rem] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 z-20 flex justify-center"><div className="w-16 h-4 bg-slate-900 rounded-b-xl"></div></div>

                        {/* App Header */}
                        <div className="bg-[#075E54] h-16 pt-5 px-3 flex items-center gap-2 text-white shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                            <div className="text-xs">
                                <div className="font-semibold">My Business</div>
                                <div className="text-[9px] opacity-80">Online</div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 bg-[#efeae2] p-3 overflow-y-auto relative" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "300px" }}>
                            {/* Message Bubble */}
                            <div className="bg-white rounded-lg p-1.5 shadow-sm max-w-[90%] ml-auto relative">
                                {mediaUrl && (
                                    <div className="mb-1 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center h-28 w-full relative">
                                        {mediaUrl.match(/\.(mp4|mov)$/i) ? <div className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">▶</div> : <ImageIcon className="text-slate-300 w-8 h-8" />}
                                        {mediaUrl.match(/\.(jpg|png)$/i) && <img src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" />}
                                    </div>
                                )}
                                <div className="text-[13px] text-slate-800 leading-snug whitespace-pre-wrap px-1">
                                    {message.replace(/{{name}}/g, "Ramesh").replace(/{{phone}}/g, "+91...") || <span className="text-slate-300 italic">Start typing...</span>}
                                </div>
                                <div className="text-[9px] text-slate-400 text-right mt-1 flex justify-end gap-0.5">
                                    12:05 PM <span className="text-blue-500 font-bold">✓✓</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <div className="text-sm font-medium text-slate-500">Live Preview</div>
                        {step === 3 && (
                            <Button onClick={handleSend} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02]">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                Confirm & Send Broadcast
                            </Button>
                        )}
                        {step === 3 && (
                            <p className="text-xs text-slate-400 px-4">
                                This will send messages to <strong>{audienceType === 'ALL' ? 'All Customers' : `${selectedTagIds.length} tag groups`}</strong>.
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                open={libraryOpen}
                onOpenChange={setLibraryOpen}
                onSelect={(url) => setMediaUrl(url)}
            />

        </div>
    );
}
