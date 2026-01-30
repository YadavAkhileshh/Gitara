"use client";

import { motion } from "framer-motion";
import { Terminal, Box, GitMerge, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "./ui-elements";
import { cn } from "@/lib/utils";

export function DevOpsPanel({ automations, techStack }) {
    const hasDocker = techStack?.some(t => String(t).toLowerCase().includes('docker')) || false;
    const hasCI = techStack?.some(t => String(t).toLowerCase().includes('github actions') || String(t).toLowerCase().includes('jenkins') || String(t).toLowerCase().includes('ci')) || false;

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4 px-2">
                <div className="p-2 rounded-lg bg-stone-800 border border-stone-700">
                    <Terminal className="w-6 h-6 text-stone-100" />
                </div>
                <h3 className="text-3xl font-heading font-bold text-stone-100">Automation Strategy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Indicators */}
                <div className="p-8 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-between group hover:border-stone-500 transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center border transition-colors",
                            hasDocker ? "bg-stone-700 border-stone-600 text-stone-100" : "bg-stone-800 border-stone-700 text-stone-600"
                        )}>
                            <Box className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Containerization</p>
                            <h4 className="text-xl font-heading font-bold text-stone-100">{hasDocker ? 'Active' : 'Missing'}</h4>
                        </div>
                    </div>
                    {hasDocker ? <CheckCircle2 className="w-5 h-5 text-stone-100" /> : <AlertCircle className="w-5 h-5 text-stone-600" />}
                </div>

                <div className="p-8 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-between group hover:border-stone-500 transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center border transition-colors",
                            hasCI ? "bg-stone-700 border-stone-600 text-stone-100" : "bg-stone-800 border-stone-700 text-stone-600"
                        )}>
                            <GitMerge className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Continuous Integration</p>
                            <h4 className="text-xl font-heading font-bold text-stone-100">{hasCI ? 'Detected' : 'Not Detected'}</h4>
                        </div>
                    </div>
                    {hasCI ? <CheckCircle2 className="w-5 h-5 text-stone-100" /> : <AlertCircle className="w-5 h-5 text-stone-600" />}
                </div>
            </div>

            {/* Suggested Strategy */}
            <div className="rounded-2xl bg-stone-900 p-12 text-stone-50 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-stone-800/50 blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-stone-800">
                        <h4 className="text-2xl font-heading font-bold flex items-center gap-4">
                            System Directives
                        </h4>
                        <span className="text-[10px] font-black tracking-[0.2em] text-stone-400 uppercase">Engine V1.0</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(automations || []).map((auto, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <div className="w-6 h-6 rounded-md bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <p className="text-base text-stone-300 font-medium leading-relaxed">
                                    {typeof auto === 'string' ? auto : auto.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.3em] text-stone-600">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                            Environment Secure
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                            Analysis Stable
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
