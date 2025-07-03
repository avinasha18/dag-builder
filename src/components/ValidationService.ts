import type { Edge, Node } from 'reactflow';

export type DagValidationResult = {
  valid: boolean;
  reasons: string[];
};

export function validateDag(nodes: Node[], edges: Edge[]): DagValidationResult {
  const reasons: string[] = [];
  if (nodes.length < 2) reasons.push('At least 2 nodes required.');
  // Build adjacency list
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (!e.source || !e.target) return;
    if (e.source === e.target) reasons.push('Self-loops are not allowed.');
    const targets = adj[e.source];
    if (Array.isArray(targets)) {
      targets.push(e.target);
    }
  });
  // Check all nodes connected
  nodes.forEach((n) => {
    const connected = edges.some((e) => e.source === n.id || e.target === n.id);
    if (!connected) reasons.push(`Node "${n.data?.label || n.id}" is not connected.`);
  });
  // Cycle detection (DFS)
  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  function dfs(v: string): boolean {
    visited[v] = true;
    recStack[v] = true;
    const neighbors = adj[v];
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited[neighbor] && dfs(neighbor)) return true;
        else if (recStack[neighbor]) return true;
      }
    }
    recStack[v] = false;
    return false;
  }
  for (const n of nodes) {
    if (!visited[n.id] && dfs(n.id)) {
      reasons.push('Cycle detected.');
      break;
    }
  }
  return { valid: reasons.length === 0, reasons };
} 