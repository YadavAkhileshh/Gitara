// lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SCORE_THRESHOLDS } from "./constants";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
}

export function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function getScoreLevel(score) {
    if (score >= SCORE_THRESHOLDS.excellent) return "excellent";
    if (score >= SCORE_THRESHOLDS.good) return "good";
    if (score >= SCORE_THRESHOLDS.fair) return "fair";
    return "poor";
}

export function getScoreColor(score) {
    const level = getScoreLevel(score);
    const colors = {
        excellent: "text-emerald-600",
        good: "text-teal-600",
        fair: "text-amber-600",
        poor: "text-rose-600",
    };
    return colors[level];
}

export function getScoreBgColor(score) {
    const level = getScoreLevel(score);
    const colors = {
        excellent: "bg-emerald-500/10 border-emerald-500/20",
        good: "bg-teal-500/10 border-teal-500/20",
        fair: "bg-amber-500/10 border-amber-500/20",
        poor: "bg-rose-500/10 border-rose-500/20",
    };
    return colors[level];
}

export function getScoreGradient(score) {
    const level = getScoreLevel(score);
    const gradients = {
        excellent: "from-emerald-500 to-green-500",
        good: "from-teal-500 to-emerald-500",
        fair: "from-amber-500 to-orange-500",
        poor: "from-rose-500 to-red-500",
    };
    return gradients[level];
}

export function getPriorityColor(priority) {
    const colors = {
        critical: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
    return colors[priority];
}

export function getFileExtension(filename) {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function getLanguageFromExtension(filename) {
    const ext = getFileExtension(filename);
    const languageMap = {
        ts: "TypeScript",
        tsx: "TypeScript",
        js: "JavaScript",
        jsx: "JavaScript",
        py: "Python",
        go: "Go",
        rs: "Rust",
        java: "Java",
        rb: "Ruby",
        php: "PHP",
        swift: "Swift",
        kt: "Kotlin",
        cs: "C#",
        cpp: "C++",
        c: "C",
        html: "HTML",
        css: "CSS",
        scss: "SCSS",
        json: "JSON",
        yaml: "YAML",
        yml: "YAML",
        md: "Markdown",
        sql: "SQL",
        sh: "Shell",
        dockerfile: "Docker",
    };
    return languageMap[ext];
}
