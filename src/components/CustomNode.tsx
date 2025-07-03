import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { FaStickyNote } from 'react-icons/fa';

interface CustomNodeData {
  label: string;
  id: string;
  note?: string;
  onNoteClick?: () => void;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  return (
    <div 
      className={`
        relative px-3 py-2 shadow-sm rounded-lg border-2 transition-all duration-200 min-w-[120px] max-w-[160px]
        ${selected 
          ? 'border-purple-400 shadow-lg bg-gradient-to-br from-purple-50 to-white' 
          : 'border-slate-300 hover:border-slate-400 bg-gradient-to-br from-slate-50 to-white hover:shadow-md'
        }
        hover:scale-[1.02] transform
      `}
    >
      {/* Incoming handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md hover:scale-110 transition-transform"
      />
      
      {/* Node content */}
      <div className="text-center mb-1">
        {/* Main label */}
        <div className={`font-bold text-xs leading-tight ${selected ? 'text-purple-700' : 'text-slate-800'}`}>
          {data.label}
        </div>
        
        {/* Node ID */}
        <div className="text-[9px] text-slate-500 font-mono tracking-wide mb-1">
          {data.id}
        </div>
        
        {/* Note indicator */}
        {data.note && (
          <div className="inline-flex items-center gap-1 px-1 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-medium border border-blue-200">
            <FaStickyNote className="text-[9px]" />
            <span>Note</span>
          </div>
        )}
      </div>
      
      {/* Note button - positioned at bottom center */}
      <div className="flex justify-center mb-2">
        <button
          onClick={data.onNoteClick}
          className={`
            flex items-center gap-1 px-1.5 py-0.5 rounded transition-all duration-200 shadow-sm
            ${data.note 
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 border border-blue-200' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 hover:scale-105 border border-slate-200'
            }
          `}
          title={data.note ? "Edit note" : "Add note"}
        >
          <FaStickyNote className="text-[9px]" />
          <span className="text-[9px] font-medium">{data.note ? "Edit" : "Add"}</span>
        </button>
      </div>
      
      {/* Outgoing handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-md hover:scale-110 transition-transform"
      />
      
      {/* Direction indicators - at bottom with smaller font */}
      <div className="absolute bottom-0.5 left-1.5 text-[7px] text-blue-600 font-semibold opacity-80 uppercase tracking-wide bg-white/90 px-0.5 py-0.5 rounded border border-blue-200">in</div>
      <div className="absolute bottom-0.5 right-1.5 text-[7px] text-green-600 font-semibold opacity-80 uppercase tracking-wide bg-white/90 px-0.5 py-0.5 rounded border border-green-200">out</div>
    </div>
  );
};

export default CustomNode; 