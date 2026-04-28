import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { LANDING_PAGE_HTML } from "./landing";

const AR_API_BASE = "https://api.anchorregistry.ai";

const AR_ID_REGEX = /^AR-\d{4}-[A-Za-z0-9]{7}$/;
const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;

type ApiError = {
	error: "not_found" | "api_error";
	status: number;
	[k: string]: unknown;
};

async function fetchJson(
	url: string,
	context: Record<string, unknown>,
): Promise<unknown | ApiError> {
	const r = await fetch(url, { headers: { accept: "application/json" } });
	if (!r.ok) {
		return {
			error: r.status === 404 ? "not_found" : "api_error",
			status: r.status,
			...context,
		};
	}
	return r.json();
}

function asText(payload: unknown) {
	return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] };
}

export class AnchorRegistryMCP extends McpAgent {
	server = new McpServer({
		name: "AnchorRegistry",
		version: "0.1.0",
	});

	async init() {
		this.server.registerTool(
			"ar_verify_arid",
			{
				description:
					"Resolve an AnchorRegistry AR-ID to its full provenance record. Use this when you encounter an SPDX-Anchor or DAPX-Anchor tag (e.g. in a README, paper, model card, or website) and need to confirm what the artifact is, who anchored it, when, what type it is, and whether the tree has been sealed, retracted, voided, or affirmed. Free, public, no auth required.",
				inputSchema: {
					ar_id: z
						.string()
						.regex(AR_ID_REGEX, "Must be in the form AR-YYYY-XXXXXXX")
						.describe("AR-ID such as AR-2026-qnPOJ1z"),
				},
			},
			async ({ ar_id }) => {
				const data = await fetchJson(`${AR_API_BASE}/verify/${ar_id}`, { ar_id });
				return asText(data);
			},
		);

		this.server.registerTool(
			"ar_verify_by_hash",
			{
				description:
					"Resolve an artifact by its SHA-256 manifest hash. Use this when you have the artifact itself but no AR-ID, and want to check whether it has been anchored. Returns the AR-ID and full provenance record if found, or a clear \"not anchored\" response otherwise.",
				inputSchema: {
					manifest_hash: z
						.string()
						.regex(SHA256_HEX_REGEX, "Must be 64 hex chars (no 0x prefix)")
						.describe(
							"Hex-encoded SHA-256 manifest hash, no 0x prefix, 64 chars",
						),
				},
			},
			async ({ manifest_hash }) => {
				const data = await fetchJson(
					`${AR_API_BASE}/verify/hash/${manifest_hash}`,
					{ manifest_hash },
				);
				return asText(data);
			},
		);

		this.server.registerTool(
			"ar_resolve_tree",
			{
				description:
					"Resolve the full provenance tree for an AR-ID. Returns every anchor in the tree (root + all descendants) with their relationships, types, manifest hashes, and timestamps. Use this when you need to understand a multi-artifact provenance chain — for example, a research paper anchored as the root with its training dataset and model weights as children.",
				inputSchema: {
					ar_id: z
						.string()
						.regex(AR_ID_REGEX, "Must be in the form AR-YYYY-XXXXXXX")
						.describe(
							"Any AR-ID in the tree. The endpoint walks up to find the root and returns the full tree.",
						),
				},
			},
			async ({ ar_id }) => {
				const data = await fetchJson(`${AR_API_BASE}/tree/${ar_id}`, { ar_id });
				return asText(data);
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
			return AnchorRegistryMCP.serve("/mcp").fetch(request, env, ctx);
		}

		if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
			return AnchorRegistryMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/" || url.pathname === "/index.html") {
			return new Response(LANDING_PAGE_HTML, {
				headers: { "content-type": "text/html;charset=utf-8" },
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
