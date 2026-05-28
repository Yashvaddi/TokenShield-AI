"use client";

import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Save, Plus, Workflow, Network, CheckCircle, Loader2 } from 'lucide-react';
import { useGetWorkflowsQuery, useSaveWorkflowMutation } from '@/store/apiSlice';

const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 250, y: 50 }, 
    data: { label: 'User Input' }, 
    type: 'input',
    style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px 20px' }
  },
  { 
    id: '2', 
    position: { x: 250, y: 150 }, 
    data: { label: 'PII Scrubbing Agent' },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #8b5cf6', borderRadius: '8px', padding: '10px 20px' }
  },
  { 
    id: '3', 
    position: { x: 250, y: 250 }, 
    data: { label: 'Claude 3 Opus (RAG)' },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981', borderRadius: '8px', padding: '10px 20px' }
  },
  { 
    id: '4', 
    position: { x: 250, y: 350 }, 
    data: { label: 'Client Output' }, 
    type: 'output',
    style: { background: '#1e293b', color: '#fff', border: '1px solid #f43f5e', borderRadius: '8px', padding: '10px 20px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#94a3b8' } },
];

function WorkflowBuilder() {
  const { data: remoteData, isLoading } = useGetWorkflowsQuery({});
  const [saveWorkflowToServer, { isLoading: isSaving }] = useSaveWorkflowMutation();
  
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { setViewport } = useReactFlow();

  // Load remote data once
  React.useEffect(() => {
    if (remoteData && remoteData.nodes?.length > 0) {
      setNodes(remoteData.nodes);
      setEdges(remoteData.edges || []);
      setTimeout(() => setViewport({ x: 0, y: 0, zoom: 1 }), 100); 
    }
  }, [remoteData, setViewport]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8' } }, eds)),
    []
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateSelectedNodeLabel = (newLabel: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = { ...n.data, label: newLabel };
          setSelectedNode(n); // Update the active selection
        }
        return n;
      })
    );
  };

  const handleSave = async () => {
    try {
      await saveWorkflowToServer({ nodes, edges }).unwrap();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save workflow", err);
    }
  };

  const addNode = (label: string, color: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label },
      style: { background: '#1e293b', color: '#fff', border: `1px solid ${color}`, borderRadius: '8px', padding: '10px 20px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  if (isLoading) return <div className="p-12 text-slate-400">Loading Workflow...</div>;

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen flex flex-col">
      <div className="absolute top-[10%] left-[40%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Workflow className="w-8 h-8 text-purple-400" />
            AI Agent Workflow Builder
          </h1>
          <p className="text-slate-400 text-sm">Design visual, multi-step LLM chains with built-in security gateways</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-slate-800 text-white border border-white/10 hover:bg-slate-700 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Pipeline'}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:bg-purple-500 transition">
            <Play className="w-4 h-4" />
            Deploy Pipeline
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 relative z-10 min-h-[600px]">
        <div className="flex-1 glass-card border border-white/10 rounded-xl overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            className="bg-slate-950"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="bg-slate-800 border-white/10 fill-white" />
            <Panel position="top-left" className="bg-slate-900/80 p-4 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                Toolbox
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => addNode('New AI Agent', '#3b82f6')} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-md transition border border-white/5">
                  <Plus className="w-4 h-4" /> Add Agent Node
                </button>
                <button onClick={() => addNode('Security Gateway', '#f43f5e')} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-md transition border border-white/5">
                  <Plus className="w-4 h-4" /> Add Security Gateway
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {selectedNode && (
          <aside className="w-80 glass-card p-6 border border-white/10 rounded-xl overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Node Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Node ID</label>
                <input 
                  type="text" 
                  value={selectedNode.id} 
                  disabled 
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded text-sm text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Label / Prompt</label>
                <textarea 
                  value={selectedNode.data.label as string}
                  onChange={(e) => updateSelectedNodeLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                />
              </div>
              <p className="text-xs text-slate-500 italic mt-4">
                In a full implementation, you can map tools, LLM models, API keys, and custom security rules to this node.
              </p>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

export default function WorkflowsPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}
