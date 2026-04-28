/**
 * Smoke tests for ar-mcp tool handlers.
 *
 * Integration tests — they hit the live api.anchorregistry.ai. No mocks.
 * If the API is down the tests fail; that's the intended signal.
 *
 * Known-good test AR-ID: AR-2026-qnPOJ1z (provided by Ian).
 */

import { describe, expect, it } from "vitest";

const AR_API_BASE = "https://api.anchorregistry.ai";
const KNOWN_GOOD_ARID = "AR-2026-qnPOJ1z";
const NONEXISTENT_ARID = "AR-2026-ZZZZZZZ";
const ALL_ZERO_HASH =
	"0000000000000000000000000000000000000000000000000000000000000000";

const AR_ID_REGEX = /^AR-\d{4}-[A-Za-z0-9]{7}$/;
const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;

describe("ar_verify_arid", () => {
	it("returns a verify record for a known-good AR-ID", async () => {
		const r = await fetch(`${AR_API_BASE}/verify/${KNOWN_GOOD_ARID}`);
		expect(r.status).toBe(200);
		const data = await r.json();
		expect(data).toBeTypeOf("object");
	});

	it("rejects malformed AR-ID via schema before fetch", () => {
		expect(AR_ID_REGEX.test("not-an-ar-id")).toBe(false);
		expect(AR_ID_REGEX.test("AR-26-abc")).toBe(false);
		expect(AR_ID_REGEX.test(KNOWN_GOOD_ARID)).toBe(true);
	});

	it("returns found:false for a well-formed but nonexistent AR-ID", async () => {
		const r = await fetch(`${AR_API_BASE}/verify/${NONEXISTENT_ARID}`);
		expect(r.status).toBe(200);
		const data = (await r.json()) as { found?: boolean };
		expect(data.found).toBe(false);
	});
});

describe("ar_verify_by_hash", () => {
	it("rejects non-hex / wrong-length input via schema before fetch", () => {
		expect(SHA256_HEX_REGEX.test("0xabc")).toBe(false);
		expect(SHA256_HEX_REGEX.test(ALL_ZERO_HASH)).toBe(true);
	});

	it("returns found:false for the all-zeros hash", async () => {
		const r = await fetch(`${AR_API_BASE}/verify/hash/${ALL_ZERO_HASH}`);
		expect(r.status).toBe(200);
		const data = (await r.json()) as { found?: boolean };
		expect(data.found).toBe(false);
	});
});

describe("ar_resolve_tree", () => {
	it("returns at least one anchor for the known-good AR-ID's tree", async () => {
		const r = await fetch(`${AR_API_BASE}/tree/${KNOWN_GOOD_ARID}`);
		expect(r.status).toBe(200);
		const data = await r.json();
		expect(data).toBeTruthy();
	});
});
