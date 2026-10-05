import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MessageNode({ data }: { data: { label: string, content?: string } }) {
    return (
        <Card className="min-w-[250px] border-slate-200 shadow-sm">
            <Handle type="target" position={Position.Top} className="!bg-slate-400" />

            <CardHeader className="p-3 bg-blue-50 border-b border-blue-100 rounded-t-lg flex flex-row items-center gap-2 space-y-0">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm">Send Message</span>
            </CardHeader>

            <CardContent className="p-3 text-sm text-slate-600">
                {data.content || data.label || "Enter message..."}
            </CardContent>

            <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
        </Card>
    );
}
