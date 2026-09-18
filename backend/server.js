require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const connectDB = require("./db");
const User = require("./models/User");
const Branch = require("./models/Branch");
const { buildSeedBranches } = require("./seed/seedData");

const app = express();
const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET || "chehry-dev-secret";

// Comma-separated list of allowed origins in production, e.g.
// CORS_ORIGIN=https://your-frontend.vercel.app,https://another-domain.com
// Falls back to "allow everything" for local development.
const CORS_ORIGIN = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: CORS_ORIGIN ? CORS_ORIGIN.split(",").map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json());

// ---------- One-time setup ----------
async function seedDefaultAdmin() {
  const existing = await User.findOne({ username: "admin" });
  if (!existing) {
    const passwordHash = await bcrypt.hash("1234", 10);
    await User.create({ username: "admin", passwordHash, role: "admin" });
    console.log("[seed] Default admin user created: admin / 1234");
  }
}

async function seedBranchesIfEmpty() {
  const count = await Branch.countDocuments();
  if (count === 0) {
    const branches = buildSeedBranches();
    await Branch.insertMany(branches);
    console.log(`[seed] Inserted ${branches.length} branches into MongoDB`);
  }
}

// ---------- Middleware ----------
function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------- Routes ----------
app.get("/api/", (req, res) => {
  res.json({ ok: true, service: "Centre of Higher Education, Haryana - API" });
});

app.get("/api/health", async (req, res) => {
  const branches = await Branch.countDocuments().catch(() => -1);
  res.json({
    status: "healthy",
    db: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
    branches,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }
  const row = await User.findOne({ username });
  if (!row) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: row.id, username: row.username, role: row.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({
    token,
    user: { id: row.id, username: row.username, role: row.role },
  });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: { id: req.user.sub, username: req.user.username, role: req.user.role } });
});

// Branches list (summary — no hierarchy)
app.get("/api/branches", authRequired, async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const docs = await Branch.find(filter)
    .select("id code name icon description headcount")
    .sort({ code: 1 })
    .lean();
  const total = await Branch.countDocuments();
  res.json({ count: docs.length, total, branches: docs });
});

// Branch detail (with hierarchy)
app.get("/api/branches/:id", authRequired, async (req, res) => {
  const branch = await Branch.findOne({ id: req.params.id }).lean();
  if (!branch) return res.status(404).json({ error: "Branch not found" });
  res.json({ branch });
});

// ---------- Start ----------
async function start() {
  try {
    await connectDB();
    await seedDefaultAdmin();
    await seedBranchesIfEmpty();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[server] Node backend listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  }
}

start();
