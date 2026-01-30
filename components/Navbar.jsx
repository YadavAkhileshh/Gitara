"use client";

import { motion } from "framer-motion";
import { Github, Zap } from "lucide-react";
import Link from "next/link";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-8 pointer-events-none">
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="w-full max-w-5xl bg-stone-800/40 backdrop-blur-xl border border-stone-700/50 rounded-2xl flex items-center justify-between px-8 py-4 pointer-events-auto"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px -12px rgba(0,0,0,0.08)' }}
            >
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900 shadow-sm transition-transform group-hover:scale-105">
                        <Zap className="w-4.5 h-4.5 fill-current" />
                    </div>
                    <span className="text-lg font-heading font-bold tracking-tight text-stone-100 uppercase">
                        Gitara<span className="text-stone-400">.ai</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/YadavAkhileshh/Gitara"
                        target="_new"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-900 text-xs font-bold hover:bg-stone-200 transition-all shadow-md shadow-stone-900/10"
                    >
                        <Github className="w-3.5 h-3.5" />
                        <span>OPEN SOURCE</span>
                    </a>
                </div>
            </motion.div>
        </nav>
    );
}
