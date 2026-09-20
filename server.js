const http = require("node:http");

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Docker Web App</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      padding: 24px; font-family: system-ui, sans-serif;
      background: #0f172a; color: #f8fafc;
    }
    main {
      width: 100%; max-width: 640px; padding: 48px;
      background: #1e293b; border: 1px solid #334155;
      border-radius: 24px;
    }
    h1 { font-size: clamp(32px, 6vw, 48px); margin: 16px 0; }
    p { color: #cbd5e1; line-height: 1.7; }
    .badge { color: #5eead4; font-weight: 600; }
    a {
      display: inline-block; margin-top: 16px; padding: 12px 20px;
      color: #0f172a; background: #5eead4; border-radius: 8px;
      text-decoration: none; font-weight: 700;
    }
    a:focus-visible { outline: 3px solid white; outline-offset: 4px; }
  </style>
</head>
<body>
  <main>
    <span class="badge">YOUR WEB SERVER IS RUNNING</span>
    <h1>Hello from Dockers.</h1>
    <p>Your containerized application is ready to use.
       Edit this page to make it your own, then rebuild with Docker Compose.</p>
    <a href="/health">Check server health</a>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"
  );
  res.setHeader("Cache-Control", "no-store");

  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }

  const path = req.url.split("?")[0];
  let status = 200;
  let type = "text/html; charset=utf-8";
  let body = page;

  if (path === "/health") {
    type = "application/json";
    body = JSON.stringify({
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime())
    });
  } else if (path !== "/") {
    status = 404;
    type = "text/plain; charset=utf-8";
    body = "Page not found";
  }

  res.writeHead(status, { "Content-Type": type });
  res.end(req.method === "HEAD" ? undefined : body);
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(3000, "0.0.0.0", () => {
  console.log("Web server listening on port 3000");
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  });
}