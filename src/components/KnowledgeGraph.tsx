import React, { useState, useMemo } from 'react';
import { Network, Filter, ZoomIn, ZoomOut, RotateCcw, Info, Sparkles } from 'lucide-react';
import { UserQuestion, LearningPath, LearningUnit } from '../types';

interface KnowledgeGraphProps {
  questions: UserQuestion[];
  currentPath: LearningPath | null;
  onSelectUnit?: (unit: LearningUnit) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'question' | 'domain' | 'concept' | 'unit';
  x: number;
  y: number;
  data?: any;
}

interface GraphLink {
  source: string;
  target: string;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  questions,
  currentPath,
  onSelectUnit,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'question' | 'concept' | 'unit'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compute graph nodes and links deterministically
  const { nodes, links } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const linkList: GraphLink[] = [];

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Domain Nodes (Inner circle)
    const domains = Array.from(new Set(questions.map((q) => q.domain)));
    domains.forEach((domain, idx) => {
      const angle = (idx / (domains.length || 1)) * 2 * Math.PI;
      const radius = 120;
      nodeList.push({
        id: `domain_${domain}`,
        label: domain,
        type: 'domain',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        data: { domain },
      });
    });

    // 2. Question Nodes (Middle circle)
    questions.forEach((q, idx) => {
      const angle = (idx / (questions.length || 1)) * 2 * Math.PI + 0.3;
      const radius = 230;
      const nodeId = `q_${q.id}`;
      nodeList.push({
        id: nodeId,
        label: q.text.length > 32 ? q.text.slice(0, 32) + '...' : q.text,
        type: 'question',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        data: q,
      });

      // Link question to its domain
      linkList.push({
        source: nodeId,
        target: `domain_${q.domain}`,
      });

      // 3. Concepts from questions (Outer orbit)
      q.keyConcepts.forEach((concept, cIdx) => {
        const conceptId = `c_${concept.toLowerCase().replace(/\s+/g, '_')}`;
        if (!nodeList.some((n) => n.id === conceptId)) {
          const cAngle = angle + (cIdx - 1) * 0.18;
          const cRadius = 310;
          nodeList.push({
            id: conceptId,
            label: concept,
            type: 'concept',
            x: centerX + Math.cos(cAngle) * cRadius,
            y: centerY + Math.sin(cAngle) * cRadius,
            data: { concept, parentQuestion: q.text },
          });
        }
        linkList.push({
          source: nodeId,
          target: conceptId,
        });
      });
    });

    // 4. Curriculum Units from currentPath
    if (currentPath) {
      currentPath.units.forEach((unit, idx) => {
        const unitId = `unit_${unit.id}`;
        const uAngle = (idx / (currentPath.units.length || 1)) * 2 * Math.PI - 0.5;
        const uRadius = 175;
        nodeList.push({
          id: unitId,
          label: `Unit 0${unit.order}: ${unit.title}`,
          type: 'unit',
          x: centerX + Math.cos(uAngle) * uRadius,
          y: centerY + Math.sin(uAngle) * uRadius,
          data: unit,
        });

        // Link unit to corresponding question or domain
        const matchedQ = questions.find((q) => q.text === unit.sourceQuestionText);
        if (matchedQ) {
          linkList.push({
            source: unitId,
            target: `q_${matchedQ.id}`,
          });
        }
      });
    }

    return { nodes: nodeList, links: linkList };
  }, [questions, currentPath]);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'domain':
        return '#44403c'; // stone-700
      case 'question':
        return '#0284c7'; // sky-600
      case 'concept':
        return '#d97706'; // amber-600
      case 'unit':
        return '#059669'; // emerald-600
    }
  };

  const visibleNodes = nodes.filter(
    (n) => filterType === 'all' || n.type === filterType || n.type === 'domain'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-stone-900">
            Curiosity & Concept Web
          </h3>
          <p className="text-xs text-stone-500">
            Interactive visual network connecting your daily questions, knowledge domains, core mechanisms, and curriculum units.
          </p>
        </div>

        {/* Filters and Zoom Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('question')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'question' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setFilterType('concept')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'concept' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Concepts
            </button>
            <button
              onClick={() => setFilterType('unit')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'unit' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Units
            </button>
          </div>

          <div className="flex items-center border border-stone-200 bg-white rounded-lg p-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 text-stone-600 hover:text-stone-900"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-1 text-[10px] text-stone-400 hover:text-stone-700"
              title="Reset zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-1 text-stone-600 hover:text-stone-900"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* SVG Graph View */}
        <div className="lg:col-span-3 bg-white border border-stone-200/90 rounded-2xl p-4 overflow-hidden relative shadow-xs flex items-center justify-center min-h-[480px]">
          <svg
            viewBox="0 0 800 550"
            className="w-full h-auto max-h-[550px] transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Draw Links */}
            <g stroke="#e7e5e4" strokeWidth="1.2">
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToSelected =
                  selectedNode &&
                  (link.source === selectedNode.id || link.target === selectedNode.id);

                return (
                  <line
                    key={idx}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isConnectedToSelected ? '#d97706' : '#e7e5e4'}
                    strokeWidth={isConnectedToSelected ? 2 : 1}
                    strokeDasharray={isConnectedToSelected ? undefined : '2,2'}
                  />
                );
              })}
            </g>

            {/* Draw Nodes */}
            <g>
              {visibleNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = getNodeColor(node.type);

                let radius = 6;
                if (node.type === 'domain') radius = 9;
                else if (node.type === 'unit') radius = 8;
                else if (node.type === 'question') radius = 7;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedNode(node)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? radius + 4 : radius}
                      fill={nodeColor}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="hover:scale-125 transition-transform"
                    />

                    {/* Node Label */}
                    <text
                      x={node.x}
                      y={node.y + radius + 11}
                      textAnchor="middle"
                      fontSize={node.type === 'domain' ? '11' : '9'}
                      fontWeight={node.type === 'domain' || isSelected ? '600' : '400'}
                      fill={isSelected ? '#1c1917' : '#57534e'}
                      className="pointer-events-none select-none font-sans"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-3 text-[11px] text-stone-500 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700 inline-block" /> Domain
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Question
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Concept
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Unit
            </span>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {selectedNode.type} Node
                  </span>
                </div>
                <h4 className="text-base font-bold text-stone-900 leading-snug">
                  {selectedNode.label}
                </h4>
              </div>

              {selectedNode.type === 'question' && selectedNode.data && (
                <div className="space-y-3 text-xs">
                  <div className="bg-stone-50 rounded-lg p-3 space-y-1">
                    <span className="font-semibold text-stone-600">Quick Answer:</span>
                    <p className="text-stone-700 leading-relaxed">
                      {selectedNode.data.quickAnswer}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-stone-500">Domain: </span>
                    <span className="font-semibold text-stone-800">
                      {selectedNode.data.domain}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-stone-500">Key Concepts: </span>
                    <span className="text-stone-700">
                      {selectedNode.data.keyConcepts?.join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'unit' && selectedNode.data && (
                <div className="space-y-3 text-xs">
                  <p className="text-stone-600">{selectedNode.data.subtitle}</p>
                  <div className="bg-emerald-50 rounded-lg p-2.5 text-emerald-900 font-medium">
                    {selectedNode.data.estimatedMinutes} mins · {selectedNode.data.status}
                  </div>
                  {onSelectUnit && (
                    <button
                      onClick={() => onSelectUnit(selectedNode.data)}
                      className="w-full mt-2 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Open Lesson Studio
                    </button>
                  )}
                </div>
              )}

              {selectedNode.type === 'concept' && selectedNode.data && (
                <div className="text-xs space-y-2">
                  <p className="text-stone-600">
                    Identified from inquiry:
                  </p>
                  <p className="italic text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    "{selectedNode.data.parentQuestion}"
                  </p>
                </div>
              )}

              {selectedNode.type === 'domain' && (
                <div className="text-xs text-stone-600">
                  A central discipline anchoring multiple inquiries and cognitive models.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2 text-stone-400 my-auto">
              <Info className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-medium text-stone-600">Select any node on the graph</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Click questions, concepts, or learning units to inspect connections and mechanisms.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400">
            Nodes represent knowledge entities synthesized from your real inquiries.
          </div>
        </div>
      </div>
    </div>
  );
};
