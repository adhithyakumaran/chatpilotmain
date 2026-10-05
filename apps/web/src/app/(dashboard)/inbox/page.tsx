"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Search, User, MoreVertical, Paperclip, Trash2, Smile, FileText, Download, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import EmojiPicker from 'emoji-picker-react';
import { useSearchParams } from "next/navigation";

export default function InboxPage() {
    const searchParams = useSearchParams();
    const initialPhone = searchParams.get("phone");

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedPhone, setSelectedPhone] = useState<string | null>(initialPhone);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.includes(searchQuery))
    );

    // Auto-select from URL if changed
    useEffect(() => {
        const phoneParam = searchParams.get("phone");
        if (phoneParam && phoneParam !== selectedPhone) {
            setSelectedPhone(phoneParam);
        }
    }, [searchParams]);

    // Fetch Conversations
    const loadConversations = async () => {
        try {
            const res = await api.get("/api/chat");
            setConversations(res.data);
        } catch (e) { }
    };

    // Fetch Messages
    const loadMessages = async () => {
        if (!selectedPhone) return;
        try {
            console.log("Loading messages for:", selectedPhone);
            const res = await api.get(`/api/chat/${selectedPhone}`);
            setMessages(res.data);
        } catch (e) {
            console.error("Failed to load messages:", e);
        }
    };

    // Send Message
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPhone) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("businessId", "business_1"); // TODO: dynamic businessId

        try {
            // Upload to S3/Local
            const uploadRes = await api.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const { url } = uploadRes.data;

            // Determine type
            let type = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            if (file.type.startsWith('audio/')) type = 'audio';

            // Send as message
            await api.post(`/api/chat/${selectedPhone}/send`, {
                text: text, // Optional caption
                mediaUrl: url,
                type,
                mimetype: file.type,
                fileName: file.name
            });

            setText("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (e) {
            console.error("Upload failed", e);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim() || !selectedPhone) return;
        setSending(true);
        try {
            await api.post(`/api/chat/${selectedPhone}/send`, { text });
            setText("");
            setShowEmoji(false);
            // Don't call loadMessages() here. Wait for socket event.
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    // Polling
    useEffect(() => {
        // Connect to backend
        const socketBase =
            process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
            (process.env.NODE_ENV === "production"
                ? "https://chatpilot-ai-server.onrender.com"
                : "http://localhost:4000");
        const socket = io(socketBase);

        socket.on("connect", () => {
            socket.emit("join_room", "business_1");
        });

        socket.on("new_message", (msg: any) => {
            if (msg.phone === selectedPhone) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
            loadConversations();
        });

        return () => {
            socket.disconnect();
        };
    }, [selectedPhone]);

    // Load messages when selected conversation changes
    useEffect(() => {
        if (selectedPhone) {
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [selectedPhone]);

    // Keep polling as backup but slower (10s)
    useEffect(() => {
        loadConversations();
        const interval = setInterval(() => {
            loadConversations();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleDeleteConversation = async () => {
        if (!selectedPhone) return;
        if (!confirm("Delete this conversation permanently?")) return;
        try {
            await api.delete(`/api/chat/${selectedPhone}`);
            setSelectedPhone(null);
            loadConversations();
        } catch (e) {
            console.error("Failed to delete chat:", e);
        }
    };

    return (
        <div className="flex h-full w-full bg-white font-sans">
            {/* Left: Sidebar */}
            <div className="w-[350px] border-r border-[#e9edef] flex flex-col bg-white">
                <div className="h-16 px-4 flex justify-between items-center bg-[#f0f2f5] border-r border-[#d1d7db]">
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10 cursor-pointer">
                            <AvatarFallback className="bg-[#dfe3e5] text-white"><User className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex gap-3 text-[#54656f]">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-[rgba(0,0,0,0.1)]"><MoreVertical className="h-5 w-5" /></Button>
                    </div>
                </div>

                <div className="p-2 border-b border-[#e9edef] relative bg-white">
                    <div className="relative flex items-center bg-[#f0f2f5] rounded-lg h-9 px-3">
                        <Search className="h-4 w-4 text-[#54656f] mr-4" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search or start new chat"
                            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm placeholder:text-[#54656f] h-full"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 bg-white">
                    <div className="flex flex-col">
                        {filteredConversations.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedPhone(c.phone)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 hover:bg-[#f5f6f6] transition-colors text-left border-b border-[#f0f2f5] last:border-0 relative cursor-pointer group",
                                    selectedPhone === c.phone ? "bg-[#f0f2f5]" : ""
                                )}
                            >
                                <Avatar className="h-12 w-12 border border-[#e9edef]">
                                    <AvatarFallback className="bg-[#dfe3e5] text-white"><User className="h-7 w-7" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden border-b border-[#f0f2f5] pb-3 -mb-3 group-last:border-none">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <div className="font-normal text-[#111b21] text-[17px] truncate">{c.name || c.phone}</div>
                                        <span className="text-[12px] text-[#667781]">
                                            {c.lastSeenAt ? new Date(c.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                        </span>
                                    </div>
                                    <div className="text-[14px] text-[#667781] truncate">
                                        {c.phone}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right: Chat Window */}
            {selectedPhone ? (
                <div className="flex-1 flex flex-col bg-[#efeae2] relative min-w-0 h-full">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                    {/* Chat Header - Fixed Height */}
                    <div className="h-16 px-4 py-2 border-b border-[#d1d7db] bg-[#f0f2f5] flex items-center justify-between z-20 shadow-sm relative flex-none">
                        <div className="flex items-center gap-4 cursor-pointer">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#dfe3e5] text-white"><User className="h-6 w-6" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-center">
                                <div className="font-normal text-[#111b21] text-[16px] leading-tight">
                                    {conversations.find(c => c.phone === selectedPhone)?.name || selectedPhone}
                                </div>
                                <div className="text-[13px] text-[#667781] leading-tight mt-0.5">
                                    {/* removed online status as requested */}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-[#54656f]">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[rgba(0,0,0,0.1)] rounded-full focus:outline-none focus:ring-0">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        Delete chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Messages Container - Scrollable */}
                    <div className="flex-1 overflow-y-auto w-full p-4 space-y-1 z-10 custom-scrollbar relative min-h-0" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="flex justify-center mt-8 mb-8">
                                <span className="bg-[#ffcc00] text-[#111b21] text-[12.5px] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%] mx-auto">
                                    Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                                </span>
                            </div>
                        )}
                        {messages.map((m) => {
                            const isMe = m.direction === 'OUTBOUND';
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                    <div className={cn(
                                        "max-w-[70%] px-2 pt-1.5 pb-1 rounded-lg text-[14.2px] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] relative group break-words min-w-[120px]",
                                        isMe ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" : "bg-white text-[#111b21] rounded-tl-none"
                                    )}>
                                        <span className="absolute top-0 w-0 h-0 border-[8px] border-transparent transform"
                                            style={isMe
                                                ? { borderLeftColor: '#d9fdd3', right: '-8px', top: '0px' }
                                                : { borderRightColor: 'white', left: '-8px', top: '0px' }}>
                                        </span>
                                        {!isMe && <span className="absolute top-0 -left-2 w-0 h-0 border-[8px] border-transparent border-r-white"></span>}

                                        {/* Image Display */}
                                        {(m.type === 'image' || m.mediaUrl) && (
                                            <div className="mb-1 rounded-lg overflow-hidden relative group/image max-w-[300px]">
                                                {m.mediaUrl ? (
                                                    // Render based on likely type
                                                    (m.type === 'video' || m.mediaUrl.match(/\.(mp4|mov|webm)$/i)) ? (
                                                        <video src={m.mediaUrl} controls className="max-w-full h-auto rounded-lg" />
                                                    ) : (m.type === 'image' || m.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                                        <img src={m.mediaUrl} alt="Shared media" className="max-w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-95" onClick={() => window.open(m.mediaUrl, '_blank')} />
                                                    ) : (
                                                        // Document / Other
                                                        <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200 min-w-[200px]">
                                                            <div className="bg-red-100 p-2 rounded-lg text-red-500">
                                                                <FileText className="h-6 w-6" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-700 truncate">{m.fileName || "Document"}</div>
                                                                <div className="text-xs text-slate-500 uppercase">{m.mediaUrl.split('.').pop()}</div>
                                                            </div>
                                                            <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                                                <Download className="h-5 w-5" />
                                                            </a>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="bg-slate-200 h-40 w-full flex items-center justify-center text-xs text-slate-500">[Image Missing]</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="pr-[10px] pb-4 whitespace-pre-wrap leading-[19px] mb-1 relative">
                                            {m.content}
                                        </div>
                                        <div className="absolute bottom-1 right-2 text-[11px] text-[#667781] flex items-center gap-1">
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            {isMe && <span className="text-[#53bdeb] text-[14px] font-bold">✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area - Fixed at Bottom */}
                    <div className="min-h-[62px] px-4 py-2 bg-[#f0f2f5] flex items-end gap-2 z-20 border-t border-[#d1d7db] relative flex-none">
                        {showEmoji && (
                            <div className="absolute bottom-[70px] left-4 z-50 shadow-2xl rounded-xl" ref={emojiRef}>
                                <EmojiPicker
                                    onEmojiClick={(e) => setText(prev => prev + e.emoji)}
                                    width={300}
                                    height={400}
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pb-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-transparent rounded-full h-10 w-10 transition-transform active:scale-95" onClick={() => setShowEmoji(!showEmoji)}>
                                <Smile className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#54656f] hover:bg-transparent rounded-full h-10 w-10 relative"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Paperclip className="h-6 w-6" />}
                            </Button>
                        </div>

                        <div className="flex-1 bg-white rounded-lg px-2 flex items-center min-h-[42px] mb-1.5 shadow-sm border border-transparent focus-within:border-white transition-colors">
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message"
                                className="flex-1 border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 text-[15px] placeholder:text-[#54656f] leading-relaxed"
                            />
                        </div>

                        <div className="pb-1.5">
                            {text.trim() ? (
                                <Button onClick={handleSend} disabled={sending} variant="ghost" size="icon" className="text-[#54656f] hover:bg-transparent rounded-full h-10 w-10">
                                    <Send className="h-6 w-6 text-[#54656f] fill-[#54656f]" />
                                </Button>
                            ) : (
                                <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-transparent rounded-full h-10 w-10">
                                    <span className="text-xl">🎙️</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-slate-500 pb-[100px]">
                    <div className="text-center space-y-8 max-w-md">
                        <div className="w-[300px] h-[200px] mx-auto opacity-60 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa6694.png')" }}></div>
                        <h2 className="text-3xl font-light text-[#41525d]">Converso Web</h2>
                        <p className="text-[14px] leading-6 text-[#8696a0]">
                            Send and receive messages without keeping your phone online.<br />
                            Use Converso on up to 4 linked devices and 1 phone.
                        </p>
                        <div className="text-xs text-[#8696a0] flex justify-center items-center gap-2 mt-10">
                            <span className="text-[10px]">🔒</span> End-to-end encrypted
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
