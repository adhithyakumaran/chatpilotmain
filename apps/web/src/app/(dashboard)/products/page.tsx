"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash, Image as ImageIcon, Box } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "", category: "General", price: "", unit: "item", imageUrls: [] as string[],
        quantity: "0", size: "", inStock: true, keywords: ""
    });

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const handleSave = async () => {
        try {
            await api.post("/api/products", formData);
            setOpen(false);
            setFormData({
                name: "", category: "General", price: "", unit: "item", imageUrls: [],
                quantity: "0", size: "", inStock: true, keywords: ""
            });
            loadProducts();
        } catch (e) {
            alert("Failed to save item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete item?")) return;
        try {
            await api.delete(`/api/products/${id}`);
            loadProducts();
        } catch (e) { alert("Failed delete"); }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h2>
                    <p className="text-sm text-slate-500">Track stock, prices, and variants.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="grid gap-2">
                                <Label>Item Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Cotton T-Shirt" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Size / Variant (Optional)</Label>
                                    <Input value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. L, 42, 1kg" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Price (₹)</Label>
                                    <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit</Label>
                                    <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="pcs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="grid gap-2">
                                    <Label>Quantity (Stock)</Label>
                                    <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={formData.inStock} onCheckedChange={(c) => setFormData({ ...formData, inStock: c })} />
                                        <span className="text-sm text-slate-600">{formData.inStock ? "In Stock" : "Out of Stock"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Image URL (Optional)</Label>
                                <Input placeholder="https://..." onChange={e => setFormData({ ...formData, imageUrls: e.target.value ? [e.target.value] : [] })} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Keywords (Comma separated)</Label>
                                <Input
                                    value={formData.keywords || ""}
                                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                    placeholder="e.g. red shirt, cotton, summer"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save to Inventory</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? <Loader2 className="animate-spin" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(p => (
                        <Card key={p.id} className={`group hover:shadow-md transition-all ${!p.inStock ? 'opacity-75 bg-slate-50' : ''}`}>
                            <CardContent className="p-4 flex gap-4">
                                <div className="h-24 w-24 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden shrink-0 relative">
                                    {p.imageUrls[0] ? (
                                        <img src={p.imageUrls[0]} className="h-full w-full object-cover" />
                                    ) : (
                                        <Box className="text-slate-400 h-8 w-8" />
                                    )}
                                    {!p.inStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold uppercase">Out</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-slate-900 truncate pr-2">{p.name}</h3>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleDelete(p.id)}><Trash className="h-3 w-3" /></Button>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="outline" className="text-xs font-normal">{p.category}</Badge>
                                        {p.size && <Badge variant="secondary" className="text-xs font-normal">Size: {p.size}</Badge>}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="font-bold text-slate-900">₹{p.price} <span className="text-xs font-normal text-slate-500">/ {p.unit}</span></p>
                                        <span className={`text-xs font-medium ${p.quantity < 10 ? 'text-orange-600' : 'text-slate-600'}`}>
                                            Qty: {p.quantity}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
