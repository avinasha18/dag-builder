import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow';

const CustomEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate direction for better arrow positioning
  const isHorizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
  const isRightToLeft = targetX < sourceX;
  const isTopToBottom = targetY > sourceY;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: selected ? '#8b5cf6' : '#9ca3af',
          strokeWidth: 3,
          filter: selected ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.3))' : undefined,
        }}
      />
      
      {/* Multiple direction arrows along the path */}
      <EdgeLabelRenderer>
        {/* Main direction arrow */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 14,
            pointerEvents: 'all',
          }}
          className={`
            px-3 py-1 rounded-full text-white font-bold text-sm
            ${selected 
              ? 'bg-purple-500 shadow-lg' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            transition-all duration-200
          `}
        >
          {isHorizontal ? (isRightToLeft ? '←' : '→') : (isTopToBottom ? '↓' : '↑')}
        </div>
        
        {/* Secondary arrow for longer edges */}
        {Math.abs(targetX - sourceX) > 200 || Math.abs(targetY - sourceY) > 100 ? (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
              fontSize: 12,
              pointerEvents: 'none',
            }}
            className={`
              px-2 py-1 rounded-full text-white font-medium text-xs
              ${selected 
                ? 'bg-purple-400 shadow-md' 
                : 'bg-gray-400'
              }
              transition-all duration-200
            `}
          >
            {isHorizontal ? (isRightToLeft ? '←' : '→') : (isTopToBottom ? '↓' : '↑')}
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge; 