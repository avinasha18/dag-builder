import type { Edge, Node } from 'reactflow';
import dagre from 'dagre';
import { MarkerType } from 'reactflow';

const nodeWidth = 180;
const nodeHeight = 60;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length < 2) {
    return { nodes, edges };
  }

  // Create edges to form a valid DAG (linear flow)
  const newEdges: Edge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];
    if (sourceNode && targetNode) {
      newEdges.push({
        id: `edge-${sourceNode.id}-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: 'custom',
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
  }

  // Use dagre to layout the nodes
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  
  newEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id);
    return {
      ...node,
      type: 'custom',
      position: {
        x: nodeWithPos.x - nodeWidth / 2,
        y: nodeWithPos.y - nodeHeight / 2,
      },
      positionAbsolute: undefined,
    };
  });

  return { nodes: layoutedNodes, edges: newEdges };
} 