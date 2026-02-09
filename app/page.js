"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AnalysisResults } from "@/components/AnalysisResults";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Github, AlertCircle, Loader2, Zap, Clock } from "lucide-react";
import { useAnalysis } from "@/hooks/use-analysis";
import { analysisStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { LiquidText } from "@/components/ui/liquid-text";
import { PerspectiveGrid } from "@/components/ui/perspective-grid";

export default function Home() {
  const [url, setUrl] = useState("");
  const [recent, setRecent] = useState([]);
  const { analyze, status, isLoading, isComplete, result, reset: internalReset } = useAnalysis();

  const reset = () => {
    setUrl("");
    internalReset();
  };

  useEffect(() => {
    setRecent(analysisStorage.getRecent(3));
  }, [isComplete]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!url) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://github.com/${finalUrl}`;
    }

    analyze(finalUrl);
  };

  const handleRecentClick = (repoUrl) => {
    const fullUrl = repoUrl.includes('github.com') ? repoUrl : `https://github.com/${repoUrl}`;
    setUrl(fullUrl);
    analyze(fullUrl);
  };

  return (
    <main className={cn(
      "min-h-screen relative selection:bg-stone-100/10 font-sans antialiased text-stone-100 transition-colors bg-black",
      isComplete ? "overflow-x-hidden" : ""
    )}>
      {/* Sophisticated Background: Optimized & Interactive */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-[0.2]">
          <PerspectiveGrid gridSize={30} fadeRadius={100} showOverlay={false} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_300px_at_80%_80%,#1e293b20,transparent)]"></div>
      </div>

      <Navbar />

      {/* Main Content Area */}
      <div className="relative z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {!isComplete && !isLoading ? (
            /* Home State */
            <motion.div
              key="landing"
              className="min-h-screen flex flex-col items-center pt-32 pb-12 container mx-auto px-6 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.99, y: -20 }}
              transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              <div className="flex-1 w-full flex flex-col items-center justify-center">
                <div className="pointer-events-auto w-full flex flex-col items-center">
                  <Hero />
                </div>

                <div className="w-full max-w-3xl pointer-events-auto">
                  <div className="p-1.5 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-stone-600/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-stone-800/20 via-transparent to-stone-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row items-stretch gap-2 relative z-10">
                      <div className="relative flex-1">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400">
                          <Github className="w-6 h-6" />
                        </div>
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://github.com/owner/repo"
                          className="w-full h-16 pl-16 pr-8 rounded-xl bg-stone-800/80 backdrop-blur-sm border border-stone-700/50 text-lg font-bold focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all placeholder:text-stone-400 text-stone-100"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-16 px-10 rounded-xl bg-gradient-to-r from-stone-100 to-stone-200 text-stone-900 font-bold text-lg hover:from-stone-200 hover:to-stone-300 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-3 shrink-0 active:scale-[0.98] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <Zap className="w-5 h-5 fill-current relative z-10" />
                        <span className="relative z-10">Analyze</span>
                      </button>
                    </form>
                  </div>

                  <AnimatePresence>
                    {recent.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-12 group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-stone-500/10 via-stone-400/5 to-stone-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative p-6 rounded-3xl bg-stone-900/40 backdrop-blur-2xl border border-stone-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-500/20 to-transparent"></div>

                          <div className="flex items-center justify-between mb-5 px-1">
                            <div className="flex items-center gap-2.5">
                              <div className="w-5 h-5 rounded-md bg-stone-800/80 flex items-center justify-center border border-stone-700/50">
                                <Clock className="w-3 h-3 text-stone-400" />
                              </div>
                              <span className="text-[10px] font-black tracking-[0.2em] text-stone-500 uppercase">Recent Explorations</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full bg-stone-800/50 border border-stone-700/30 text-[9px] font-bold text-stone-600">
                              {recent.length} SESSIONS
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2.5">
                            {recent.map((item, i) => (
                              <div key={i} className="group/item relative">
                                <button
                                  onClick={() => handleRecentClick(item.repoFullName || item.url || '')}
                                  className="pl-3 pr-4 py-2 rounded-xl bg-stone-900/60 hover:bg-stone-100 hover:text-stone-900 border border-stone-800/50 hover:border-white transition-all duration-300 text-[11px] font-bold text-stone-400 flex items-center gap-2.5 group-hover/item:shadow-lg"
                                >
                                  <div className="w-5 h-5 rounded-lg bg-stone-800/50 group-hover/item:bg-stone-900/20 flex items-center justify-center transition-colors">
                                    <Github className="w-3 h-3" />
                                  </div>
                                  {(item.repoFullName || item.url || '').split('/').slice(-2).join('/')}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    analysisStorage.remove(item.repoFullName, item.branch);
                                    setRecent(analysisStorage.getRecent(3));
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-stone-700/50 text-[10px] shadow-xl"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <footer className="w-full mt-12 pb-8 flex flex-col items-center select-none z-20 pointer-events-none h-[400px]">
                <div className="pointer-events-auto flex flex-col items-center w-full max-w-[100vw]">
                  <LiquidText
                    text="Gitara"
                    fontSize={700}
                    className="h-[320px] w-full mb-[-20px]"
                    darkColor="#ffffff"
                  />
                  <a
                    href="https://akhilesh.pages.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black text-stone-600 hover:text-stone-300 transition-colors uppercase tracking-[0.5em] hover:scale-110 transform duration-300 flex items-center gap-2 relative z-30"
                  >
                    <span className="w-8 h-px bg-stone-800"></span>
                    Akhilesh
                    <span className="w-8 h-px bg-stone-800"></span>
                  </a>
                </div>
              </footer>
            </motion.div>
          ) : isLoading ? (
            /* Loading State */
            <motion.div
              key="loading"
              className="h-screen flex flex-col items-center justify-center container mx-auto px-6 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative mb-12">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-2xl bg-stone-800/90 backdrop-blur-sm border border-stone-700 flex items-center justify-center relative shadow-xl shadow-stone-900/30"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-stone-700/50 to-transparent"></div>
                  <Zap className="w-10 h-10 text-stone-100 relative z-10" />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-100/20 to-transparent rounded-b-2xl"
                    animate={{ height: [`${status.progress}%`, `${status.progress}%`] }}
                  />
                </motion.div>
              </div>

              <div className="text-center space-y-4 max-w-sm">
                <h4 className="text-2xl font-heading font-bold text-stone-100 tracking-tight">{status.currentStep}</h4>
                <p className="text-stone-300 font-bold text-base">Analyzing repository structure and dependencies...</p>
                <div className="flex items-center justify-center gap-2 text-sm text-stone-400 font-bold">
                  <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse" />
                  <span>This may take a few moments</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results State */
            <motion.div
              key="results"
              className="container mx-auto px-6 py-40 pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              <div className="w-full max-w-6xl mx-auto pointer-events-auto">
                <div className="flex justify-between items-center mb-20">
                  <button
                    onClick={reset}
                    className="group text-xs font-black text-stone-200 hover:text-stone-100 transition-all flex items-center gap-3 border border-stone-600 px-6 py-3 rounded-xl bg-stone-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-stone-700/80"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    NEW ANALYSIS
                  </button>
                  <div className="text-[10px] font-black tracking-[0.2em] text-stone-400 uppercase">Stable Analysis</div>
                </div>
                <AnalysisResults result={result} status={status} />
              </div>

              <footer className="mt-20 pb-20 border-t border-stone-800/10 pt-20 flex flex-col items-center select-none pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-center w-full max-w-[100vw]">
                  <LiquidText
                    text="Gitara"
                    fontSize={800}
                    className="h-[400px] w-full mb-[-100px]"
                    darkColor="#ffffff"
                  />
                  <a
                    href="https://akhilesh.pages.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-black text-stone-600 hover:text-stone-300 transition-colors uppercase tracking-[0.6em] hover:scale-110 transform duration-300 flex items-center gap-4 relative z-30"
                  >
                    <span className="w-16 h-px bg-stone-800"></span>
                    Akhilesh
                    <span className="w-16 h-px bg-stone-800"></span>
                  </a>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Error Overlay */}
        <AnimatePresence>
          {status.error && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-950/40 backdrop-blur-md pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-md w-full p-10 rounded-2xl bg-stone-800 border border-stone-700 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center text-stone-100">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-heading font-bold text-stone-100 mb-1">Analysis Error</h4>
                  <p className="text-stone-300 text-sm font-bold leading-relaxed">{status.error}</p>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-4 bg-stone-100 text-stone-900 rounded-xl font-bold hover:bg-stone-200 transition-all"
                >
                  Reset and Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}