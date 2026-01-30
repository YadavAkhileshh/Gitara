"use client";

import { createContext, useContext, useState, useCallback } from "react";

const initialStatus = {
    stage: "idle",
    progress: 0,
    currentStep: "",
};

const AnalysisContext = createContext(undefined);

export function AnalysisProvider({ children }) {
    const [status, setStatus] = useState(initialStatus);
    const [result, setResult] = useState(null);

    const updateResult = useCallback((updates) => {
        setResult((prev) => ({ ...prev, ...updates }));
    }, []);

    const reset = useCallback(() => {
        setStatus(initialStatus);
        setResult(null);
    }, []);

    const isLoading = ["fetching", "parsing", "analyzing"].includes(status.stage);
    const isComplete = status.stage === "complete";
    const hasError = status.stage === "error";
    const isIdle = status.stage === "idle";

    return (
        <AnalysisContext.Provider
            value={{
                status,
                result,
                setStatus,
                setResult,
                updateResult,
                reset,
                isLoading,
                isComplete,
                hasError,
                isIdle,
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysisContext() {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error("useAnalysisContext must be used within AnalysisProvider");
    }
    return context;
}
