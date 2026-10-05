"use client";

import { useState, useCallback, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider,
    Panel,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

// Components
import NodePalette from './NodePalette';
import NodeInspector from './NodeInspector';
import MessageNode from '@/components/flow/nodes/MessageNode';

const nodeTypes = {
    MESSAGE: MessageNode,
    // Add other types mapping to default node or custom
};

const initialNodes: any[] = [];
const initialEdges: any[] = [];

let id = 1;
const getId = () => `node_${id++}`;

export default function FlowBuilder({
    initialData,
    onSave
}: {
    initialData?: { nodes: any[], edges: any[] },
    onSave: (nodes: any[], edges: any[]) => Promise<void>
}) {
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || initialEdges);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Initialize ID counter based on existing nodes
    if (initialData?.nodes?.length && id === 1) {
        const maxId = initialData.nodes.reduce((acc, n) => {
            const num = parseInt(n.id.replace('node_', ''));
            return !isNaN(num) && num > acc ? num : acc;
        }, 0);
        id = maxId + 1;
    }

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} Node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await onSave(nodes, edges);
        setSaving(false);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-white">
                <h2 className="font-semibold text-lg">Flow Builder</h2>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Flow
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Palette */}
                <NodePalette />

                {/* Canvas */}
                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-slate-50"
                    >
                        <Background color="#ccc" gap={20} />
                        <Controls />
                    </ReactFlow>
                </div>

                {/* Inspector */}
                {selectedNode && (
                    <NodeInspector selectedNode={selectedNode} setNodes={setNodes} />
                )}
            </div>
        </div>
    );
}
