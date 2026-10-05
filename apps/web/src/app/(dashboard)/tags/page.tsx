"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Tag as TagIcon, Trash2, Database, Variable } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Variable {
    id: string;
    key: string;
    description: string;
    type: string;
}

export default function TagsAndVarsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Management</h2>
                <p className="text-sm text-slate-500">Manage customer tags and flow variables.</p>
            </div>

            <Tabs defaultValue="tags" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="tags">🏷️ Tags</TabsTrigger>
                    <TabsTrigger value="vars">💾 Variables</TabsTrigger>
                </TabsList>

                <TabsContent value="tags" className="mt-6">
                    <TagsTab />
                </TabsContent>

                <TabsContent value="vars" className="mt-6">
                    <VariablesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TagsTab() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTag, setNewTag] = useState("");
    const [adding, setAdding] = useState(false);

    const loadTags = async () => {
        try {
            const res = await api.get("/api/tags");
            setTags(res.data);
        } catch (e) {
            console.error("Failed to load tags");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, []);

    const addTag = async () => {
        if (!newTag.trim()) return;
        setAdding(true);
        try {
            await api.post("/api/tags", { name: newTag, color: "blue" });
            setNewTag("");
            loadTags();
        } catch (e) {
            alert("Failed to create tag");
        } finally {
            setAdding(false);
        }
    };

    const deleteTag = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/api/tags/${id}`);
            loadTags();
        } catch (e) {
            alert("Failed to delete tag");
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Create Tag</CardTitle>
                    <CardDescription>Add a new label to segment your audience.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Input
                        placeholder="e.g. VIP, Saree Lover"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button onClick={addTag} disabled={!newTag || adding}>
                        {adding ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Existing Tags ({tags.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {tags.length === 0 && <p className="text-sm text-slate-500">No tags created yet.</p>}
                        {tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="px-3 py-1 flex items-center gap-2 text-sm">
                                {tag.name}
                                <Trash2
                                    className="h-3 w-3 cursor-pointer text-slate-400 hover:text-red-500"
                                    onClick={() => deleteTag(tag.id)}
                                />
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function VariablesTab() {
    const [variables, setVariables] = useState<Variable[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form
    const [key, setKey] = useState("");
    const [desc, setDesc] = useState("");
    const [type, setType] = useState("string");

    const loadVars = async () => {
        try {
            const res = await api.get("/api/variables");
            setVariables(res.data);
        } catch (e) {
            console.error("Failed to load variables");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVars();
    }, []);

    const addVar = async () => {
        if (!key.trim()) return;
        setAdding(true);
        try {
            await api.post("/api/variables", { key, description: desc, type });
            setKey("");
            setDesc("");
            loadVars();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to create variable");
        } finally {
            setAdding(false);
        }
    };

    const deleteVar = async (id: string) => {
        if (!confirm("Delete this variable? It won't remove data from past chats.")) return;
        try {
            await api.delete(`/api/variables/${id}`);
            loadVars();
        } catch (e) {
            alert("Failed to delete variable");
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Define Variable</CardTitle>
                    <CardDescription>
                        Create variables to use in your flows (e.g. <code>cart_value</code>, <code>user_email</code>).
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4 items-end">
                    <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-medium">Key (e.g. order_id)</label>
                        <Input placeholder="key_name" value={key} onChange={e => setKey(e.target.value.replace(/\s+/g, '_').toLowerCase())} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium">Description</label>
                        <Input placeholder="What is this for?" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                    <div className="md:col-span-1">
                        <Button className="w-full" onClick={addVar} disabled={!key || adding}>
                            {adding ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Variable"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Variable Dictionary ({variables.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variables.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                        No variables defined. Add one above.
                                    </TableCell>
                                </TableRow>
                            )}
                            {variables.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-mono text-xs font-bold text-blue-600">
                                        {`{{${v.key}}}`}
                                    </TableCell>
                                    <TableCell>{v.description || "-"}</TableCell>
                                    <TableCell className="text-xs uppercase text-slate-400">{v.type}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteVar(v.id)}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
