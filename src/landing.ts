export const LANDING_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ar-mcp · AnchorRegistry MCP server</title>
<meta name="description" content="Remote MCP server for AnchorRegistry. Resolve any AR-ID, manifest hash, or provenance tree from any MCP-compatible AI client.">
<link rel="canonical" href="https://mcp.anchorregistry.ai/">
<style>
  :root { color-scheme: dark; }
  body { font: 15px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; max-width: 720px; margin: 4rem auto; padding: 0 1.25rem; color: #e6e8eb; background: #0c1020; }
  h1 { font-size: 1.4rem; margin-bottom: .25rem; }
  h2 { font-size: 1rem; margin-top: 2rem; color: #8aa0ff; }
  p { color: #b9c0cc; }
  a { color: #6ea8ff; }
  code, pre { background: #161b30; border: 1px solid #2a3358; border-radius: 6px; }
  code { padding: .12rem .35rem; }
  pre { padding: .8rem 1rem; overflow-x: auto; font-size: 13px; }
  ul { padding-left: 1.2rem; }
  li { margin: .25rem 0; }
  .lede { color: #cfd6e3; }
</style>
</head>
<body>
<h1>ar-mcp</h1>
<p class="lede">The AnchorRegistry MCP server. Resolve any AR-ID, manifest hash, or provenance tree from any MCP-compatible AI client. Authless, read-only, free.</p>

<h2>Install</h2>
<p><strong>Claude Desktop</strong> — Settings → Integrations → Add server, URL: <code>https://mcp.anchorregistry.ai/mcp</code></p>
<p><strong>Claude Code</strong></p>
<pre>claude mcp add --transport http anchorregistry https://mcp.anchorregistry.ai/mcp</pre>
<p><strong>Cursor</strong> — Settings → MCP → Add new MCP server, type <code>http</code>, URL <code>https://mcp.anchorregistry.ai/mcp</code></p>

<h2>Tools (v0.1)</h2>
<ul>
  <li><code>ar_verify_arid</code> — resolve an AR-ID to its full provenance record</li>
  <li><code>ar_verify_by_hash</code> — resolve an artifact by SHA-256 manifest hash</li>
  <li><code>ar_resolve_tree</code> — full provenance tree for any AR-ID</li>
</ul>

<h2>How it works</h2>
<p>ar-mcp is a thin proxy. Every tool call hits <code>api.anchorregistry.ai</code> and returns the JSON unchanged. No data is logged, no credentials are stored, no state is held between requests.</p>

<h2>See also</h2>
<ul>
  <li><a href="https://anchorregistry.com">anchorregistry.com</a> — main site</li>
  <li><a href="https://anchorregistry.ai/llms.txt">llms.txt</a> · <a href="https://anchorregistry.ai/agents.json">agents.json</a></li>
  <li><a href="https://api.anchorregistry.ai/openapi.json">OpenAPI spec</a> · <a href="https://api.anchorregistry.ai/docs">Swagger UI</a></li>
  <li><a href="https://github.com/AnchorRegistry/ar-mcp">Source</a> · <a href="https://pypi.org/project/anchorregistry/">Python SDK</a></li>
</ul>
</body>
</html>`;
