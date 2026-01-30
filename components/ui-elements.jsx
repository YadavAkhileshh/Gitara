"use client";

import { cn } from "@/lib/utils";

export function Card({ children, className, variant = "default" }) {
    return (
        <div
            className={cn(
                "rounded-[1.5rem] p-8 transition-all duration-300",
                variant === "default" && "bg-card border border-border shadow-sm",
                variant === "glass" && "glass-morphism",
                variant === "outline" && "border border-border hover:border-primary/30",
                variant === "warm" && "bg-primary/5 border border-primary/20 shadow-lg shadow-primary/5",
                className
            )}
        >
            {children}
        </div>
    );
}

export function Badge({ children, className, variant = "default" }) {
    return (
        <span
            className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] border",
                variant === "default" && "bg-secondary/50 text-secondary-foreground border-border",
                variant === "success" && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
                variant === "warning" && "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
                variant === "danger" && "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
                className
            )}
        >
            {children}
        </span>
    );
}
