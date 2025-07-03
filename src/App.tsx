import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls as FlowControls,
  MiniMap,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  type ReactFlowInstance,
  ConnectionLineType,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Controls from './components/Controls';
import JsonPreview from './components/JsonPreview';
import AddNodeModal from './components/AddNodeModal';
import NoteModal from './components/NoteModal';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import { validateDag, type DagValidationResult } from './components/ValidationService';
import { getLayoutedElements } from './components/AutoLayoutService';

const getId = (() => {
  let id = 0;
  return () => `node_${id++}`;
})();

// Register custom node and edge types
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: getId(),
    type: 'custom',
    data: { 
      label: 'Node 1',
      id: 'node_0',
      note: ''
    },
    position: { x: 0, y: 0 },
  },
  {
    id: getId(),
    type: 'custom',
    data: { 
      label: 'Node 2',
      id: 'node_1',
      note: ''
    },
    position: { x: 250, y: 0 },
  },
];
const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [validation, setValidation] = useState<DagValidationResult>({ valid: false, reasons: ['At least 2 nodes required.'] });
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  // Helper function to check for cycles
  const checkForCycle = useCallback((sourceId: string, targetId: string, currentEdges: Edge[]): boolean => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recStack.add(nodeId);
      
      // Check if this would create a direct cycle
      if (nodeId === targetId) {
        const wouldCreateDirectCycle = currentEdges.some(edge => 
          edge.source === targetId && edge.target === sourceId
        );
        if (wouldCreateDirectCycle) return true;
      }
      
      // Check existing connections from this node
      const outgoingEdges = currentEdges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) return true;
      }
      
      recStack.delete(nodeId);
      return false;
    };
    
    return dfs(sourceId);
  }, []);

  // Node/Edge Change Handlers
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    
    // Check if any nodes are selected
    const hasSelectedNodes = changes.some(change => 
      change.type === 'select' && change.selected
    ) || nodes.some(node => node.selected);
    
    setHasSelection(hasSelectedNodes);
  }, [nodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    
    // Check if any edges are selected
    const hasSelectedEdges = changes.some(change => 
      change.type === 'select' && change.selected
    ) || edges.some(edge => edge.selected);
    
    setHasSelection(hasSelectedEdges);
  }, [edges]);

  // Add Node
  const handleAddNode = useCallback((label: string) => {
    const nodeId = getId();
    const newNode: Node = {
      id: nodeId,
      type: 'custom',
      data: { 
        label,
        id: nodeId,
        note: ''
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Note functionality
  const handleNoteClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsNoteModalOpen(true);
  }, []);

  const handleSaveNote = useCallback((note: string) => {
    if (selectedNodeId) {
      setNodes((nds) => nds.map(node => 
        node.id === selectedNodeId 
          ? { ...node, data: { ...node.data, note } }
          : node
      ));
    }
  }, [selectedNodeId]);

  // Delete Selected Elements
  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected && !nodes.find((n) => n.selected && (e.source === n.id || e.target === n.id))));
    setHasSelection(false);
  }, [nodes]);

  // Connect (Edge Creation) - Enhanced robust logic
  const onConnect: OnConnect = useCallback((params: Connection) => {
    // Validate connection parameters
    if (!params.source || !params.target) {
      console.log('Invalid connection: missing source or target');
      return;
    }
    
    // Prevent self-loops
    if (params.source === params.target) {
      console.log('Invalid connection: self-loop detected');
      return;
    }
    
    // Check if nodes exist
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) {
      console.log('Invalid connection: source or target node not found');
      return;
    }
    
    // Create a unique edge ID
    const edgeId = `edge-${params.source}-${params.target}`;
    
    // Check if edge already exists (prevent duplicates)
    const edgeExists = edges.some(edge => 
      edge.source === params.source && edge.target === params.target
    );
    
    if (edgeExists) {
      console.log('Invalid connection: edge already exists');
      return;
    }
    
    // Check for cycles (basic cycle detection)
    const wouldCreateCycle = checkForCycle(params.source, params.target, edges);
    if (wouldCreateCycle) {
      console.log('Invalid connection: would create cycle');
      return;
    }
    
    // Create the edge
    const newEdge: Edge = {
      id: edgeId,
      source: params.source!,
      target: params.target!,
      type: 'custom',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 3 },
      data: {
        sourceLabel: sourceNode.data?.label || params.source,
        targetLabel: targetNode.data?.label || params.target,
      }
    };
    
    setEdges((eds) => [...eds, newEdge]);
    console.log(`Connection created: ${params.source} → ${params.target}`);
  }, [nodes, edges, checkForCycle]);

  // Delete with Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected]);

  // DAG Validation
  useEffect(() => {
    setValidation(validateDag(nodes, edges));
  }, [nodes, edges]);

  // Auto Layout
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: newEdges } = getLayoutedElements(nodes, edges, 'LR');
    setNodes(layoutedNodes);
    setEdges(newEdges);
    setTimeout(() => {
      if (rfInstance) rfInstance.fitView();
    }, 100);
  }, [nodes, edges, rfInstance]);

  // ReactFlow Instance
  const onInit = useCallback((instance: ReactFlowInstance) => setRfInstance(instance), []);

  // Update nodes with note click handlers
  const nodesWithHandlers = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onNoteClick: () => handleNoteClick(node.id)
    }
  }));

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <ReactFlowProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center">
        <div className="w-full max-w-6xl mt-6">
          <Controls 
            onOpenModal={() => setIsModalOpen(true)}
            onAutoLayout={handleAutoLayout}
            onDeleteSelected={handleDeleteSelected}
            validation={validation}
            hasSelection={hasSelection}
          />
          <div className="h-[600px] bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <ReactFlow
              nodes={nodesWithHandlers}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              onInit={onInit}
              proOptions={{ hideAttribution: true }}
              connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3 }}
              connectionLineType={ConnectionLineType.SmoothStep}
              snapToGrid={true}
              snapGrid={[15, 15]}
              connectionMode={ConnectionMode.Loose}
              deleteKeyCode="Delete"
              multiSelectionKeyCode="Shift"
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnScroll={false}
              preventScrolling={true}
            >
              <MiniMap />
              <FlowControls />
              <Background variant={BackgroundVariant.Dots} gap={25} size={1.5} color="#cbd5e1" />
            </ReactFlow>
          </div>
          <JsonPreview nodes={nodes} edges={edges} />
        </div>
        <AddNodeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddNode={handleAddNode}
        />
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSave={handleSaveNote}
          initialNote={selectedNode?.data?.note || ''}
          nodeLabel={selectedNode?.data?.label || ''}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
