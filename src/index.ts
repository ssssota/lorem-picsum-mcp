import { register } from "chapplin:register";
import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";

const serverInfo = {
	name: "lorem-picsum-mcp",
	version: "1.0.0",
};

// HTTP transport mode (for web usage)
const app = new Hono();

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// MCP endpoint using StreamableHTTPTransport (new server per request)
app.all("/mcp", async (c) => {
	const server = new McpServer(serverInfo);
	register(server);
	const transport = new StreamableHTTPTransport();
	await server.connect(transport);
	return transport.handleRequest(c);
});

export default app;
