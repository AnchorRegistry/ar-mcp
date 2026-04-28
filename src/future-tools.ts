// FUTURE TOOLS — v0.2 and later
//
// These are fully implemented but intentionally not registered in
// AnchorRegistryMCP.init(). To enable: import the relevant register* function
// and call it from init() with the McpServer instance.
//
// Reason for deferral:
//   - registerCheckBalance, registerRegisterArtifact:
//     anchor-key credential UX is unsettled across MCP clients
//     (set-once-in-connector vs. per-call argument). Wait for patterns
//     to mature before exposing credential-bearing tools.
//   - registerSealTree:
//     irreversible on-chain action. Should not be LLM-tool-callable
//     without robust user-confirmation primitives in the MCP protocol
//     (elicitation). Deferred indefinitely.
//
// All three are written against the same api.anchorregistry.ai surface
// as the shipped tools and should activate as a single-line flip per tool.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const AR_API_BASE = "https://api.anchorregistry.ai";

const ANCHOR_KEY_REGEX = /^[a-fA-F0-9]{64}$/;
const AR_ID_REGEX = /^AR-\d{4}-[A-Za-z0-9]{7}$/;
const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;
const TOKEN_COMMITMENT_REGEX = /^0x[a-fA-F0-9]{64}$/;

const ARTIFACT_TYPES = [
	"CODE",
	"RESEARCH",
	"DATA",
	"MODEL",
	"AGENT",
	"MEDIA",
	"TEXT",
	"POST",
	"ONCHAIN",
	"REPORT",
	"NOTE",
	"WEBSITE",
	"EVENT",
	"RECEIPT",
	"OTHER",
] as const;

function asText(payload: unknown) {
	return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] };
}

async function callAuthed(
	method: "GET" | "POST",
	path: string,
	anchor_key: string,
	body?: unknown,
) {
	const r = await fetch(`${AR_API_BASE}${path}`, {
		method,
		headers: {
			accept: "application/json",
			authorization: `Bearer ${anchor_key}`,
			...(body ? { "content-type": "application/json" } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!r.ok) {
		return {
			error: r.status === 404 ? "not_found" : "api_error",
			status: r.status,
		};
	}
	return r.json();
}

/** v0.2 — flip on once anchor-key credential UX is settled. */
export function registerCheckBalance(server: McpServer) {
	server.registerTool(
		"ar_check_balance",
		{
			description:
				"Check the remaining ACCOUNT capacity for an anchor key. Returns capacity, used, and remaining. Read-only but credential-bearing — the anchor key is the bearer token for the account.",
			inputSchema: {
				anchor_key: z
					.string()
					.regex(ANCHOR_KEY_REGEX, "Must be 64 hex chars")
					.describe("Anchor key (64-char hex). Treat like a private key."),
			},
		},
		async ({ anchor_key }) => {
			const data = await callAuthed(
				"GET",
				`/account/${anchor_key}/balance`,
				anchor_key,
			);
			return asText(data);
		},
	);
}

/** v0.2 — flip on once anchor-key credential UX is settled. */
export function registerRegisterArtifact(server: McpServer) {
	server.registerTool(
		"ar_register_artifact",
		{
			description:
				"Anchor a new artifact under an existing ACCOUNT. Deducts one from capacity. Requires the anchor key. Wrong-type or wrong-title registrations cannot be reversed — confirm details with the user before calling.",
			inputSchema: {
				anchor_key: z.string().regex(ANCHOR_KEY_REGEX),
				manifest_hash: z.string().regex(SHA256_HEX_REGEX),
				artifact_type: z.enum(ARTIFACT_TYPES),
				title: z.string().min(1).max(200),
				descriptor: z.string().optional(),
			},
		},
		async ({ anchor_key, manifest_hash, artifact_type, title, descriptor }) => {
			const data = await callAuthed("POST", "/register/x402", anchor_key, {
				manifest_hash,
				artifact_type,
				title,
				descriptor,
			});
			return asText(data);
		},
	);
}

/** Deferred indefinitely — irreversible. Do not enable without explicit elicitation. */
export function registerSealTree(server: McpServer) {
	server.registerTool(
		"ar_seal_tree",
		{
			description:
				"Seal a provenance tree. PERMANENT AND IRREVERSIBLE. After sealing, no new children can be added under the tree root. Only the root AR-ID can be sealed, and only by the holder of the original anchor key.",
			inputSchema: {
				anchor_key: z.string().regex(ANCHOR_KEY_REGEX),
				ar_id: z.string().regex(AR_ID_REGEX),
				reason: z.string().min(1).max(500),
				token_commitment: z
					.string()
					.regex(
						TOKEN_COMMITMENT_REGEX,
						"`0x` + SHA-256(anchor_key || ar_id), 0x + 64 hex chars",
					),
				new_tree_root: z.string().optional(),
			},
		},
		async ({ anchor_key, ar_id, reason, token_commitment, new_tree_root }) => {
			const data = await callAuthed("POST", "/registration/seal", anchor_key, {
				ar_id,
				reason,
				token_commitment,
				new_tree_root: new_tree_root ?? "",
			});
			return asText(data);
		},
	);
}
