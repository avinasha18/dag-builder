import type { Edge, Node } from 'reactflow';
import dagre from 'dagre';

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
    newEdges.push({
      id: `edge-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'custom',
      markerEnd: { type: 'arrowclosed' },
    });
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