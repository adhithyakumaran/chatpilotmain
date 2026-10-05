"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Trash2, Search, FileText, Image as ImageIcon, Pencil, Plus, LayoutTemplate } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MediaItem {
    id: string;
    name: string;
    url: string;
    type: string;
    createdAt: string;
}

interface Template {
    id: string;
    name: string;
    content: string;
    mediaId?: string;
    media?: MediaItem;
    createdAt: string;
}

export default function MediaPage() {
    const [activeTab, setActiveTab] = useState("gallery");
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);

    // Rename State
    const [renameOpen, setRenameOpen] = useState(false);
    const [renameData, setRenameData] = useState({ id: "", name: "" });

    // Template State
    const [templateOpen, setTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [templateForm, setTemplateForm] = useState({ name: "", content: "", mediaId: "none" });
    const [savingTemplate, setSavingTemplate] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mediaRes, templateRes] = await Promise.all([
                api.get("/api/media"),
                api.get("/api/templates")
            ]);
            setMedia(mediaRes.data);
            setTemplates(templateRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Media Handlers ---
    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", fileName || file.name);

        try {
            await api.post("/api/upload", formData);
            setUploadOpen(false);
            setFile(null);
            setFileName("");
            loadData();
        } catch (e) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMedia = async (id: string) => {
        if (!confirm("Delete media? templates using this might break.")) return;
        try {
            await api.delete(`/api/media/${id}`);
            setMedia(options => options.filter(m => m.id !== id));
        } catch (e) { alert("Delete failed"); }
    };

    const handleRenameMedia = async () => {
        if (!renameData.name) return;
        try {
            await api.put(`/api/upload/${renameData.id}`, { name: renameData.name });
            setMedia(media.map(m => m.id === renameData.id ? { ...m, name: renameData.name } : m));
            setRenameOpen(false);
        } catch (e) { alert("Rename failed"); }
    };

    const openRename = (item: MediaItem) => {
        setRenameData({ id: item.id, name: item.name });
        setRenameOpen(true);
    };

    // --- Template Handlers ---
    const openTemplateModal = (t?: Template) => {
        setEditingTemplate(t || null);
        setTemplateForm({
            name: t?.name || "",
            content: t?.content || "",
            mediaId: t?.mediaId || "none"
        });
        setTemplateOpen(true);
    };

    const handleSaveTemplate = async () => {
        if (!templateForm.name || !templateForm.content) return alert("Name and Content required");
        setSavingTemplate(true);
        try {
            const payload = {
                name: templateForm.name,
                content: templateForm.content,
                mediaId: templateForm.mediaId === "none" ? null : templateForm.mediaId
            };

            if (editingTemplate) {
                await api.put(`/api/templates/${editingTemplate.id}`, payload);
            } else {
                await api.post("/api/templates", payload);
            }
            setTemplateOpen(false);
            loadData();
        } catch (e) {
            alert("Failed to save template");
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Delete template?")) return;
        try {
            await api.delete(`/api/templates/${id}`);
            loadData();
        } catch (e) { alert("Delete failed"); }
    };


    const filteredMedia = media.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full flex flex-col space-y-6 p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Media & Templates</h2>
                    <p className="text-sm text-slate-500">Manage assets and reusable message templates.</p>
                </div>
            </div>

            <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
                        <TabsTrigger value="templates">Message Templates</TabsTrigger>
                    </TabsList>

                    {activeTab === "gallery" ? (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search media..."
                                    className="pl-9 w-[200px] md:w-[300px]"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <Upload className="mr-2 h-4 w-4" /> Upload
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Upload Media</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>File Name</Label>
                                            <Input
                                                placeholder="My Image"
                                                value={fileName}
                                                onChange={e => setFileName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>File</Label>
                                            <Input
                                                type="file"
                                                onChange={e => setFile(e.target.files?.[0] || null)}
                                                accept="image/*,application/pdf,video/*"
                                            />
                                        </div>
                                        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <Button onClick={() => openTemplateModal()} className="bg-green-600 hover:bg-green-700">
                            <Plus className="mr-2 h-4 w-4" /> Create Template
                        </Button>
                    )}
                </div>

                <TabsContent value="gallery" className="mt-0">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <ImageIcon className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                            <p>No media found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map(item => (
                                <Card key={item.id} className="group overflow-hidden border-slate-200 hover:border-green-200 transition-all hover:shadow-md">
                                    <div className="aspect-square bg-slate-100 relative items-center justify-center flex">
                                        {item.type.includes('image') ? (
                                            <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <FileText className="h-12 w-12 text-slate-400" />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                            <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => openRename(item)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteMedia(item.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-sm truncate" title={item.name}>{item.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <LayoutTemplate className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                            <p>No templates yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {templates.map(t => (
                                <Card key={t.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-semibold">{t.name}</CardTitle>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => openTemplateModal(t)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleDeleteTemplate(t.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="p-3 bg-slate-50 rounded-md text-sm text-slate-700 whitespace-pre-wrap line-clamp-4 min-h-[80px]">
                                            {t.content}
                                        </div>
                                        {t.media && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 border p-2 rounded bg-white">
                                                <ImageIcon className="h-3 w-3" />
                                                <span className="truncate flex-1">{t.media.name}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Rename Media</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            value={renameData.name}
                            onChange={e => setRenameData({ ...renameData, name: e.target.value })}
                            placeholder="New name"
                        />
                        <Button onClick={handleRenameMedia} className="w-full">Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Template Dialog */}
            <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Template Name</Label>
                            <Input
                                placeholder="e.g. Welcome Message"
                                value={templateForm.name}
                                onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message Content</Label>
                            <Textarea
                                placeholder="Hello {{name}}, check out our latest offer!"
                                className="h-32"
                                value={templateForm.content}
                                onChange={e => setTemplateForm({ ...templateForm, content: e.target.value })}
                            />
                            <p className="text-xs text-slate-500">You can use variables later in broadcasts.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Attach Media (Optional)</Label>
                            <Select
                                value={templateForm.mediaId}
                                onValueChange={val => setTemplateForm({ ...templateForm, mediaId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select media..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Media</SelectItem>
                                    {media.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            <div className="flex items-center gap-2 w-full truncate">
                                                {m.type.includes('image') ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                                {m.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                            {savingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
