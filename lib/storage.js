// lib/storage.js
const STORAGE_KEY = "repo-analyses-devops";
const MAX_ENTRIES = 50;
const EXPIRY_DAYS = 7;

function getCacheKey(repoFullName, branch) {
    if (branch) {
        return `${repoFullName}:${branch}`;
    }
    return repoFullName;
}

function parseCacheKey(key) {
    const parts = key.split(":");
    if (parts.length > 1) {
        return {
            repoFullName: parts[0],
            branch: parts.slice(1).join(":"),
        };
    }
    return { repoFullName: key };
}

export const analysisStorage = {
    get(repoFullName, branch) {
        if (typeof window === "undefined") return null;

        try {
            const cache = localStorage.getItem(STORAGE_KEY);
            if (!cache) return null;

            const parsed = JSON.parse(cache);
            const key = getCacheKey(repoFullName, branch);
            const entry = parsed[key];

            if (!entry) {
                if (branch) {
                    const fallbackEntry = parsed[repoFullName];
                    if (fallbackEntry && Date.now() <= fallbackEntry.expiresAt) {
                        return fallbackEntry.data;
                    }
                }
                return null;
            }

            if (Date.now() > entry.expiresAt) {
                this.remove(repoFullName, branch);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error("Error reading from localStorage:", error);
            return null;
        }
    },

    set(repoFullName, data, branch) {
        if (typeof window === "undefined") return;

        try {
            const cache = this.getAll();
            const now = Date.now();
            const key = getCacheKey(repoFullName, branch);

            cache[key] = {
                data,
                timestamp: now,
                expiresAt: now + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
                branch,
            };

            const entries = Object.entries(cache);
            if (entries.length > MAX_ENTRIES) {
                const sorted = entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
                sorted.slice(0, entries.length - MAX_ENTRIES).forEach(([k]) => {
                    delete cache[k];
                });
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error("Error writing to localStorage:", error);
        }
    },

    remove(repoFullName, branch) {
        if (typeof window === "undefined") return;
        try {
            const cache = this.getAll();
            const key = getCacheKey(repoFullName, branch);
            delete cache[key];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error("Error removing from localStorage:", error);
        }
    },

    getAll() {
        if (typeof window === "undefined") return {};
        try {
            const cache = localStorage.getItem(STORAGE_KEY);
            return cache ? JSON.parse(cache) : {};
        } catch {
            return {};
        }
    },

    getRecent(limit = 10) {
        const cache = this.getAll();
        const now = Date.now();

        return Object.entries(cache)
            .filter(([, entry]) => entry.expiresAt > now)
            .sort(([, a], [, b]) => b.timestamp - a.timestamp)
            .slice(0, limit)
            .map(([key, entry]) => {
                const { repoFullName, branch } = parseCacheKey(key);
                return {
                    repoFullName,
                    branch: branch || entry.branch,
                    data: entry.data,
                    timestamp: entry.timestamp,
                };
            });
    },

    getForRepo(repoFullName) {
        const cache = this.getAll();
        const now = Date.now();

        return Object.entries(cache)
            .filter(([key, entry]) => {
                const { repoFullName: keyRepo } = parseCacheKey(key);
                return keyRepo === repoFullName && entry.expiresAt > now;
            })
            .sort(([, a], [, b]) => b.timestamp - a.timestamp)
            .map(([key, entry]) => {
                const { branch } = parseCacheKey(key);
                return {
                    branch: branch || entry.branch,
                    data: entry.data,
                    timestamp: entry.timestamp,
                };
            });
    },

    clearAll() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEY);
    },
};
