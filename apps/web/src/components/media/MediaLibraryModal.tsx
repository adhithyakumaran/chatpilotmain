"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MediaItem {
    id: string;
    name: string;
    url: string;
    type: string;
    createdAt: string;
}

interface MediaLibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ open, onOpenChange, onSelect }: MediaLibraryModalProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) fetchMedia();
    }, [open]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/media");
            setMedia(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (url: string) => {
        onSelect(url);
        onOpenChange(false);
    };

    const filteredMedia = media.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 items-center pb-4 border-b border-slate-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search media..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pt-4">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No media found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map(item => (
                                <Card
                                    key={item.id}
                                    className="group overflow-hidden border-slate-200 cursor-pointer hover:ring-2 ring-green-500 transition-all hover:shadow-md"
                                    onClick={() => handleSelect(item.url)}
                                >
                                    <div className="aspect-square bg-slate-100 relative items-center justify-center flex">
                                        {item.type.includes('image') ? (
                                            <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <FileText className="h-12 w-12 text-slate-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-sm truncate" title={item.name}>{item.name}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
