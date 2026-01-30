"use client";

import { useCallback, useState } from "react";
import { useAnalysisContext } from "@/context/analysis-context";
import { analysisStorage } from "@/lib/storage";

function extractRepoFullName(url) {
    try {
        const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+\/[^\/\s?#]+)/;
        const match = url.match(githubRegex);
        if (match) return match[1].replace(/\.git$/, "");

        const simpleRegex = /^([^\/\s]+\/[^\/\s]+)$/;
        const simpleMatch = url.trim().match(simpleRegex);
        if (simpleMatch) return simpleMatch[1];

        return null;
    } catch {
        return null;
    }
}

export function useAnalysis() {
    const {
        status,
        result,
        setStatus,
        setResult,
        updateResult,
        reset: contextReset,
        isLoading,
        isComplete,
        hasError,
        isIdle,
    } = useAnalysisContext();

    const [isCached, setIsCached] = useState(false);
    const [currentRepoUrl, setCurrentRepoUrl] = useState(null);
    const [currentBranch, setCurrentBranch] = useState(undefined);

    const analyze = useCallback(
        async (url, branch, skipCache = false) => {
            const repoFullName = extractRepoFullName(url);

            if (!repoFullName) {
                setStatus({
                    stage: "error",
                    progress: 0,
                    currentStep: "",
                    error: "Invalid GitHub repository URL. Please use format: owner/repo or https://github.com/owner/repo",
                });
                return;
            }

            setCurrentRepoUrl(url);
            setCurrentBranch(branch);

            if (!skipCache) {
                const cached = analysisStorage.get(repoFullName, branch);
                if (cached) {
                    setResult(cached);
                    setIsCached(true);
                    setStatus({
                        stage: "complete",
                        progress: 100,
                        currentStep: "Loaded from cache",
                    });
                    return;
                }
            }

            setIsCached(false);
            setStatus({
                stage: "fetching",
                progress: 5,
                currentStep: "Establishing connection...",
            });
            setResult(null);

            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url, branch }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Analysis failed");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();
                let buffer = "";
                let aiContent = "";
                let currentResult = {};

                setStatus({
                    stage: "fetching",
                    progress: 15,
                    currentStep: "Reading repository files...",
                });

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;

                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "metadata") {
                                currentResult = { ...data.data };
                                setCurrentBranch(data.data.branch);
                                updateResult(currentResult);
                                setStatus({
                                    stage: "analyzing",
                                    progress: 40,
                                    currentStep: `Examining ${data.data.branch} branch structure...`,
                                });
                            } else if (data.type === "content") {
                                aiContent += data.data;
                                const progress = Math.min(40 + (aiContent.length / 6000) * 50, 90);
                                setStatus({
                                    stage: "analyzing",
                                    progress,
                                    currentStep: "Analyzing code structure and patterns...",
                                });
                            } else if (data.type === "error") {
                                throw new Error(data.data);
                            } else if (data.type === "done") {
                                let analysisData = null;
                                const codeBlockMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/);
                                if (codeBlockMatch) {
                                    try {
                                        analysisData = JSON.parse(codeBlockMatch[1].trim());
                                    } catch (e) { }
                                }

                                if (!analysisData) {
                                    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                                    if (jsonMatch) {
                                        try {
                                            analysisData = JSON.parse(jsonMatch[0]);
                                        } catch (e) { }
                                    }
                                }

                                if (analysisData) {
                                    const finalResult = {
                                        ...currentResult,
                                        ...analysisData,
                                    };
                                    updateResult(finalResult);
                                    if (currentResult.metadata?.fullName) {
                                        analysisStorage.set(
                                            currentResult.metadata.fullName,
                                            finalResult,
                                            currentResult.branch
                                        );
                                    }
                                }

                                setStatus({
                                    stage: "complete",
                                    progress: 100,
                                    currentStep: "Analysis complete!",
                                });
                            }
                        } catch (e) { }
                    }
                }
            } catch (error) {
                setStatus({
                    stage: "error",
                    progress: 0,
                    currentStep: "",
                    error: error.message,
                });
            }
        },
        [setStatus, setResult, updateResult]
    );

    return {
        analyze,
        status,
        result,
        isLoading,
        isComplete,
        hasError,
        isIdle,
        isCached,
        currentRepoUrl,
        currentBranch,
        reset: contextReset,
    };
}
