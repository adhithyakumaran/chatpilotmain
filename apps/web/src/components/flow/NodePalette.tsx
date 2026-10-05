import { MessageSquare, HelpCircle, GitFork, Zap, Clock, StopCircle, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function NodePalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const items = [
        { type: 'START', label: 'Start Flow', icon: PlayCircle, color: 'text-indigo-600' },
        { type: 'MESSAGE', label: 'Send Message', icon: MessageSquare, color: 'text-blue-600' },
        { type: 'QUESTION', label: 'Ask Question', icon: HelpCircle, color: 'text-purple-600' },
        { type: 'CONDITION', label: 'Condition', icon: GitFork, color: 'text-orange-600' },
        { type: 'ACTION', label: 'Action', icon: Zap, color: 'text-green-600' },
        { type: 'DELAY', label: 'Delay', icon: Clock, color: 'text-yellow-600' },
        { type: 'END', label: 'End Flow', icon: StopCircle, color: 'text-red-600' },
    ];

    return (
        <aside className="w-64 bg-white border-l p-4 flex flex-col gap-4">
            <div className="text-sm font-semibold text-slate-900">Components</div>
            <div className="grid gap-3">
                {items.map((item) => (
                    <div
                        key={item.type}
                        onDragStart={(event) => onDragStart(event, item.type)}
                        draggable
                        className="flex items-center gap-3 p-3 bg-slate-50 border rounded-lg cursor-grab hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto text-xs text-slate-400">
                Drag components to the canvas
            </div>
        </aside>
    );
}
