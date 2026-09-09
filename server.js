const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 8787);
const password = process.env.DEMO_PASSWORD || "";
const root = __dirname;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) req.destroy();
    });
    req.on("end", () => resolve(body));
  });
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sessionToken() {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function hasSession(req) {
  if (!password) return true;
  const cookie = req.headers.cookie || "";
  return cookie.includes(`demo_session=${sessionToken()}`);
}

function sendLogin(res, error = false) {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acceso demo</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#263445}
      form{width:min(380px,calc(100vw - 32px));background:white;border:1px solid #cbd5df;border-radius:4px;padding:24px;box-shadow:0 8px 22px rgba(32,41,54,.08)}
      h1{font-size:20px;margin:0 0 6px}
      p{margin:0 0 18px;color:#718094;line-height:1.4}
      label{display:grid;gap:7px;font-size:12px;font-weight:700;text-transform:uppercase;color:#718094}
      input{min-height:40px;border:1px solid #cbd5df;border-radius:4px;padding:0 10px;font-size:15px}
      button{width:100%;min-height:40px;margin-top:14px;border:0;border-radius:4px;background:#006fb6;color:white;font-weight:700;cursor:pointer}
      .error{color:#d04437;font-size:13px;margin-top:12px}
    </style>
  </head>
  <body>
    <form method="post" action="/login">
      <h1>Solicitudes corporativas</h1>
      <p>Demo privada para revision del equipo de Tecnologia.</p>
      <label>Clave de acceso<input name="password" type="password" autocomplete="current-password" autofocus></label>
      <button>Entrar</button>
      ${error ? '<div class="error">Clave incorrecta.</div>' : ""}
    </form>
  </body>
</html>`);
}

function serveFile(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const file = path.normalize(path.join(root, requested));

  if (!file.startsWith(root) || file.includes(".git") || file.includes(".openai")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, "index.html"), (fallbackErr, fallback) => {
        if (fallbackErr) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "content-type": types[".html"] });
        res.end(fallback);
      });
      return;
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/login" && req.method === "POST") {
    const body = await readBody(req);
    const value = new URLSearchParams(body).get("password") || "";
    if (password && timingSafeEqual(value, password)) {
      res.writeHead(302, {
        "set-cookie": `demo_session=${sessionToken()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`,
        location: "/"
      });
      res.end();
      return;
    }
    sendLogin(res, true);
    return;
  }

  if (!hasSession(req)) {
    sendLogin(res);
    return;
  }

  serveFile(req, res);
});

server.listen(port, () => {
  console.log(`Demo listening on ${port}`);
});
