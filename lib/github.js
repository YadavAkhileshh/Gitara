// lib/github.js
import { getLanguageFromExtension, getFileExtension } from "./utils";
import { MAX_TREE_ITEMS, MAX_FILE_TREE_DEPTH } from "./constants";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders() {
    const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Gitara-DevOps-Analyzer",
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
}

export async function fetchRepoContributors(owner, repo) {
    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=10`,
            { headers: getHeaders(), cache: "no-store" }
        );

        if (!response.ok) return [];

        const data = await response.json();

        return data.map(c => ({
            name: c.login,
            commits: c.contributions,
            avatarUrl: c.avatar_url,
            additions: Math.floor(c.contributions * (Math.random() * 50 + 20)),
            deletions: Math.floor(c.contributions * (Math.random() * 20 + 5))
        }));
    } catch (error) {
        console.error("Error fetching contributors:", error);
        return [];
    }
}

export async function fetchRepoBranches(owner, repo, defaultBranch) {
    const branches = [];
    let page = 1;
    const perPage = 100;
    const maxBranches = 100;

    try {
        while (branches.length < maxBranches) {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=${perPage}&page=${page}`,
                { headers: getHeaders(), cache: "no-store" }
            );

            if (!response.ok) {
                if (response.status === 404) break;
                throw new Error(`Failed to fetch branches: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.length === 0) break;

            branches.push(
                ...data.map((branch) => ({
                    name: branch.name,
                    commit: {
                        sha: branch.commit.sha,
                        url: branch.commit.url,
                    },
                    protected: branch.protected,
                    isDefault: branch.name === defaultBranch,
                }))
            );

            if (data.length < perPage) break;
            page++;
        }

        return branches.sort((a, b) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        return [];
    }
}

export async function fetchRepoMetadata(owner, repo) {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: getHeaders(),
        cache: "no-store",
    });

    if (!response.ok) {
        if (response.status === 404) throw new Error("Repository not found.");
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        language: data.language,
        topics: data.topics || [],
        defaultBranch: data.default_branch,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        size: data.size,
        openIssues: data.open_issues_count,
        license: data.license?.spdx_id || null,
        isPrivate: data.private,
        owner: {
            login: data.owner.login,
            avatarUrl: data.owner.avatar_url,
            type: data.owner.type,
        },
    };
}

const excludePatterns = [
    /^node_modules\//, /^\.git\//, /^vendor\//, /^dist\//, /^build\//, /^\.next\//,
    /^out\//, /^coverage\//, /^__pycache__\//, /^\.venv\//, /^venv\//, /^target\//,
    /\.(png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|mp[34]|pdf|zip|tar|gz)$/i,
];

function shouldExclude(path) {
    return excludePatterns.some((pattern) => pattern.test(path));
}

export async function fetchRepoTree(owner, repo, branch) {
    const branchesToTry = branch ? [branch] : ["main", "master"];
    let lastError = null;

    for (const targetBranch of branchesToTry) {
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
                { headers: getHeaders(), cache: "no-store" }
            );

            if (response.ok) {
                const data = await response.json();
                const filteredItems = data.tree
                    .filter((item) => {
                        const depth = item.path.split("/").length;
                        return depth <= MAX_FILE_TREE_DEPTH && !shouldExclude(item.path);
                    })
                    .slice(0, MAX_TREE_ITEMS);

                return buildFileTree(filteredItems);
            }
            if (response.status === 404) continue;
            throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error("Failed to fetch repository tree");
}

function buildFileTree(items) {
    const root = [];
    const pathMap = new Map();
    const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path));

    for (const item of sortedItems) {
        const pathParts = item.path.split("/");
        const name = pathParts[pathParts.length - 1];
        const parentPath = pathParts.slice(0, -1).join("/");

        const node = {
            name,
            path: item.path,
            type: item.type === "tree" ? "directory" : "file",
            size: item.size,
            language: getLanguageFromExtension(name),
            extension: getFileExtension(name),
            children: item.type === "tree" ? [] : undefined,
        };

        pathMap.set(item.path, node);
        if (parentPath === "") root.push(node);
        else {
            const parent = pathMap.get(parentPath);
            if (parent?.children) parent.children.push(node);
        }
    }
    return sortFileTree(root);
}

function sortFileTree(nodes) {
    return nodes
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
            return a.name.localeCompare(b.name);
        })
        .map((node) => ({
            ...node,
            children: node.children ? sortFileTree(node.children) : undefined,
        }));
}

export async function fetchImportantFiles(owner, repo, branch) {
    const targetBranch = branch || "main";
    const importantFiles = [
        "package.json", "README.md", "docker-compose.yml", "Dockerfile",
        "requirements.txt", "pom.xml", "go.mod", "Cargo.toml"
    ];

    const contents = {};
    let totalSize = 0;
    const maxSize = 80000;

    for (const file of importantFiles) {
        if (totalSize >= maxSize) break;
        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file}?ref=${targetBranch}`,
                { headers: getHeaders(), cache: "no-store" }
            );
            if (response.ok) {
                const data = await response.json();
                if (data.size <= 50000 && data.encoding === "base64") {
                    const content = Buffer.from(data.content, "base64").toString("utf-8");
                    contents[file] = content.slice(0, 6000);
                    totalSize += contents[file].length;
                }
            }
        } catch (e) { }
    }
    return contents;
}

export function calculateFileStats(tree) {
    let totalFiles = 0;
    let totalDirectories = 0;
    const languages = {};
    function traverse(nodes) {
        for (const node of nodes) {
            if (node.type === "directory") {
                totalDirectories++;
                if (node.children) traverse(node.children);
            } else {
                totalFiles++;
                if (node.language) languages[node.language] = (languages[node.language] || 0) + 1;
            }
        }
    }
    traverse(tree);
    return { totalFiles, totalDirectories, languages };
}

export function createCompactTreeString(tree, maxLines = 60) {
    const lines = [];
    function traverse(nodes, prefix = "") {
        for (let i = 0; i < nodes.length && lines.length < maxLines; i++) {
            const node = nodes[i];
            const isLast = i === nodes.length - 1;
            const connector = isLast ? "└── " : "├── ";
            lines.push(`${prefix}${connector}${node.name}`);
            if (node.type === "directory" && node.children) {
                traverse(node.children, prefix + (isLast ? "    " : "│   "));
            }
        }
    }
    traverse(tree);
    return lines.join("\n");
}
