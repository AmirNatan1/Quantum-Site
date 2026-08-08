import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../dist/client/", import.meta.url);
const directory = decodeURIComponent(root.pathname.slice(1));
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".rsc": "text/x-component; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
};

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const route = pathname === "/" ? "index.html" : pathname.endsWith("/") ? `${pathname.slice(1)}.html` : pathname.slice(1);
  const candidates = [route, `${route}.html`, join(route, "index.html")];
  const relative = candidates.find((candidate) => {
    const file = normalize(join(directory, candidate));
    return file.startsWith(normalize(directory)) && existsSync(file) && statSync(file).isFile();
  });
  if (!relative) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const file = normalize(join(directory, relative));
  response.writeHead(200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
    "cache-control": relative.startsWith("assets") ? "public, max-age=31536000, immutable" : "no-cache",
  });
  createReadStream(file).pipe(response);
});

const shutdown = () => {
  server.close(() => process.exit(0));
  server.closeAllConnections();
  setTimeout(() => process.exit(0), 1_000).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(3000, "127.0.0.1", () => {
  console.log("Static test server listening on http://127.0.0.1:3000");
});
