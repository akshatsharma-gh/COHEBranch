require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const connectDB = require("./db");
const User = require("./models/User");
const Branch = require("./models/Branch");
const {
  buildSeedBranches,
  avatarFor,
  emailFor,
  phoneFor,
  joinedYearFor,
} = require("./seed/seedData");

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

// ---------- Helpers ----------
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

async function uniqueBranchId(base) {
  let id = base || "branch";
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Branch.exists({ id })) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

// Normalizes a hierarchy array coming from the admin UI: the client only
// needs to send { name, role } per entry (order = reporting order). We
// derive everything else (avatar, mock email/phone, join year, bio, level)
// deterministically here, so the admin form stays simple.
function normalizeHierarchy(hierarchy, branchName) {
  if (!Array.isArray(hierarchy)) return [];
  return hierarchy
    .filter((p) => p && p.name && p.name.trim())
    .map((p, idx) => {
      const name = p.name.trim();
      const role = (p.role || "Officer").trim();
      return {
        level: idx,
        role,
        name,
        avatar: avatarFor(name, role),
        email: emailFor(name),
        phone: phoneFor(name),
        joined: joinedYearFor(name),
        bio: p.bio || `${role} in the ${branchName} branch.`,
      };
    });
}

const ICONS_WHITELIST = null; // any lucide-react icon name is accepted; frontend offers a curated picker

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

// ---------- Public routes ----------
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

// Branches list — PUBLIC (viewers can browse without logging in)
app.get("/api/branches", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const docs = await Branch.find(filter)
    .select("id code name icon description headcount")
    .sort({ code: 1 })
    .lean();
  const total = await Branch.countDocuments();
  res.json({ count: docs.length, total, branches: docs });
});

// Branch detail (with hierarchy) — PUBLIC
app.get("/api/branches/:id", async (req, res) => {
  const branch = await Branch.findOne({ id: req.params.id }).lean();
  if (!branch) return res.status(404).json({ error: "Branch not found" });
  res.json({ branch });
});

// ---------- Admin-only routes ----------

// Create a branch
app.post("/api/branches", authRequired, async (req, res) => {
  const { name, description, icon, hierarchy } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Branch name is required" });
  }
  const id = await uniqueBranchId(slugify(name));
  const total = await Branch.countDocuments();
  const code = `CHE-${String(total + 1).padStart(2, "0")}`;
  const normalizedHierarchy = normalizeHierarchy(hierarchy, name.trim());

  const branch = await Branch.create({
    id,
    code,
    name: name.trim(),
    icon: icon || "Landmark",
    description: description?.trim() || `${name.trim()} branch of the Centre of Higher Education, Haryana.`,
    headcount: normalizedHierarchy.length,
    hierarchy: normalizedHierarchy,
  });
  res.status(201).json({ branch });
});

// Update a branch's fields and/or its whole hierarchy
app.put("/api/branches/:id", authRequired, async (req, res) => {
  const branch = await Branch.findOne({ id: req.params.id });
  if (!branch) return res.status(404).json({ error: "Branch not found" });

  const { name, description, icon, hierarchy } = req.body || {};
  if (typeof name === "string" && name.trim()) branch.name = name.trim();
  if (typeof description === "string") branch.description = description.trim();
  if (typeof icon === "string" && icon.trim()) branch.icon = icon.trim();

  if (Array.isArray(hierarchy)) {
    const normalizedHierarchy = normalizeHierarchy(hierarchy, branch.name);
    branch.hierarchy = normalizedHierarchy;
    branch.headcount = normalizedHierarchy.length;
  }

  await branch.save();
  res.json({ branch });
});

// Delete a branch
app.delete("/api/branches/:id", authRequired, async (req, res) => {
  const result = await Branch.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Branch not found" });
  }
  res.json({ ok: true });
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