
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AgenticBridge } from "../bridge/agentic";
import { readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

// Initialize the Agentic Bridge
const bridge = new AgenticBridge();

// Create the MCP Server
const server = new McpServer({
    name: "vault-kit",
    version: "0.1.0"
});

// RESOURCE: vault://audit/latest
// Reads the last 10 entries from the privacy audit log
server.resource(
    "audit-log",
    "vault://audit/latest",
    async (uri) => {
        try {
            const logPath = join(homedir(), ".vault", "memory", "privacy_audit.json");
            const content = await readFile(logPath, "utf-8");
            const data = JSON.parse(content);

            // Get last 10 entries if it's an array, or just return content
            let snippet = "";
            if (Array.isArray(data)) {
                snippet = JSON.stringify(data.slice(-10), null, 2);
            } else if (data.items && Array.isArray(data.items)) {
                snippet = JSON.stringify(data.items.slice(-10), null, 2);
            } else {
                snippet = JSON.stringify(data, null, 2);
            }

            return {
                contents: [{
                    uri: uri.href,
                    text: snippet
                }]
            };
        } catch (error) {
            // Return empty or error info if log doesn't exist yet
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify({ error: "Log not found or empty", details: String(error) })
                }]
            };
        }
    }
);

// RESOURCE: vault://status
// Returns the current status of the circuit breaker
server.resource(
    "vault-status",
    "vault://status",
    async (uri) => {
        // We need to implement a 'status' method in AgenticBridge or use a raw call
        // The bridge supports 'status' action.
        // We will add a getStatus method to AgenticBridge or manually invoke runPython

        // HACK: Accessing private method via type casting or just implementing exposure
        // For now, let's assume valid response structure
        // We need to extend AgenticBridge in the codebase to have public getStatus first? 
        // Or just invoke checkAccess with dummy to check state?
        // Actually, let's just create a raw payload

        // For now, let's skip rigorous typing on the bridge
        return {
            contents: [{
                uri: uri.href,
                text: "Status check not fully implemented in bridge class yet"
            }]
        };
    }
);

// TOOL: check_access
server.tool(
    "check_access",
    "Check if accessing a vault ID is allowed by the privacy circuit breaker",
    {
        vault_id: z.string().describe("The specific vault ID to check")
    },
    async ({ vault_id }) => {
        const allowed = await bridge.checkAccess(vault_id);
        return {
            content: [{
                type: "text",
                text: JSON.stringify({ allowed, vault_id })
            }]
        };
    }
);

// TOOL: log_access
server.tool(
    "log_access",
    "Log an access attempt to the immutable privacy ledger",
    {
        vault_id: z.string().describe("The vault ID accessed"),
        success: z.boolean().describe("Whether the access was successful"),
        context: z.string().optional().describe("Additional context as JSON string")
    },
    async ({ vault_id, success, context }) => {
        let parsedContext = {};
        if (context) {
            try {
                parsedContext = JSON.parse(context);
            } catch {
                parsedContext = { raw: context };
            }
        }

        await bridge.recordAccess(vault_id, success, parsedContext);
        return {
            content: [{
                type: "text",
                text: `Logged access for ${vault_id}: ${success ? "SUCCESS" : "FAILURE"}`
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Vault-Kit MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
