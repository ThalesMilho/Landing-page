const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");
const API_TARGET = "http://localhost:3001";

const MIME = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
};

http.createServer((req, res) => {
  // Proxy API calls to backend
  if (req.url.startsWith("/api/")) {
    const apiUrl = API_TARGET + req.url;
    const options = {
      hostname: "localhost",
      port: 3001,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const apiReq = http.request(options, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    });

    apiReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "API unavailable", details: err.message }));
    });

    if (req.method !== "GET" && req.method !== "HEAD") {
      req.pipe(apiReq);
    } else {
      apiReq.end();
    }
    return;
  }

  // Serve static files
  let filePath = path.join(DIST, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);

  if (!fs.existsSync(filePath) || !ext) {
    filePath = path.join(DIST, "index.html");
  }

  const mime = MIME[path.extname(filePath)] || "text/plain";
  res.writeHead(200, { "Content-Type": mime });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log("Frontend running on port " + PORT);
});