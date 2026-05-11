/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  RotateCcw,
  FileSpreadsheet,
  Users,
  Locate,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  alignDatasets, 
  MatchResult, 
  OlympicAthlete, 
  ParalympicAthlete 
} from './utils/fuzzyMatch';
import { SAMPLE_OLYMPIC_DATA, SAMPLE_PARALYMPIC_DATA } from './sampleData';
import { generateTeamInsights, HometownStats } from './services/geminiService';

export default function App() {
  const [olympicData, setOlympicData] = useState<OlympicAthlete[]>(SAMPLE_OLYMPIC_DATA);
  const [paralympicData, setParalympicData] = useState<ParalympicAthlete[]>(SAMPLE_PARALYMPIC_DATA);
  const [activeTab, setActiveTab] = useState<'matches' | 'flagged' | 'unmatched'>('matches');
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const alignment = useMemo(() => {
    return alignDatasets(olympicData, paralympicData);
  }, [olympicData, paralympicData]);

  const hometownStats = useMemo(() => {
    const statsMap: Record<string, { o: number; p: number }> = {};
    
    olympicData.forEach(a => {
      const ht = a.hometown.split(',')[0].trim();
      if (!statsMap[ht]) statsMap[ht] = { o: 0, p: 0 };
      statsMap[ht].o++;
    });

    paralympicData.forEach(a => {
      const ht = a.home_town.split(',')[0].trim();
      if (!statsMap[ht]) statsMap[ht] = { o: 0, p: 0 };
      statsMap[ht].p++;
    });

    return Object.entries(statsMap).map(([ht, counts]) => ({
      hometown: ht,
      olympicCount: counts.o,
      paralympicCount: counts.p
    }));
  }, [olympicData, paralympicData]);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const result = await generateTeamInsights(hometownStats);
      setInsights(result || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const flaggedMatches = alignment.matches.filter(m => m.isFlagged);
  const confidentMatches = alignment.matches.filter(m => !m.isFlagged);

  const totalRows = olympicData.length;
  const automatedMatches = alignment.matches.length;
  const flaggedCount = flaggedMatches.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 text-slate-800">
      {/* Top Navigation */}
      <header className="h-12 bg-slate-800 text-slate-50 flex items-center px-5 justify-between border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4 text-xs font-semibold tracking-wider">
          <span>DATA ENGINEER WORKBENCH</span>
          <span className="opacity-30">|</span>
          <span className="font-normal opacity-80 flex items-center gap-2">
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> Olympic_Hometown_Alignment.js
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            ACTIVE SESSION
          </div>
          <button 
            onClick={() => {
              setOlympicData(SAMPLE_OLYMPIC_DATA);
              setParalympicData(SAMPLE_PARALYMPIC_DATA);
            }}
            className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase hover:bg-slate-700 transition-colors rounded"
            title="Reset to sample data"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="h-10 px-4 flex items-center bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Project Files
          </div>
          <div className="p-3 space-y-1">
            <FileItem name="athletes_olympic.csv" icon={<FileSpreadsheet className="w-3.5 h-3.5" />} />
            <FileItem name="athletes_paralympic.csv" icon={<FileSpreadsheet className="w-3.5 h-3.5" />} />
            <FileItem name="alignment_logic.ts" icon={<Database className="w-3.5 h-3.5" />} active />
            <FileItem name="report_generator.py" icon={<Search className="w-3.5 h-3.5" />} disabled />
          </div>
        </aside>

        {/* Logic / Documentation Pane */}
        <section className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="h-10 px-4 flex items-center bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
            Alignment Methodology
          </div>
          <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed text-slate-600 bg-slate-50/30">
            <div className="space-y-4">
              <CodeComment>// Suggested fuzzy match logic</CodeComment>
              <CodeComment>// Resolves variations like "Colo Spgs" vs "Colorado Springs"</CodeComment>
              
              <div className="py-2">
                <span className="text-blue-600">function</span> <span className="text-emerald-600">normalizeHometown</span>(str) {"{"}
                <div className="pl-4 opacity-70">
                  const subs = {"{"} "nyc": "new york city" ... {"}"};<br/>
                  return str.toLowerCase().replace(...);
                </div>
                {"}"}
              </div>

              <div className="py-2">
                <span className="text-blue-600">function</span> <span className="text-emerald-600">calculateSimilarity</span>(s1, s2) {"{"}
                <div className="pl-4 opacity-70">
                  <span className="text-slate-400 italic">// Using Levenshtein Distance</span><br/>
                  const score = getDistance(s1, s2);<br/>
                  return 1 - (score / maxLen);
                </div>
                {"}"}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] font-sans">
                <div className="font-bold text-blue-800 mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Data Engineer Log
                </div>
                The current threshold is set to 80%. Matches below 95% but above 80% are automatically flagged for manual verification.
              </div>

              {/* Two Flags, One Team Insights */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Parity Insights
                  </h3>
                  <button 
                    onClick={handleGenerateInsights}
                    disabled={isGenerating}
                    className="text-[9px] font-bold text-blue-600 uppercase hover:underline disabled:opacity-50"
                  >
                    {isGenerating ? "Processing..." : "Generate AI Insights"}
                  </button>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4 font-sans text-xs text-slate-300 min-h-[100px] flex flex-col justify-center">
                  {!insights && !isGenerating && (
                    <div className="text-center opacity-50 italic">
                      Click generate to view strategic insights for the "Two Flags, One Team" parity initiative.
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.div>
                      <span>Analyzing hometown distribution...</span>
                    </div>
                  )}
                  {insights && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 prose prose-invert max-w-none"
                    >
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 tabular-nums">Strategic Briefing</div>
                      {insights.split('\n').filter(l => l.trim()).map((line, i) => (
                        <p key={i} className="leading-normal">{line.replace(/^\d\.\s*/, '')}</p>
                      ))}
                      <div className="pt-2 flex justify-end">
                        <div className="text-[9px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-500 uppercase tracking-tighter">
                          Reference: Tri-Composite Logo Standard
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Alignment Preview Pane */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="h-10 px-4 flex items-center bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase justify-between">
            <span>Live Alignment Preview</span>
            <div className="flex bg-slate-200 p-0.5 rounded gap-0.5">
              <InlineTab active={activeTab === 'matches'} onClick={() => setActiveTab('matches')}>CONFIDENT</InlineTab>
              <InlineTab active={activeTab === 'flagged'} onClick={() => setActiveTab('flagged')}>REVIEW</InlineTab>
              <InlineTab active={activeTab === 'unmatched'} onClick={() => setActiveTab('unmatched')}>ORPHANED</InlineTab>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 bg-slate-50 border-b-2 border-slate-200 z-10">
                <tr>
                  <th className="text-left py-2.5 px-4 font-bold text-slate-500 uppercase tracking-tighter">Olympic Source</th>
                  <th className="text-left py-2.5 px-4 font-bold text-slate-500 uppercase tracking-tighter">Paralympic Target</th>
                  <th className="text-center py-2.5 px-4 font-bold text-slate-500 uppercase tracking-tighter w-24">Confidence</th>
                  <th className="text-center py-2.5 px-4 font-bold text-slate-500 uppercase tracking-tighter w-24">Action</th>
                </tr>
              </thead>
                  <AnimatePresence mode="wait">
                  {activeTab === 'matches' && (
                    <motion.tbody 
                      key="matches-view"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="divide-y divide-slate-100"
                    >
                      {confidentMatches.map((m, i) => <DataRow key={i} match={m} type="match" />)}
                      {confidentMatches.length === 0 && <EmptyRow colSpan={4} text="No confident matches available" />}
                    </motion.tbody>
                  )}
                  {activeTab === 'flagged' && (
                    <motion.tbody 
                      key="flagged-view"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="divide-y divide-slate-100"
                    >
                      {flaggedMatches.map((m, i) => <DataRow key={i} match={m} type="flag" />)}
                      {flaggedMatches.length === 0 && <EmptyRow colSpan={4} text="Zero records flagged for review" />}
                    </motion.tbody>
                  )}
                  {activeTab === 'unmatched' && (
                    <motion.tbody 
                      key="unmatched-view"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="divide-y divide-slate-100"
                    >
                        {alignment.unmatchedOlympic.map((o, i) => (
                           <tr key={`u-o-${i}`} className="bg-red-50/30">
                              <td className="py-3 px-4 font-medium">{o.name} <span className="opacity-50 ml-1">({o.hometown})</span></td>
                              <td className="py-3 px-4 text-slate-400 italic">No candidate found</td>
                              <td className="py-3 px-4 text-center text-red-600 font-bold">0.00</td>
                              <td className="py-3 px-4 text-center"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">REJECT</span></td>
                           </tr>
                        ))}
                        {alignment.unmatchedParalympic.map((p, i) => (
                           <tr key={`u-p-${i}`} className="bg-blue-50/30">
                              <td className="py-3 px-4 text-slate-400 italic">No candidate found</td>
                              <td className="py-3 px-4 font-medium">{p.name} <span className="opacity-50 ml-1">({p.home_town})</span></td>
                              <td className="py-3 px-4 text-center text-blue-600 font-bold">0.00</td>
                              <td className="py-3 px-4 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">ORPHAN</span></td>
                           </tr>
                        ))}
                    </motion.tbody>
                  )}
                </AnimatePresence>
            </table>
          </div>
        </section>
      </div>

      {/* Metrics Bar / Footer */}
      <footer className="h-[60px] bg-white border-t border-slate-200 flex items-center px-6 gap-10 shrink-0">
        <MetricItem label="Total Rows Analyzed" value={totalRows} />
        <MetricItem label="Automated Matches" value={automatedMatches} highlightColor="text-emerald-600" />
        <MetricItem label="Flagged for Review" value={flaggedCount} highlightColor="text-red-500" />
        <MetricItem label="Confidence Level" value="Medium-High" />
      </footer>
    </div>
  );
}

function FileItem({ name, icon, active, disabled }: { name: string; icon: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3 py-2 rounded text-[12px] transition-colors",
      active ? "bg-slate-200 text-blue-600 font-semibold" : "text-slate-600",
      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-200/50"
    )}>
      <span className={active ? "text-blue-500" : "text-slate-400"}>{icon}</span>
      {name}
    </div>
  );
}

function CodeComment({ children }: { children: React.ReactNode }) {
  return <div className="text-slate-400 italic">{children}</div>;
}

function InlineTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 text-[9px] font-bold rounded transition-colors",
        active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-300"
      )}
    >
      {children}
    </button>
  );
}

function DataRow({ match, type }: { match: MatchResult; type: 'match' | 'flag'; key?: React.Key }) {
  return (
    <tr className="hover:bg-slate-50/50 group transition-colors">
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{match.olympic.name}</div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1"><Locate className="w-2.5 h-2.5" /> {match.olympic.hometown}</div>
      </td>
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{match.paralympic.name}</div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1"><Locate className="w-2.5 h-2.5" /> {match.paralympic.home_town}</div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={cn(
          "font-bold font-mono",
          type === 'match' ? "text-emerald-600" : "text-amber-600"
        )}>
          {match.score.toFixed(2)}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        {type === 'match' ? (
          <span className="text-emerald-600 font-bold uppercase tracking-tighter text-[10px]">Align</span>
        ) : (
          <span className="bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter shadow-sm">Flag</span>
        )}
      </td>
    </tr>
  );
}

function MetricItem({ label, value, highlightColor }: { label: string; value: string | number; highlightColor?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
      <span className={cn("text-lg font-bold leading-tight", highlightColor || "text-slate-800")}>{value}</span>
    </div>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-20 text-center opacity-30 italic text-slate-500 bg-slate-50/20">
        {text}
      </td>
    </tr>
  );
}

