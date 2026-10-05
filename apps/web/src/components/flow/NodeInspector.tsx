import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function NodeInspector({ selectedNode, setNodes }: { selectedNode: any, setNodes: any }) {
    const [data, setData] = useState(selectedNode?.data || {});
    const [apiVariables, setApiVariables] = useState<any[]>([]);

    useEffect(() => {
        setData(selectedNode?.data || {});
        // Fetch variables for dropdowns
        import("@/lib/api").then(mod => {
            mod.default.get("/api/variables").then(res => setApiVariables(res.data)).catch(err => console.error(err));
        });
    }, [selectedNode]);

    if (!selectedNode) {
        return (
            <aside className="w-80 bg-white border-l p-6 flex flex-col justify-center items-center text-center text-slate-500">
                <p>Select a node to edit properties</p>
            </aside>
        );
    }

    const handleChange = (key: string, value: string) => {
        const newData = { ...data, [key]: value };
        setData(newData);
        setNodes((nds: any[]) =>
            nds.map((n) => (n.id === selectedNode.id ? { ...n, data: newData } : n))
        );
    };

    const handleDelete = () => {
        setNodes((nds: any[]) => nds.filter((n) => n.id !== selectedNode.id));
    };

    return (
        <aside className="w-80 bg-white border-l flex flex-col h-full">
            <CardHeader className="border-b bg-slate-50 py-4">
                <h3 className="font-semibold text-sm uppercase text-slate-500">Properties</h3>
                <p className="font-bold text-slate-800">{selectedNode.type} Node</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Generic Label Field */}
                <div className="space-y-2">
                    <Label>Internal Label</Label>
                    <Input
                        value={data.label || ""}
                        onChange={(e) => handleChange("label", e.target.value)}
                    />
                </div>

                {/* Message Content (Specific to Message Node) */}
                {selectedNode.type === 'MESSAGE' && (
                    <div className="space-y-2">
                        <Label>Message Mode</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.mode || "STATIC"}
                            onChange={(e) => handleChange("mode", e.target.value)}
                        >
                            <option value="STATIC">Static Text</option>
                            <option value="DYNAMIC">Dynamic Data (Loop)</option>
                        </select>

                        {data.mode === 'DYNAMIC' ? (
                            <>
                                <Label className="mt-2">Data Source</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.dataSource || "PRODUCTS"}
                                    onChange={(e) => handleChange("dataSource", e.target.value)}
                                >
                                    <option value="PRODUCTS">Products</option>
                                </select>

                                <Label className="mt-2 text-xs text-slate-500">Item Template</Label>
                                <Textarea
                                    className="min-h-[80px] font-mono text-xs"
                                    value={data.template || "{{name}} - {{price}}"}
                                    onChange={(e) => handleChange("template", e.target.value)}
                                    placeholder="{{name}} - {{price}}"
                                />
                                <p className="text-[10px] text-slate-400">Vars: {'{{name}}, {{price}}, {{description}}, {{unit}}'}</p>

                                <div className="flex gap-4 mt-2">
                                    <div className="flex-1">
                                        <Label className="text-xs">Limit</Label>
                                        <Input
                                            type="number"
                                            value={data.limit || 5}
                                            onChange={(e) => handleChange("limit", String(parseInt(e.target.value) || 5))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={data.sendImage === true || data.sendImage === 'true'}
                                            onChange={(e) => handleChange("sendImage", String(e.target.checked))}
                                            id="chk_img"
                                        />
                                        <Label htmlFor="chk_img" className="!mt-0">Send Image</Label>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Label className="mt-2">Message Content</Label>
                                <Textarea
                                    className="min-h-[100px]"
                                    value={data.content || ""}
                                    onChange={(e) => handleChange("content", e.target.value)}
                                    placeholder="Type your WhatsApp message..."
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Question Content */}
                {selectedNode.type === 'QUESTION' && (
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                            value={data.question || ""}
                            onChange={(e) => handleChange("question", e.target.value)}
                        />
                        <Label className="mt-4 block">Variable Key</Label>
                        <Input
                            value={data.key || ""}
                            onChange={(e) => handleChange("key", e.target.value)}
                            placeholder="e.g. user_email"
                        />
                        <Label className="mt-4 block">Expected Format</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                            value={data.inputType || "text"}
                            onChange={(e) => handleChange("inputType", e.target.value)}
                        >
                            <option value="text">All Text</option>
                            <option value="number">Number Only</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone Number</option>
                        </select>
                    </div>
                )}

                {/* CONDITION NODE */}
                {selectedNode.type === 'CONDITION' && (
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase text-slate-500">Condition Builder</Label>

                        <div className="space-y-2">
                            <Label>Variable</Label>
                            <Input
                                placeholder="e.g. cart.total"
                                value={data._tempVar || ""}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    const op = data._tempOp || "==";
                                    const val = data._tempVal || "";
                                    const expr = `{{${v}}} ${op} '${val}'`;
                                    // Update both temp state and actual expression
                                    // This is a bit hacky, normally we'd parse the expression back
                                    const newData = { ...data, _tempVar: v, expression: expr };
                                    setData(newData); // Local update
                                    // To allow direct typing, we might just expose expression too
                                    handleChange("expression", expr);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Operator</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                value={data._tempOp || "=="}
                                onChange={(e) => {
                                    const op = e.target.value;
                                    const v = data._tempVar || "";
                                    const val = data._tempVal || "";
                                    const expr = `{{${v}}} ${op} '${val}'`;
                                    handleChange("expression", expr);
                                    // Hack: Save temp op
                                    const newData = { ...data, _tempOp: op };
                                    setData(newData);
                                }}
                            >
                                <option value="==">Equals (==)</option>
                                <option value="!=">Not Equals (!=)</option>
                                <option value=">">Greater Than (&gt;)</option>
                                <option value="<">Less Than (&lt;)</option>
                                <option value="contains">Contains</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                                placeholder="e.g. 100 or 'Yes'"
                                value={data._tempVal || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const v = data._tempVar || "";
                                    const op = data._tempOp || "==";
                                    const expr = `{{${v}}} ${op} '${val}'`;
                                    handleChange("expression", expr);
                                    const newData = { ...data, _tempVal: val };
                                    setData(newData);
                                }}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="text-xs text-slate-500">Generated Expression</Label>
                            <div className="bg-slate-100 p-2 rounded text-xs font-mono break-all">
                                {data.expression || "No expression"}
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTION NODE */}
                {selectedNode.type === 'ACTION' && (
                    <div className="space-y-4">
                        <Label>Action Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                            value={data.action || "HANDOFF_TO_AGENT"}
                            onChange={(e) => handleChange("action", e.target.value)}
                        >
                            <option value="HANDOFF_TO_AGENT">👤 Handoff to Agent</option>
                            <option value="ADD_TO_CART">🛒 Add to Cart</option>
                            <option value="NOTIFY_ADMIN">🔔 Notify Admin</option>
                            <option value="API_REQUEST">🌐 API Request (Webhook)</option>
                        </select>

                        {data.action === 'NOTIFY_ADMIN' && (
                            <div className="space-y-2">
                                <Label>Notification Message</Label>
                                <Textarea
                                    placeholder="e.g. New high value lead!"
                                    value={data.payload?.message || ""}
                                    onChange={(e) => {
                                        const newPayload = { ...data.payload, message: e.target.value };
                                        // Need to handle nested object updates - JSON hack for now or direct obj
                                        // Node flow usually saves flat config, execute flow parses it.
                                        // But here we are editing `data` object which is node.data
                                        // Let's store payload as object in data
                                        const newData = { ...data, payload: newPayload };
                                        setData(newData);
                                        // We need to propagate to parent
                                        // handleChange only handles top level strings usually?
                                        // Check definition of handleChange:
                                        // const handleChange = (key: string, value: string) => ... value is typed string but used as any?
                                        // Wait, handleChange signature was (key: string, value: string). We need any.
                                        // Let's rely on setNodes directly or fix handleChange signature?
                                        // handleChange is local. 
                                        setNodes((nds: any[]) =>
                                            nds.map((n) => (n.id === selectedNode.id ? { ...n, data: newData } : n))
                                        );
                                    }}
                                />
                            </div>
                        )}

                        {data.action === 'API_REQUEST' && (
                            <div className="space-y-2">
                                <Label>API URL</Label>
                                <Input
                                    placeholder="https://api.example.com/webhook"
                                    value={data.payload?.url || ""}
                                    onChange={(e) => {
                                        const newPayload = { ...data.payload, url: e.target.value };
                                        const newData = { ...data, payload: newPayload };
                                        setData(newData);
                                        setNodes((nds: any[]) =>
                                            nds.map((n) => (n.id === selectedNode.id ? { ...n, data: newData } : n))
                                        );
                                    }}
                                />
                                <Label>Method</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                    value={data.payload?.method || "POST"}
                                    onChange={(e) => {
                                        const newPayload = { ...data.payload, method: e.target.value };
                                        const newData = { ...data, payload: newPayload };
                                        setData(newData);
                                        setNodes((nds: any[]) =>
                                            nds.map((n) => (n.id === selectedNode.id ? { ...n, data: newData } : n))
                                        );
                                    }}
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <div className="p-4 border-t bg-slate-50">
                <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Node
                </Button>
            </div>
        </aside >
    );
}
