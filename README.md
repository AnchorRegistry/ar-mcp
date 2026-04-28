# ar-mcp

The AnchorRegistry MCP server. Resolve any AR-ID, manifest hash, or
provenance tree from any MCP-compatible AI client.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-2024--11--05-6ea8ff)](https://modelcontextprotocol.io)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020)](https://workers.cloudflare.com)

Endpoint: `https://mcp.anchorregistry.ai/mcp`

## Install

### Claude Desktop
Settings → Integrations → Add server.
URL: `https://mcp.anchorregistry.ai/mcp`

### Claude Code
```bash
claude mcp add --transport http anchorregistry https://mcp.anchorregistry.ai/mcp
```

### Cursor
Settings → MCP → Add new MCP server.
Name: `anchorregistry` · Type: `http` · URL: `https://mcp.anchorregistry.ai/mcp`

## Tools

### `ar_verify_arid`
Resolves an AR-ID to its full provenance record.

> "What's at AR-2026-qnPOJ1z?"

### `ar_verify_by_hash`
Resolves an artifact by SHA-256 manifest hash.

### `ar_resolve_tree`
Returns the full provenance tree for any AR-ID.

## How it works

`ar-mcp` is a thin proxy. Every tool call hits `api.anchorregistry.ai`
and returns the JSON unchanged. No data is logged, no credentials are
stored, no state is held between requests.

The full surface is documented at:
- https://anchorregistry.ai/llms.txt
- https://anchorregistry.ai/agents.json
- https://api.anchorregistry.ai/openapi.json

## Roadmap

v0.2 will add `ar_check_balance` and `ar_register_artifact` once the MCP
credential-handling pattern stabilizes across clients. `ar_seal_tree` is
deferred indefinitely (irreversible action; needs robust user-confirmation
primitives the protocol does not yet provide). The deferred tools are
fully implemented and live in [`src/future-tools.ts`](src/future-tools.ts) —
enabling them is a one-line flip per tool.

## Develop

```bash
npm install
npm test           # vitest, hits live api.anchorregistry.ai
npm run type-check
npm run dev        # wrangler dev — http://localhost:8787
npm run deploy     # wrangler deploy
```

Verify locally with the MCP inspector:
```bash
npx @modelcontextprotocol/inspector http://localhost:8787/mcp
```

## License

MIT.

## See also

- AnchorRegistry: https://anchorregistry.com
- Python SDK: https://pypi.org/project/anchorregistry/
- Source: https://github.com/AnchorRegistry/ar-mcp
- Spec: https://anchorregistry.ai/agents.json
- Contracts: https://github.com/AnchorRegistry/ar-contracts-v1
