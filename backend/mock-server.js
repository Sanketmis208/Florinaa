const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const publicDir = path.join(root, "..", "client", "public-legacy");
const dbPath = path.join(root, "data", "db.json");
const port = Number(process.env.PORT || 3000);
const attempts = new Map();

loadEnv();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon"
};

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = (match[2] || "").replace(/^["']|["']$/g, "");
  });
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    ...headers
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 4_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(part => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  const secret = process.env.ADMIN_JWT_SECRET;
  const encoded = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verify(token) {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || !token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (Buffer.byteLength(sig) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  return payload.exp > Date.now() ? payload : null;
}

function notify(event, payload) {
  if (!process.env.EMAIL_WEBHOOK_URL) return;
  fetch(process.env.EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, payload, to: process.env.ADMIN_NOTIFICATION_EMAIL || "" })
  }).catch(() => {});
}

function requireAdmin(req, res) {
  const user = verify(parseCookies(req).florinaa_admin);
  if (!user) {
    send(res, 401, { error: "Unauthorized" });
    return null;
  }
  return user;
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || crypto.randomUUID();
}

function normalizeProduct(input, existing = {}) {
  return {
    id: existing.id || slug(input.name),
    name: String(input.name || existing.name || "").trim(),
    category: String(input.category || existing.category || "").trim(),
    gsm: String(input.gsm || existing.gsm || "").trim(),
    // dimensions: String(input.dimensions || existing.dimensions || "").trim(),
    material: String(input.material || existing.material || "").trim(),
    washCare: Array.isArray(input.washCare) ? input.washCare : String(input.washCare || existing.washCare || "").split(",").map(v => v.trim()).filter(Boolean),
    images: Array.isArray(input.images) ? input.images : String(input.images || existing.images || "").split("\n").map(v => v.trim()).filter(Boolean),
    visible: typeof input.visible === "boolean" ? input.visible : existing.visible !== false
  };
}

async function api(req, res, pathname) {
  const db = readDb();

  const pageMatch = pathname.match(/^\/api\/pages\/([^/]+)$/);
  if (req.method === "GET" && pageMatch) {
    const page = pageMatch[1] === "home" ? "home" : slug(pageMatch[1]);
    const pages = {
      home: { path: "/", title: "Florinaa - Sleep in Style", description: db.content.heroSubtitle },
      about: { path: "/about", title: "About Florinaa", description: db.content.about },
      facility: { path: "/facility", title: "Florinaa Machinery & Facility", description: "Manufacturing capability, quality control, packaging, and facility highlights." },
      products: { path: "/products", title: "Florinaa Product Collection", description: "Blankets, dohars, fitted sheets, quilts, bed sheets, flano carpets, bath mats, and rugs." },
      contact: { path: "/contact", title: "Contact Florinaa", description: "Reach Florinaa at the plant or Panipat office for product inquiries and catalogue requests." }
    };
    if (!pages[page]) return send(res, 404, { error: "Page not found" });
    return send(res, 200, { page, ...pages[page] });
  }

  if (req.method === "GET" && pathname === "/api/site") {
    const categories = db.categories.sort((a, b) => a.order - b.order);
    return send(res, 200, {
      categories,
      products: db.products.filter(product => product.visible),
      content: db.content
    });
  }

  if (req.method === "POST" && pathname === "/api/inquiries") {
    const body = await readBody(req);
    const inquiry = { id: crypto.randomUUID(), type: "inquiry", status: "new", createdAt: new Date().toISOString(), ...body };
    db.inquiries.unshift(inquiry);
    writeDb(db);
    notify("florinaa.inquiry.created", inquiry);
    return send(res, 201, { ok: true, inquiry });
  }

  if (req.method === "POST" && pathname === "/api/leads") {
    const body = await readBody(req);
    const lead = { id: crypto.randomUUID(), status: "new", createdAt: new Date().toISOString(), ...body };
    db.leads.unshift(lead);
    writeDb(db);
    notify("florinaa.catalogue.lead.created", lead);
    return send(res, 201, { ok: true, lead, catalogueUrl: db.content.catalogueUrl });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const envReady = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_JWT_SECRET;
    if (!envReady) return send(res, 500, { error: "Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JWT_SECRET in .env before logging in." });
    const ip = req.socket.remoteAddress || "local";
    const bucket = attempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    if (bucket.resetAt < Date.now()) {
      bucket.count = 0;
      bucket.resetAt = Date.now() + 15 * 60 * 1000;
    }
    if (bucket.count >= 5) return send(res, 429, { error: "Too many login attempts. Try again later." });
    const body = await readBody(req);
    const ok = body.email === process.env.ADMIN_EMAIL && body.password === process.env.ADMIN_PASSWORD;
    if (!ok) {
      bucket.count += 1;
      attempts.set(ip, bucket);
      return send(res, 401, { error: "Invalid credentials" });
    }
    attempts.delete(ip);
    const token = sign({ email: body.email, exp: Date.now() + 12 * 60 * 60 * 1000 });
    return send(res, 200, { ok: true }, { "Set-Cookie": `florinaa_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200` });
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    return send(res, 200, { ok: true }, { "Set-Cookie": "florinaa_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  }

  if (pathname.startsWith("/api/admin") && !requireAdmin(req, res)) return;

  if (req.method === "GET" && pathname === "/api/admin/all") {
    return send(res, 200, db);
  }

  if (req.method === "POST" && pathname === "/api/admin/products") {
    const product = normalizeProduct(await readBody(req));
    product.id = slug(product.name);
    db.products.unshift(product);
    writeDb(db);
    return send(res, 201, product);
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (productMatch) {
    const id = productMatch[1];
    const index = db.products.findIndex(product => product.id === id);
    if (index === -1) return send(res, 404, { error: "Product not found" });
    if (req.method === "PUT") {
      db.products[index] = normalizeProduct(await readBody(req), db.products[index]);
      writeDb(db);
      return send(res, 200, db.products[index]);
    }
    if (req.method === "DELETE") {
      db.products.splice(index, 1);
      writeDb(db);
      return send(res, 200, { ok: true });
    }
  }

  if (req.method === "POST" && pathname === "/api/admin/categories") {
    const body = await readBody(req);
    const category = { id: slug(body.name), name: String(body.name || "").trim(), order: db.categories.length + 1 };
    db.categories.push(category);
    writeDb(db);
    return send(res, 201, category);
  }

  const categoryMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (categoryMatch) {
    const id = categoryMatch[1];
    const index = db.categories.findIndex(category => category.id === id);
    if (index === -1) return send(res, 404, { error: "Category not found" });
    if (req.method === "PUT") {
      const body = await readBody(req);
      db.categories[index].name = String(body.name || db.categories[index].name).trim();
      db.categories[index].order = Number(body.order || db.categories[index].order);
      writeDb(db);
      return send(res, 200, db.categories[index]);
    }
    if (req.method === "DELETE") {
      db.categories.splice(index, 1);
      writeDb(db);
      return send(res, 200, { ok: true });
    }
  }

  if (req.method === "PUT" && pathname === "/api/admin/content") {
    db.content = { ...db.content, ...(await readBody(req)) };
    writeDb(db);
    return send(res, 200, db.content);
  }

  const statusMatch = pathname.match(/^\/api\/admin\/(inquiries|leads)\/([^/]+)$/);
  if (statusMatch && req.method === "PUT") {
    const collection = statusMatch[1];
    const item = db[collection].find(entry => entry.id === statusMatch[2]);
    if (!item) return send(res, 404, { error: "Record not found" });
    item.status = (await readBody(req)).status || item.status;
    writeDb(db);
    return send(res, 200, item);
  }

  if (req.method === "GET" && pathname === "/api/admin/export.csv") {
    const rows = [["type", "createdAt", "name", "phone", "email", "productInterest", "status", "message"]];
    [...db.inquiries, ...db.leads].forEach(item => rows.push([
      item.type || "catalogue-lead", item.createdAt, item.name || item.fullName || "", item.phone || "", item.email || "",
      item.productInterest || "", item.status || "", item.message || ""
    ]));
    const csv = rows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=florinaa-leads.csv" });
    return res.end(csv);
  }

  send(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, pathname) {
  const publicPages = new Set(["/", "/about", "/facility", "/products", "/contact"]);
  const route = publicPages.has(pathname) ? "/index.html" : pathname === "/admin" ? "/admin.html" : pathname;
  const file = path.normalize(path.join(publicDir, route));
  if (!file.startsWith(publicDir)) return send(res, 403, "Forbidden");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "Not found");
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname.startsWith("/api/")) return api(req, res, pathname);
    serveStatic(req, res, pathname);
  } catch (error) {
    send(res, 500, { error: error.message || "Server error" });
  }
}).listen(port, () => {
  console.log(`Florinaa running at http://localhost:${port}`);
});
