import React from 'react';
import type { Node, Edge } from 'reactflow';

interface JsonPreviewProps {
  nodes: Node[];
  edges: Edge[];
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ nodes, edges }) => (
  <details open className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-lg">
    <summary className="cursor-pointer font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors mb-3">
      📊 JSON Preview
    </summary>
    <pre className="text-xs text-gray-700 overflow-x-auto mt-3 p-4 bg-gray-100 rounded-lg border border-gray-300 font-mono">
      {JSON.stringify({ nodes, edges }, null, 2)}
    </pre>
  </details>
);

export default JsonPreview;
