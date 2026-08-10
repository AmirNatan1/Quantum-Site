import { readFileSync } from "node:fs";
import { join, posix } from "node:path";

function cleanLines(source) {
  return source
    .split(/\r?\n/u)
    .map((line) => line.replace(/\s+$/u, ""));
}

function assertInternalPath(value, label) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    value.includes("*") ||
    posix.normalize(value) !== value
  ) {
    throw new Error(`${label} must be an exact normalized internal path: ${value}`);
  }
}

export function parsePagesRedirects(source) {
  const rules = [];
  for (const line of cleanLines(source)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/u);
    if (parts.length !== 3 || parts[2] !== "200") {
      throw new Error(`Unsupported Pages proxy rule: ${trimmed}`);
    }
    const [from, to] = parts;
    assertInternalPath(from, "Pages proxy source");
    assertInternalPath(to, "Pages proxy destination");
    rules.push({ from, to, status: 200 });
  }
  return rules;
}

function assertHeaderPattern(pattern) {
  if (!pattern.startsWith("/") || pattern.startsWith("//") || pattern.includes("\\")) {
    throw new Error(`Unsupported Pages header path: ${pattern}`);
  }
  const stars = [...pattern].filter((character) => character === "*").length;
  if (stars > 1 || (stars === 1 && !pattern.endsWith("*") && !pattern.startsWith("/*"))) {
    throw new Error(`Unsupported Pages header wildcard: ${pattern}`);
  }
}

export function parsePagesHeaders(source) {
  const rules = [];
  let activeRule = null;
  for (const line of cleanLines(source)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (!/^\s/u.test(line)) {
      assertHeaderPattern(trimmed);
      activeRule = { pattern: trimmed, headers: new Map() };
      rules.push(activeRule);
      continue;
    }
    if (!activeRule) throw new Error(`Pages header has no path: ${trimmed}`);
    const separator = trimmed.indexOf(":");
    if (separator <= 0) throw new Error(`Malformed Pages header: ${trimmed}`);
    const name = trimmed.slice(0, separator).trim().toLowerCase();
    const value = trimmed.slice(separator + 1).trim();
    if (!value) throw new Error(`Empty Pages header value: ${trimmed}`);
    if (activeRule.headers.has(name)) throw new Error(`Duplicate ${name} header in ${activeRule.pattern}`);
    activeRule.headers.set(name, value);
  }
  return rules;
}

function matchesHeaderPattern(pattern, pathname) {
  const wildcard = pattern.indexOf("*");
  if (wildcard === -1) return pattern === pathname;
  const prefix = pattern.slice(0, wildcard);
  const suffix = pattern.slice(wildcard + 1);
  return pathname.startsWith(prefix) && pathname.endsWith(suffix);
}

export function headersForPagesRequest(pathnames, rules) {
  const headers = new Map();
  const matched = new Set();
  for (const pathname of pathnames) {
    rules.forEach((rule, index) => {
      if (matched.has(index) || !matchesHeaderPattern(rule.pattern, pathname)) return;
      matched.add(index);
      for (const [name, value] of rule.headers) {
        if (headers.has(name)) throw new Error(`Duplicate matched ${name} header for ${pathname}`);
        headers.set(name, value);
      }
    });
  }
  return headers;
}

export function resolvePagesProxy(pathname, rules) {
  const matches = rules.filter((rule) => rule.from === pathname);
  if (matches.length > 1) throw new Error(`Duplicate Pages proxy for ${pathname}`);
  return matches[0]?.to ?? pathname;
}

export function loadPagesStaticArtifacts(directory) {
  const redirects = parsePagesRedirects(readFileSync(join(directory, "_redirects"), "utf8"));
  const headerRules = parsePagesHeaders(readFileSync(join(directory, "_headers"), "utf8"));
  const rootTarget = resolvePagesProxy("/.rsc", redirects);
  if (rootTarget !== "/index.rsc") throw new Error("The built Pages artifact must proxy /.rsc to /index.rsc");
  const rscHeaders = headersForPagesRequest(["/.rsc", rootTarget], headerRules);
  if (!rscHeaders.get("content-type")?.toLowerCase().startsWith("text/x-component")) {
    throw new Error("The built Pages artifact must define an RSC Content-Type");
  }
  return { redirects, headerRules };
}
