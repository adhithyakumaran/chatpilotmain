"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Tag as TagIcon, MoreHorizontal, X, Pencil, Trash2, Info, MessageSquare } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Tag {
    id: string;
    name: string;
    color?: string;
}

interface Customer {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    tags: Tag[];
    lastSeenAt: string | null;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    // Import State
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [saving, setSaving] = useState(false);

    // Load Data
    const loadCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/customers", { params: { search } });
            setCustomers(res.data.data);
        } catch (e) {
            console.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const loadTags = async () => {
        try {
            const res = await api.get("/api/tags");
            setAvailableTags(res.data);
        } catch (e) { }
    }

    useEffect(() => {
        loadTags();
    }, []);

    useEffect(() => {
        const timer = setTimeout(loadCustomers, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Tag Operations
    const addTag = async (customerId: string, tagId: string) => {
        // Optimistic Update
        const customerIndex = customers.findIndex(c => c.id === customerId);
        const tag = availableTags.find(t => t.id === tagId);
        if (customerIndex === -1 || !tag) return;

        const updatedCustomers = [...customers];
        if (updatedCustomers[customerIndex].tags.some(t => t.id === tagId)) return; // Already tagged

        updatedCustomers[customerIndex] = {
            ...updatedCustomers[customerIndex],
            tags: [...updatedCustomers[customerIndex].tags, tag]
        };
        setCustomers(updatedCustomers);

        try {
            await api.post(`/api/customers/${customerId}/tags`, { tags: [tagId] });
        } catch (e) {
            loadCustomers();
        }
    };

    const removeTag = async (customerId: string, tagId: string) => {
        const customerIndex = customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) return;

        const updatedCustomers = [...customers];
        updatedCustomers[customerIndex] = {
            ...updatedCustomers[customerIndex],
            tags: updatedCustomers[customerIndex].tags.filter(t => t.id !== tagId)
        };
        setCustomers(updatedCustomers);

        try {
            await api.delete(`/api/customers/${customerId}/tags/${tagId}`);
        } catch (e) {
            loadCustomers();
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/api/customers/import", formData);
            alert(`Imported ${res.data.stats.added} new, ${res.data.stats.updated} updated.`);
            loadCustomers();
        } catch (err: any) {
            alert("Import failed: " + (err.response?.data?.error || err.message));
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // CRUD Handlers
    const openAddModal = () => {
        setEditingCustomer(null);
        setFormData({ name: "", phone: "", email: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name || "",
            phone: customer.phone,
            email: customer.email || ""
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingCustomer) {
                // Update
                await api.put(`/api/customers/${editingCustomer.id}`, formData);
            } else {
                // Create
                await api.post("/api/customers", formData);
            }
            setIsModalOpen(false);
            loadCustomers();
        } catch (err: any) {
            alert("Error: " + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (customerId: string) => {
        if (!confirm("Are you sure? This will delete all chat history and data for this customer.")) return;
        try {
            await api.delete(`/api/customers/${customerId}`);
            loadCustomers();
        } catch (err: any) {
            alert("Delete failed: " + (err.message));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
                <p className="text-sm text-slate-500">Manage your audience and assign tags.</p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <Button onClick={openAddModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={async () => {
                            try {
                                const res = await api.get("/api/customers/export", {
                                    params: { search },
                                    responseType: 'blob'
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'customers.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (e) { console.error(e); alert("Export failed"); }
                        }}>
                            <Loader2 className="mr-2 h-4 w-4 hidden" /> {/* Placeholder for loading state if we want later */}
                            Export
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                                    <Info className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Import Customers</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 text-sm text-slate-600 py-2">
                                    <p>Upload a <strong>CSV</strong> or <strong>Excel</strong> file with the following headers (case-insensitive):</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Phone</strong> (Required): 10-digit mobile number</li>
                                        <li><strong>Name</strong>: Customer name</li>
                                        <li><strong>Email</strong>: Email address</li>
                                        <li><strong>Tags</strong>: Comma-separated tags (e.g., "VIP, Lead")</li>
                                    </ul>
                                    <div className="bg-slate-100 p-3 rounded-md font-mono text-xs overflow-x-auto">
                                        Name,Phone,Email,Tags<br />
                                        John Doe,9876543210,john@example.com,"VIP, Old"<br />
                                        Jane Smith,9123456789,,Lead
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleImport}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            {importing ? "Importing..." : "Import CSV"}
                        </Button>
                    </div>
                    <div className="text-sm text-slate-500 border-l pl-4 ml-2">
                        {customers.length} Records
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="p-4 w-[250px]">Profile</th>
                            <th className="p-4 w-[250px] pl-0">Email</th>
                            <th className="p-4">Tags</th>
                            <th className="p-4 w-[150px]">Last Seen</th>
                            <th className="p-4 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        )}
                        {!loading && customers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    No customers found. Wait for incoming messages or add manually.
                                </td>
                            </tr>
                        )}
                        {!loading && customers.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-slate-900">{c.name || "Unknown"}</div>
                                    <div className="text-slate-500 text-xs font-mono">{c.phone}</div>
                                </td>
                                <td className="p-4 pl-0 text-slate-600 truncate max-w-[250px]">
                                    {c.email || "-"}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {c.tags.map(tag => (
                                            <Badge key={tag.id} variant="secondary" className="px-2 py-0.5 text-xs font-normal gap-1 hover:bg-slate-200">
                                                {tag.name}
                                                <X
                                                    className="h-3 w-3 cursor-pointer text-slate-400 hover:text-red-600"
                                                    onClick={() => removeTag(c.id, tag.id)}
                                                />
                                            </Badge>
                                        ))}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full border border-dashed border-slate-300 hover:border-slate-400 text-slate-400">
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-[150px]">
                                                <DropdownMenuLabel className="text-xs">Add Tag</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {availableTags.map(tag => (
                                                    <DropdownMenuItem
                                                        key={tag.id}
                                                        onClick={() => addTag(c.id, tag.id)}
                                                        disabled={c.tags.some(t => t.id === tag.id)}
                                                    >
                                                        {tag.name}
                                                    </DropdownMenuItem>
                                                ))}
                                                {availableTags.length === 0 && (
                                                    <div className="p-2 text-xs text-slate-400 text-center">No tags available.</div>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 text-xs">
                                    {c.lastSeenAt ? new Date(c.lastSeenAt).toLocaleDateString() : "Never"}
                                </td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50"
                                        onClick={() => window.location.href = `/inbox?phone=${c.phone}`}
                                        title="Start Chat"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(c)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-red-600 focus:text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone (Required)</Label>
                            <Input
                                placeholder="1234567890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!!editingCustomer} // Prevent removing phone entirely or confusing logic? Allowed to edit.
                            />
                            {editingCustomer && <p className="text-xs text-slate-500">Updating phone will change identity if used for messaging.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
