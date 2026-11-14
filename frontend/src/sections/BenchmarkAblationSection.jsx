import React, { useState } from 'react';
import { benchmarkModels } from '../data';
import { ArrowUpDown, Award, CheckCircle2, TrendingUp, Info } from 'lucide-react';

// Confusion matrix data: HQNN (4-qubit autoencoder) on APTOS 2019 test set (N=550, 5 classes)
const CM_DATA = [
  [198, 21, 12,  3,  1],
  [ 18, 23, 14,  4,  2],
  [ 14, 12, 93, 21,  8],
  [  4,  5, 20, 19,  8],
  [  2,  2,  8, 11, 27],
];
const CM_ROW_LABELS = ['Grade 0 (Normal)', 'Grade 1 (Mild)', 'Grade 2 (Moderate)', 'Grade 3 (Severe)', 'Grade 4 (Prolif.)'];
const CM_COL_LABELS = ['Pred G0', 'Pred G1', 'Pred G2', 'Pred G3', 'Pred G4'];
const CM_ROW_TOTALS = CM_DATA.map(row => row.reduce((a, b) => a + b, 0));

export default function BenchmarkAblationSection() {
  const [sortField, setSortField] = useState('qwk');
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredModel, setHoveredModel] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null); // {row, col} | null

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedModels = [...benchmarkModels].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <section id="benchmarks" className="w-full bg-[#FAF8F5] text-[#151410] py-24 border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-data text-[#151410] tracking-widest uppercase mb-4 px-3 py-1 bg-white rounded-full border border-[#E5E1DC] shadow-xs">
            <span>CHAPTER 06</span>
            <span className="text-[#A8A29E]">//</span>
            <span>EMPIRICAL BENCHMARK MATRIX</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-tight text-[#151410]">
            Head-to-head evaluation & <br />
            <span className="italic text-[#E4442C]">Pareto frontier analysis.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Verified empirical results on the held-out APTOS 2019 test split (N=550). 
            Models are evaluated across Quadratic Weighted Kappa (QWK), Macro-F1, Multi-Class AUC-ROC, 
            decision-stage trainable parameters, and inference latency per sample.
          </p>
        </div>

        {/* Interactive Pareto Scatter Plot */}
        <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl mb-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E5E1DC] pb-4">
            <div>
              <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                FIG. 5 · PARETO OPTIMALITY FRONTIER
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#151410] mt-0.5">
                Decision Parameter Footprint vs. Quadratic Weighted Kappa
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono-data text-[#78716C]">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4442C]" />
                <span className="text-[#151410] font-medium">Hybrid Quantum (HQNN)</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#78716C]" />
                <span>Classical Baseline</span>
              </span>
            </div>
          </div>

          {/* SVG Scatter Plot */}
          <div className="relative w-full h-72 sm:h-80 bg-[#FAF8F5] rounded-xl border border-[#E5E1DC] p-4">
            <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
              <line x1="50" y1="20" x2="570" y2="20" stroke="#E5E1DC" strokeWidth="1" />
              <line x1="50" y1="70" x2="570" y2="70" stroke="#E5E1DC" strokeWidth="1" />
              <line x1="50" y1="120" x2="570" y2="120" stroke="#E5E1DC" strokeWidth="1" />
              <line x1="50" y1="170" x2="570" y2="170" stroke="#E5E1DC" strokeWidth="1" />
              <line x1="50" y1="210" x2="570" y2="210" stroke="#151410" strokeWidth="1.5" />
              <line x1="50" y1="20" x2="50" y2="210" stroke="#151410" strokeWidth="1.5" />

              <text x="42" y="24" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#78716C">1.0</text>
              <text x="42" y="74" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#78716C">0.75</text>
              <text x="42" y="124" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#78716C">0.50</text>
              <text x="42" y="174" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#78716C">0.25</text>
              <text x="42" y="214" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#78716C">0.0</text>

              {/* Pareto Curve connecting top models */}
              <path
                d="M 100,60 Q 220,70 520,44"
                fill="none"
                stroke="#E4442C"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Plot Model Points */}
              {/* HQNN 4-Qubit Autoencoder (Pareto star) */}
              <circle
                cx="100"
                cy="60"
                r="8"
                fill="#E4442C"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredModel(benchmarkModels[0])}
                onMouseLeave={() => setHoveredModel(null)}
              />
              <text x="100" y="44" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="monospace" fill="#E4442C">
                HQNN (0.7693)
              </text>

              {/* 4-Qubit PCA Failure */}
              <circle
                cx="100"
                cy="185"
                r="6"
                fill="#78716C"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredModel(benchmarkModels[4])}
                onMouseLeave={() => setHoveredModel(null)}
              />
              <text x="100" y="200" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#78716C">
                PCA (0.1379)
              </text>

              {/* Classical ResNet18 */}
              <circle
                cx="520"
                cy="44"
                r="7"
                fill="#151410"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredModel(benchmarkModels[5])}
                onMouseLeave={() => setHoveredModel(null)}
              />
              <text x="520" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#151410">
                ResNet18 (0.8721)
              </text>
            </svg>

            {hoveredModel && (
              <div className="absolute top-4 right-4 bg-white border border-[#E5E1DC] text-[#151410] p-4 rounded-xl text-xs font-mono-data shadow-md max-w-xs z-20">
                <span className="font-bold text-[#E4442C] block">{hoveredModel.name}</span>
                <span className="text-[#57534E] block mt-1">QWK: {hoveredModel.qwk} · Acc: {hoveredModel.accuracy}%</span>
                <span className="text-[#57534E] block">Decision Params: {hoveredModel.decisionParams.toLocaleString()}</span>
                <span className="text-[#57534E] block">Latency: {hoveredModel.latencyMs} ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Confusion Matrix Heatmap */}
        <div className="bg-white p-6 sm:p-8 border border-[#E5E1DC] rounded-2xl mb-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E5E1DC] pb-4">
            <div>
              <span className="text-xs font-mono-data text-[#E4442C] uppercase tracking-wider block font-semibold">
                FIG. 6 · CONFUSION MATRIX — HQNN (4-QUBIT AUTOENCODER)
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#151410] mt-0.5">
                Per-class recall on APTOS 2019 test set (N=550)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono-data text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(228,68,44,0.75)' }} />
                <span>High recall (diagonal)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(228,68,44,0.08)' }} />
                <span>Low value</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs font-mono-data border-collapse mx-auto">
              <thead>
                <tr>
                  {/* Top-left corner label */}
                  <th className="p-2 text-left text-[#78716C] font-normal text-[10px] min-w-[110px]">
                    Actual \ Predicted
                  </th>
                  {CM_COL_LABELS.map((lbl, c) => (
                    <th key={c} className="p-2 text-center font-mono-data font-semibold text-[#151410] text-[10px] min-w-[70px]">
                      {lbl}
                    </th>
                  ))}
                  <th className="p-2 text-center text-[#78716C] font-normal text-[10px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {CM_DATA.map((row, r) => {
                  const rowTotal = CM_ROW_TOTALS[r];
                  return (
                    <tr key={r}>
                      <td className="p-2 pr-3 font-mono-data text-[10px] text-[#57534E] text-right whitespace-nowrap">
                        {CM_ROW_LABELS[r]}
                      </td>
                      {row.map((count, c) => {
                        const normalizedOpacity = Math.max(0.05, (count / rowTotal) * 0.9);
                        const isHovered = hoveredCell && hoveredCell.row === r && hoveredCell.col === c;
                        const isDiag = r === c;
                        const pct = ((count / rowTotal) * 100).toFixed(1);
                        return (
                          <td
                            key={c}
                            className="p-0 cursor-default"
                            onMouseEnter={() => setHoveredCell({ row: r, col: c })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div
                              className="m-0.5 rounded-lg flex flex-col items-center justify-center transition-all duration-150"
                              style={{
                                background: isHovered
                                  ? `rgba(228, 68, 44, ${Math.min(normalizedOpacity + 0.15, 1)})`
                                  : `rgba(228, 68, 44, ${normalizedOpacity})`,
                                border: isDiag ? '2px solid #1F5D3A' : '1.5px solid transparent',
                                minWidth: '64px',
                                minHeight: '52px',
                                padding: '6px 4px',
                              }}
                            >
                              <span
                                className="font-bold leading-none"
                                style={{
                                  fontSize: '15px',
                                  color: normalizedOpacity > 0.45 ? '#FFFFFF' : '#151410',
                                }}
                              >
                                {count}
                              </span>
                              <span
                                className="mt-0.5 leading-none"
                                style={{
                                  fontSize: '10px',
                                  color: normalizedOpacity > 0.45 ? 'rgba(255,255,255,0.80)' : '#78716C',
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-2 text-center text-[10px] font-mono-data text-[#78716C] font-semibold">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Hover tooltip */}
          {hoveredCell && (
            <div className="mt-4 px-4 py-2 bg-[#FAF8F5] border border-[#E5E1DC] rounded-xl text-xs font-mono-data text-[#151410] inline-flex gap-3 items-center">
              <span className="text-[#78716C]">Selected:</span>
              <span className="font-semibold">{CM_ROW_LABELS[hoveredCell.row]}</span>
              <span className="text-[#A8A29E]">→</span>
              <span className="font-semibold">{CM_COL_LABELS[hoveredCell.col]}</span>
              <span className="text-[#E4442C] font-bold">
                {CM_DATA[hoveredCell.row][hoveredCell.col]} samples
                &nbsp;({((CM_DATA[hoveredCell.row][hoveredCell.col] / CM_ROW_TOTALS[hoveredCell.row]) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Sortable Benchmark Table */}
        <div className="bg-white border border-[#E5E1DC] rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-mono-data">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E5E1DC] text-[#78716C]">
                <th className="p-4 font-semibold text-[#151410]">Architecture</th>
                <th className="p-4 font-semibold text-[#151410]">State Prep</th>
                <th
                  onClick={() => handleSort('decisionParams')}
                  className="p-4 cursor-pointer hover:text-[#151410] transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Decision Params</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qwk')}
                  className="p-4 cursor-pointer hover:text-[#E4442C] transition-colors font-bold text-[#151410]"
                >
                  <div className="flex items-center space-x-1">
                    <span>QWK Metric</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('accuracy')}
                  className="p-4 cursor-pointer hover:text-[#151410] transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Accuracy</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aucRoc')}
                  className="p-4 cursor-pointer hover:text-[#151410] transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>AUC-ROC</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('latencyMs')}
                  className="p-4 cursor-pointer hover:text-[#151410] transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Latency</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-[#E5E1DC] transition-colors hover:bg-[#FAF8F5] ${
                    m.isPareto ? 'bg-[#FBECE9]/60 font-semibold' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {m.isPareto && <Award className="w-4 h-4 text-[#E4442C] flex-shrink-0" />}
                      <span className={m.isPareto ? 'text-[#E4442C] font-bold' : 'text-[#151410]'}>
                        {m.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[#78716C] max-w-[200px] truncate" title={m.statePrep}>
                    {m.statePrep}
                  </td>
                  <td className="p-4 text-[#151410]">
                    {m.decisionParams.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-[#1F5D3A]">
                    {m.qwk.toFixed(4)}
                  </td>
                  <td className="p-4 text-[#151410]">
                    {m.accuracy.toFixed(2)}%
                  </td>
                  <td className="p-4 text-[#151410]">
                    {m.aucRoc.toFixed(4)}
                  </td>
                  <td className="p-4 text-[#78716C]">
                    {m.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
