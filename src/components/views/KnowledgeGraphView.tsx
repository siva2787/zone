import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { Concept } from '../../types.ts';

interface GraphNode {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  masteryScore: number;
  status: 'Mastered' | 'Learning' | 'Gap' | 'Not Learned';
  x: number;
  y: number;
}

interface KnowledgeGraphViewProps {
  onSelectConcept: (conceptId: string) => void;
  onNavigateTutor: (params: any) => void;
  onNavigateAssessment: (conceptId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  onSelectConcept,
  onNavigateTutor,
  onNavigateAssessment,
}) => {
  // Graph nodes with coordinates matching the reference concept topology
  const [nodes] = useState<GraphNode[]>([
    {
      id: 'c_prob',
      name: 'Probability Foundations',
      description: 'Sample space, events, classical and empirical probability axioms.',
      difficulty: 'Easy',
      masteryScore: 85,
      status: 'Mastered',
      x: 120,
      y: 180,
    },
    {
      id: 'c_rand_vars',
      name: 'Random Variables',
      description: 'Discrete and continuous random variables, probability mass and density functions.',
      difficulty: 'Medium',
      masteryScore: 78,
      status: 'Mastered',
      x: 290,
      y: 110,
    },
    {
      id: 'c_cond_prob',
      name: 'Conditional Probability',
      description: 'Joint probability, conditional events P(A|B), independence, multiplication rule.',
      difficulty: 'Medium',
      masteryScore: 45,
      status: 'Gap', // Prerequisite bottleneck!
      x: 290,
      y: 250,
    },
    {
      id: 'c_distr',
      name: 'Probability Distributions',
      description: 'Bernoulli, Binomial, Poisson, and Normal Gaussian distributions.',
      difficulty: 'Medium',
      masteryScore: 68,
      status: 'Learning',
      x: 480,
      y: 110,
    },
    {
      id: 'c_bayes',
      name: 'Bayes Theorem',
      description: 'Prior, posterior, likelihood, evidence, and Bayes update rule.',
      difficulty: 'Medium',
      masteryScore: 38,
      status: 'Gap', // Target Gap from reference!
      x: 480,
      y: 250,
    },
    {
      id: 'c_naive_bayes',
      name: 'Naive Bayes Classifier',
      description: 'Conditional independence assumption, text classification, spam filtering.',
      difficulty: 'Hard',
      masteryScore: 30,
      status: 'Learning',
      x: 670,
      y: 180,
    },
    {
      id: 'c_classif',
      name: 'Classification Metrics',
      description: 'Confusion matrix, precision, recall, F1-score, ROC-AUC.',
      difficulty: 'Hard',
      masteryScore: 20,
      status: 'Not Learned',
      x: 840,
      y: 130,
    },
    {
      id: 'c_eval',
      name: 'Model Evaluation',
      description: 'Cross-validation, bias-variance tradeoff, hyperparameter tuning.',
      difficulty: 'Hard',
      masteryScore: 10,
      status: 'Not Learned',
      x: 840,
      y: 250,
    },
  ]);

  // Directed prerequisite links
  const links = [
    { from: 'c_prob', to: 'c_rand_vars' },
    { from: 'c_prob', to: 'c_cond_prob' },
    { from: 'c_rand_vars', to: 'c_distr' },
    { from: 'c_cond_prob', to: 'c_bayes' },
    { from: 'c_distr', to: 'c_naive_bayes' },
    { from: 'c_bayes', to: 'c_naive_bayes' },
    { from: 'c_naive_bayes', to: 'c_classif' },
    { from: 'c_naive_bayes', to: 'c_eval' },
  ];

  const [selectedNodeId, setSelectedNodeId] = useState<string>('c_bayes');
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[4];

  const getNodeColor = (status: GraphNode['status']) => {
    switch (status) {
      case 'Mastered':
        return {
          fill: '#10b981',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800',
        };
      case 'Learning':
        return {
          fill: '#6366f1',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-300',
          badge: 'bg-indigo-100 text-indigo-800',
        };
      case 'Gap':
        return {
          fill: '#f43f5e',
          bg: 'bg-rose-50 text-rose-700 border-rose-400 ring-2 ring-rose-400/30',
          badge: 'bg-rose-100 text-rose-800',
        };
      default:
        return {
          fill: '#94a3b8',
          bg: 'bg-slate-50 text-slate-600 border-slate-300',
          badge: 'bg-slate-100 text-slate-700',
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Prerequisite Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Graph
          </h1>
          <p className="text-xs text-slate-500">
            Visualizing dependency pathways and cognitive gaps in Machine Learning.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700">Mastered (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span className="text-slate-700">Learning (50-74%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-300" />
            <span className="text-rose-600 font-bold">Knowledge Gap (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-400">Not Learned</span>
          </div>
        </div>
      </div>

      {/* Graph Area & Node Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs text-slate-500">
            <span>Subject: <strong>Machine Learning Foundations</strong></span>
            <span className="text-[11px] text-indigo-600 font-semibold">Click any concept node to inspect</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 960 380"
              className="w-full min-w-[700px] h-[360px] select-none"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
                </marker>
                <marker
                  id="arrow-gap"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Edge Links */}
              {links.map((link, idx) => {
                const source = nodes.find((n) => n.id === link.from)!;
                const target = nodes.find((n) => n.id === link.to)!;
                const isGapPath =
                  (source.status === 'Gap' && target.status === 'Gap') ||
                  (source.id === 'c_cond_prob' && target.id === 'c_bayes');

                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isGapPath ? '#f43f5e' : '#cbd5e1'}
                      strokeWidth={isGapPath ? 3 : 2}
                      strokeDasharray={isGapPath ? '4,4' : undefined}
                      markerEnd={isGapPath ? 'url(#arrow-gap)' : 'url(#arrow)'}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const colors = getNodeColor(node.status);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-transform group"
                  >
                    {/* Pulsing ring if gap or selected */}
                    {(node.status === 'Gap' || isSelected) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 36 : 30}
                        fill={node.status === 'Gap' ? '#f43f5e' : '#6366f1'}
                        opacity={node.status === 'Gap' ? '0.2' : '0.15'}
                        className="animate-pulse"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="white"
                      stroke={colors.fill}
                      strokeWidth={isSelected ? 4 : 3}
                    />

                    {/* Mastery score inside circle */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {node.masteryScore}%
                    </text>

                    {/* Label below node */}
                    <text
                      x={node.x}
                      y={node.y + 42}
                      textAnchor="middle"
                      fill={isSelected ? '#4338ca' : '#334155'}
                      fontSize="11"
                      fontWeight={isSelected ? 'bold' : '600'}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <strong>Prerequisite Insight:</strong> Conditional Probability (45%) is causing the bottleneck in Bayes Theorem (38%).
            </span>
            <button
              onClick={() => setSelectedNodeId('c_bayes')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Focus Bayes Theorem
            </button>
          </div>
        </div>

        {/* Right Drawer: Concept Node Details (Screen 8 from Reference) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getNodeColor(selectedNode.status).badge}`}>
                Status: {selectedNode.status}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Difficulty: {selectedNode.difficulty}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{selectedNode.name}</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Calculated Concept Mastery</span>
              <span className="text-slate-900 font-extrabold">{selectedNode.masteryScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${selectedNode.masteryScore >= 75
                    ? 'bg-emerald-500'
                    : selectedNode.masteryScore >= 50
                      ? 'bg-indigo-600'
                      : 'bg-rose-500'
                  }`}
                style={{ width: `${selectedNode.masteryScore}%` }}
              />
            </div>
          </div>

          {selectedNode.id === 'c_bayes' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Prerequisite Knowledge Gap</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800">
                Your twin detected that mastery in <strong>Conditional Probability</strong> is currently 45%. You must reinforce conditional distributions to master Bayes Theorem.
              </p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={() =>
                onNavigateTutor({
                  conceptId: selectedNode.id,
                  conceptName: selectedNode.name,
                  masteryScore: selectedNode.masteryScore,
                  detectedGap: selectedNode.description,
                  initialPrompt: `Can you explain ${selectedNode.name} in detail and show how it connects to its prerequisites in the machine learning knowledge graph?`,
                })
              }
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor about {selectedNode.name}</span>
            </button>

            <button
              onClick={() => onNavigateAssessment(selectedNode.id)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all text-center"
            >
              Take Practice Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};