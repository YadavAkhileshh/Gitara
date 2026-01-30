import Groq from "groq-sdk";
import {
    fetchRepoMetadata,
    fetchRepoTree,
    fetchImportantFiles,
    fetchRepoBranches,
    calculateFileStats,
    createCompactTreeString,
    fetchRepoContributors,
} from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { url, branch } = await request.json();

        const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+\/[^\/\s?#]+)/;
        const match = url.match(githubRegex);
        if (!match) return Response.json({ error: "Invalid GitHub URL" }, { status: 400 });

        const [owner, repo] = match[1].replace(/\.git$/, "").split("/");

        // 1. Fetch Metadata
        const metadata = await fetchRepoMetadata(owner, repo);
        const targetBranch = branch || metadata.defaultBranch;

        // 2. Fetch Tree, Important Files, and Contributors
        const [tree, importantFiles, branches, contributors] = await Promise.all([
            fetchRepoTree(owner, repo, targetBranch),
            fetchImportantFiles(owner, repo, targetBranch),
            fetchRepoBranches(owner, repo, metadata.defaultBranch),
            fetchRepoContributors(owner, repo),
        ]);

        const fileStats = calculateFileStats(tree);
        const compactTree = createCompactTreeString(tree);

        const filesContext = Object.entries(importantFiles)
            .map(([name, content]) => `FILE: ${name}\nCONTENT:\n${content}\n---`)
            .join("\n");

        const prompt = `
    Analyze this GitHub repository: ${metadata.fullName} (Branch: ${targetBranch})
    Description: ${metadata.description || 'No description'}
    Main Language: ${metadata.language || 'Unknown'}
    
    File Structure:
    ${compactTree}
    
    File Contents:
    ${filesContext}
    
    Task: Provide an extremely deep technical analysis in JSON format.
    Return ONLY JSON with these fields:
    - summary: Executive summary
    - whatItDoes: Layman explanation
    - scores: { architecture, security, documentation, codeQuality, maintainability, performance, testCoverage, dependencies } (0-100)
    - insights: Array of { title, description, type: 'info'|'warning'|'success' }
    - architecture: Array of components
    - techStack: Array of technologies
    - refactors: Array of { title, description, priority: 'low'|'medium'|'high' }
    - automations: DevOps/CI/CD suggestions
    - dataFlow: { nodes, edges } for a simplified diagram
    - hotFiles: Array of active/important files
    - codeSmells: Array of technical debt items
    - opportunities: Array of enhancement ideas
    - outdatedDeps: Number of potentially outdated dependencies (estimate)
    - securityIssues: Number of potential security issues (estimate)
    - technicalDebtHours: Estimated hours of technical debt
    - cyclomaticComplexity: Estimated average cyclomatic complexity (e.g., "4.2")
    - maintainabilityIndex: Estimated maintainability index (0-100)
    - maintainabilityGrade: Grade letter (A, B, C, D, F)
    - codeSmellsCount: Number of code smells detected
    - performance: { bundleSize, loadTime, memoryUsage, cpuUsage } (estimated strings like "2.3MB", "1.2s", etc.)
    `;

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const result = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // Send initial metadata
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: "metadata",
                    data: {
                        metadata,
                        fileTree: tree,
                        fileStats,
                        branch: targetBranch,
                        availableBranches: branches,
                        contributors
                    }
                })}\n\n`));

                // Stream AI content
                for await (const chunk of result) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                            type: "content",
                            data: content
                        })}\n\n`));
                    }
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("Analysis API Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
