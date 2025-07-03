import React from 'react';
import { FaPlus, FaProjectDiagram, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { DagValidationResult } from './ValidationService';

interface ControlsProps {
  onOpenModal: () => void;
  onAutoLayout: () => void;
  onDeleteSelected: () => void;
  validation: DagValidationResult;
  hasSelection: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  onOpenModal, 
  onAutoLayout, 
  onDeleteSelected, 
  validation, 
  hasSelection 
}) => (
  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-white to-slate-50 shadow-lg rounded-xl border border-slate-200 mb-4">
    <button
      title="Add Node"
      onClick={onOpenModal}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
    >
      <FaPlus className="text-sm" /> Add Node
    </button>
    <button
      title="Auto Layout"
      onClick={onAutoLayout}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
    >
      <FaProjectDiagram className="text-sm" /> Auto Layout
    </button>
    <button
      title="Delete Selected (or press Delete key)"
      onClick={onDeleteSelected}
      disabled={!hasSelection}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md transform font-medium ${
        hasSelection 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105' 
          : 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-500 cursor-not-allowed'
      }`}
    >
      <FaTrash className="text-sm" /> Delete Selected
    </button>
    
    {/* Enhanced Validation Status */}
    <div className="ml-auto">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-md border transition-all duration-200 ${
        validation.valid 
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800' 
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
      }`}>
        <div className={`flex items-center gap-2 ${validation.valid ? 'text-emerald-600' : 'text-red-600'}`}>
          {validation.valid ? (
            <FaCheckCircle className="text-lg" />
          ) : (
            <FaExclamationTriangle className="text-lg" />
          )}
          <span className="font-semibold text-sm">
            {validation.valid ? 'Valid DAG' : 'Invalid DAG'}
          </span>
        </div>
        
        {validation.reasons.length > 0 && (
          <div className="border-l border-current/20 pl-3">
            <div className="text-xs font-medium opacity-90 leading-relaxed max-w-xs">
              {validation.reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-[10px] mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Controls; 