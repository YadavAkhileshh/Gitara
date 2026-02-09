"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AnimatedButton from "./ui/animated-button";

export function Hero() {
    return (
        <div className="w-full relative flex items-center justify-center  mt-2">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="flex flex-col items-center relative z-10 px-6 py-20"
            >
                <AnimatedButton
                    className="mb-8 bg-stone-800/80 border-stone-700/50 backdrop-blur-sm scale-90"
                >
                    <div className="flex items-center gap-2.5 px-0.5 text-stone-300 text-[10px] font-black uppercase tracking-[0.15em]">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-current" />
                        Technical Repository Intelligence
                    </div>
                </AnimatedButton>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[0.9] mb-8 text-stone-50 max-w-4xl tracking-tighter text-balance">
                    Confidence <span className="text-stone-400 font-medium">backed by</span> deep analysis
                </h1>

                <p className="max-w-xl text-lg md:text-xl text-stone-300 font-bold leading-relaxed opacity-90 text-balance">
                    A high-fidelity analysis tool for security audits, architectural deep-dives, and technical roadmaps.
                </p>
            </motion.div>
        </div>
    );
}

