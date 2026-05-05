#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// FixIt Pro — Complete Auto-Setup Script
// Run: node setup.js
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT = path.join(process.cwd(), "fixit-pro");

// ── Helpers ──
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(relPath, content) {
  const full = path.join(PROJECT, relPath);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, content, "utf8");
}

function log(msg) {
  console.log("  " + msg);
}

// ═══════════════════════════════════════════════════════════════
console.log("");
console.log("  \x1b[33m╔═══════════════════════════════════════════╗\x1b[0m");
console.log("  \x1b[33m║   🔧  FixIt Pro — Auto Setup              ║\x1b[0m");
console.log("  \x1b[33m╚═══════════════════════════════════════════╝\x1b[0m");
console.log("");

// ── Check Node version ──
const major = parseInt(process.versions.node.split(".")[0]);
if (major < 18) {
  console.error("  ❌ Node.js 18+ required. You have " + process.version);
  process.exit(1);
}
log("\x1b[32m✅ Node.js " + process.version + " detected\x1b[0m");

// ── Remove existing project ──
if (fs.existsSync(PROJECT)) {
  log("\x1b[33m⚠️  Removing existing fixit-pro folder...\x1b[0m");
  fs.rmSync(PROJECT, { recursive: true, force: true });
}

mkdirp(PROJECT);
log("\x1b[36m📁 Creating project at " + PROJECT + "\x1b[0m");

// ── Create directories ──
const dirs = [
  "db", "middleware", "routes",
  "views/partials", "views/auth", "views/user", "views/handyman", "views/admin",
  "public/css", "public/js", "uploads"
];
dirs.forEach(d => mkdirp(path.join(PROJECT, d)));
log("\x1b[36m📂 Directories created\x1b[0m");

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
write("package.json", `{
  "name": "fixit-pro",
  "version": "1.0.0",
  "description": "Professional Handyman Service Platform",
  "main": "server.js",
  "scripts":══════════
// package.json
//  {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "seed": "node db/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^11.7.0",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.7",
    "ejs": "^3.1.10",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2"
  }
}`);

// ═══════════════════════════════════════════════════════════════
// .env
// ═══════════════════════════════════════════════════════════════
write(".env", `PORT=3000
JWT_SECRET=fixitpro_super_secret_key_change_in_production_2024
NODE_ENV=development`);

// ═══════════════════════════════════════════════════════════════
// .gitignore
// ═══════════════════════════════════════════════════════════════
write(".gitignore", `node_modules/
.env
db/*.sqlite
uploads/*
!uploads/.gitkeep`);

// ═══════════════════════════════════════════════════════════════
// Procfile
// ═══════════════════════════════════════════════════════════════
write("Procfile", `web: node server.js`);

// ═══════════════════════════════════════════════════════════════
// server.js
// ═══════════════════════════════════════════════════════════════
write("server.js", `require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const { getUserFromToken } = require("./middleware/auth");
app.use(getUserFromToken);

app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  next();
});

const rateLimitMap = new Map();
function rateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    const record = rateLimitMap.get(key);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).render("error", { message: "Too many requests. Please try again later.", currentUser: null, title: "Rate Limited" });
    }
    next();
  };
}

app.use("/auth", rateLimit(15 * 60 * 1000, 50));

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/handyman", require("./routes/handyman"));
app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/api"));

app.use((req, res) => {
  res.status(404).render("error", { title: "Not Found", message: "The page you are looking for does not exist.", currentUser: req.user || null });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", { title: "Error", message: "Something went wrong. Please try again.", currentUser: req.user || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("  ╔═══════════════════════════════════════╗");
  console.log("  ║   🔧  FixIt Pro is running!           ║");
  console.log("  ║   → http://localhost:" + PORT + "             ║");
  console.log("  ║                                       ║");
  console.log("  ║   Accounts (password: password123)    ║");
  console.log("  ║   Admin:    admin@fixitpro.com        ║");
  console.log("  ║   User:     john@example.com          ║");
  console.log("  ║   Handyman: mike@fixitpro.com         ║");
  console.log("  ║                                       ║");
  console.log("  ╚═══════════════════════════════════════╝");
  console.log("");
});`);

// ═══════════════════════════════════════════════════════════════
// db/database.js
// ═══════════════════════════════════════════════════════════════
write("db/database.js", `const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "fixitpro.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','handyman','admin')),
    avatar TEXT DEFAULT '/img/default-avatar.png',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'fa-tools',
    description TEXT,
    color TEXT DEFAULT '#E8A838'
  );
  CREATE TABLE IF NOT EXISTS handyman_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    category_id INTEGER,
    bio TEXT,
    hourly_rate REAL DEFAULT 0,
    experience_years INTEGER DEFAULT 0,
    service_area TEXT,
    available INTEGER DEFAULT 1,
    rating REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    handyman_id INTEGER NOT NULL,
    service_description TEXT NOT NULL,
    address TEXT NOT NULL,
    scheduled_date TEXT,
    scheduled_time TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','in_progress','completed','declined','cancelled')),
    total_price REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (handyman_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    handyman_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (handyman_id) REFERENCES users(id)
  );
\`);

module.exports = db;`);

// ═══════════════════════════════════════════════════════════════
// db/seed.js
// ═══════════════════════════════════════════════════════════════
write("db/seed.js", `const bcrypt = require("bcryptjs");
const db = require("./database");

console.log("🌱 Seeding database...\\n");

db.exec("DELETE FROM reviews; DELETE FROM bookingsarpentry", "fa-hammer", "Furniture, frames, decks & woodwork", "#8B5CF6"],
  ["Painting", "fa-paint-roller", "Interior, exterior & decorative painting", "#EC4899"],
  ["HVAC", "fa-wind", "Heating, cooling & ventilation systems", "#06B6D4"],
  ["General Repairs", "fa-screwdriver-wrench", "Odd jobs, maintenance & installations", "#10B981"],
];
const catIds = {};
categories.forEach(([name, icon, desc, color]) => {
  const info = insertCat.run(name, icon, desc, color);
  catIds[name] = info.lastInsertRowid;
});

const insertUser = db.prepare("INSERT INTO users (name,email,password,", "#3B82F6"],
  ["Elect; DELETE FROM handyman_profiles; DELETE FROM categories; DELETE FROM users;");

const hash = bcrypt.hashSync("password123", 10);

const insertCat = db.prepare("INSERT INTO categories (name, icon, description, color) VALUES (?,?,?,?)");
const categories = [
  ["Plumbing", "fa-faucet-drip", "Pipes, leaks, drains & water systemsrical", "fa-bolt", "Wiring, outlets, lighting & panels", "#F59E0B"],
  ["Cphone,address,role) VALUES (?,?,?,?,?,?)");

insertUser.run("Admin", "admin@fixitpro.com", hash, "555-0100", "100 Main St", "admin");

const user1 = insertUser.run("John Smith", "john@example.com", hash, "555-0101", "42 Oak Avenue, Suite 3", "user").lastInsertRowid;
const user2 = insertUser.run("Sarah Johnson", "sarah@example.com", hash, "555-0102", "88 Pine Street, Apt 12B", "user").lastInsertRowid;
const user3 = insertUser.run("David Chen", "david@example.com", hash, "555-0103", "15 Maple Drive", "user").lastInsertRowid;

const h1 = insertUser.run("Mike Rodriguez", "mike@fixitpro.com", hash, "555-0201", "23 Elm Court", "handyman").lastInsertRowid;
const h2 = insertUser.run("Tony Williams", "tony@fixitpro.com", hash, "555-0202", "67 Cedar Lane", "handyman").lastInsertRowid;
const h3 = insertUser.run("Emily Parker", "emily@fixitpro.com", hash, "555-0203", "91 Birch Road", "handyman").lastInsertRowid;
const h4 = insertUser.run("James O'Brien", "james@fixitpro.com", hash, "555-0204", "5 Spruce Way", "handyman").lastInsertRowid;
const h5 = insertUser.run("Lisa Thompson", "lisa@fixitpro.com", hash, "555-0205", "34 Willow Blvd", "handyman").lastInsertRowid;

const insertProfile = db.prepare("INSERT INTO handyman_profiles (user_id,category_id,bio,hourly_rate,experience_years,service_area,rating,total_reviews,total_jobs,verified) VALUES (?,?,?,?,?,?,?,?,?,?)");

insertProfile.run(h1, catIds["Plumbing"], "Licensed master plumber with 12 years of experience. Specializing in residential and commercial plumbing systems, water heater installations, and emergency repairs "Citywide", 4.6, 22, 45, 1);
insertProfile.run(h5, catIds["HVAC"], "EPA-certified HVAC technician specializing in energy-efficient systems. Installation, maintenance, and repair of all major brands.", 85, 7, "South & West Areas", 4.9, 19, 38, 1);

const insertBooking = db.prepare("INSERT INTO bookings (user_id,handyman_id,.", 75, 12, "Downtown & Suburbs", 4.9, 47, 89, 1);
insertProfile.run(h2, catIds["Electrical"], "Certified electrician bringing 8 years of expertise to every job. From simple outlet replacements to complete rewiring projects.", 80, 8, "Metro Area", 4.8, 35, 72, 1);
insertProfile.run(h3, catIds["Carpentry"], "Custom woodworker and carpenter with a passion for detail. I build, repair, and restore — from custom shelving to deck construction.", 65, 15, "North & East Districts", 4.7, 28, 56, 1);
insertProfile.run(h4, catIds["Painting"], "Professional painter delivering flawless finishes since 2012. Interior, exterior, and specialty finishes. Color consultation included.", 55, 10,service_description,address,scheduled_date,scheduled_time,status,total_price,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)");

insertBooking.run(user1, h1, "Fix leaking kitchen faucet and replace garbage disposal", "42 Oak Avenue, Suite 3", "2025-02-15", "10:00", "completed", 185, "Completed successfully.", "2025-02-10");
insertBooking.run(user1, h2, "Install three ceiling fans and add dimmer switches", "42 Oak Avenue, Suite 3", "2025-02-20", "09:00", "completed", 320, "All fans working perfectly.", "2025-02-16");
insertBooking.run(user2, h3, "Build custom bookshelf for living room wall", "88 Pine Street, Apt 12B", "2025-03-01", "08:00", "in_progress", null, "6-foot wide, floor to ceiling.", "2025-02-25");
insertBooking.run(user2, h4, "Paint master bedroom — light sage green", "88 Pine Street, Apt 12B", "2025-03-10", "09:00", "accepted", 450, "Walls and ceiling. Trim in white.", "2025-03-01");
insertBooking.run(user3, h1, "Install new dishwasher and check water pressure", "15 Maple Drive", "2025-03-15", "14:00", "pending", null, "Dishwasher already purchased.", "2025-03-05");
insertBooking.run(user3, h5, "Annual HVAC maintenance check", "15 Maple Drive", "2025-03-20", "10:00", "pending", null, "Last serviced 14 months ago.", "2025-03-08");
insertBooking.run(user1, h3, "Repair wooden fence — 3 broken panels", "42 Oak Avenue, Suite 3", "2025-02-01", "11:00", "completed", 275, "Great job matching the stain.", "2025-01-28");

const insertReview = db.prepare("INSERT INTO reviews (booking_id,user_id,handyman_id,rating,comment,created_at) VALUES (?,?,?,?,?,?)");

insertReview.run(1, user1, h1, 5, "Mike was fantastic! Fixed the faucet quickly and the new disposal works perfectly.", "2025-02-15");
insertReview.run(2, user1, h2, 5, "Tony did an excellent job with the ceiling fans. Highly recommend!", "2025-02-20");
insertReview.run(7, user1, h3, 4, "Emily repaired the fence panels beautifully. Would hire again.", "2025-02-01");

const updateRating = db.prepare("UPDATE handyman_profiles SET rating = (SELECT COALESCE(AVG(r.rating),0) FROM reviews r WHERE r.handyman_id = ?), total_reviews = (SELECT COUNT(*) FROM reviews r WHERE r.handyman_id = ?), total_jobs = (SELECT COUNT(*) FROM bookings b WHERE b.handyman_id = ? AND b.status = 'completed') WHERE user_id = ?");
[h1, h2, h3, h4, h5].forEach(id => { updateRating.run(id, id, id, id); });

console.log("✅ Seed complete!\\n");
console.log("📧 Test accounts (password: password123):");
console.log("   Admin:     admin@fixitpro.com");
console.log("   User:      john@example.com");
console.log("   Handyman:  mike@fixitpro.com\\n");
process.exit(0);`);

// ═══════════════════════════════════════════════════════════════
// middleware/auth.js
// ═══════════════════════════════════════════════════════════════
write("middleware/auth.js", `const jwt = require("jsonwebtoken");
const db = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function getUserFromToken(req, res, next) {
  const token = req.cookies.token;
  res.locals.currentUser = null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT id, name, email, role, avatar, phone, address FROM users WHERE id = ?").get(decoded.id);
    if (user) { req.user = user; res.locals.currentUser = user; }
  } catch (e) {}
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/auth/login?error=Please log in to continue");
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/auth/login?error=Please log in to continue");
    if (!roles.includes(req.user.role)) return res.status(403).render("error", { message: "Access denied", currentUser: req.user, title: "Forbidden" });
    next();
  };
}

module.exports = { getUserFromToken, requireAuth, requireRole };`);

// ═══════════════════════════════════════════════════════════════
// middleware/validate.js
// ═══════════════════════════════════════════════════════════════
write("middleware/validate.js", `function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
}

function validateEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function validateRegistration(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || name.length < 2 || name.length > 100) errors.push("Name must be 2-100 characters");
  if (!email || !validateEmail(email)) errors.push("Valid email is required");
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
  for (const key in req.body) {
    if (typeof req.body[key] === "string") req.body[key] = sanitize(req.body[key]);
  }
  if (errors.length > 0) return res.redirect("/auth/register?error=" + encodeURIComponent(errors[0]));
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return res.redirect("/auth/login?error=Email and password are required");
  req.body.email = sanitize(req.body.email);
  next();
}

function validateBooking(req, res, next) {
  const { service_description, address, scheduled_date } = req.body;
  const errors = [];
  if (!service_description || service_description.length < 5) errors.push("Please describe the service (at least 5 characters)");
  if (!address || address.length < 5) errors.push("Please provide a valid address");
  if (!scheduled_date) errors.push("Please select a date");
  for (const key in req.body) {
    if (typeof req.body[key] === "string") req.body[key] = sanitize(req.body[key]);
  }
  if (errors.length > 0) return res.redirect("back?error=" + encodeURIComponent(errors[0]));
  next();
}

function validateReview(req, res, next) {
  const { rating, comment } = req.body;
  const r = parseInt(rating);
  if (isNaN(r) || r < 1 || r > 5) return res.redirect("back?error=Please select a rating");
  if (!comment || comment.length < 3) return res.redirect("back?error=Please write a review comment");
  req.body.rating = r;
  req.body.comment = sanitize(comment);
  next();
}

module.exports = { sanitize, validateEmail, validateRegistration, validateLogin, validateBooking, validateReview };`);

// ═══════════════════════════════════════════════════════════════
// routes/index.js
// ═══════════════════════════════════════════════════════════════
write("routes/index.js", `const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  const handymen = db.prepare(\`SELECT u.id, u.name, u.avatar, hp.bio, hp.hourly_rate, hp.rating, hp.total_reviews, hp.experience_years, hp.verified, c.name as category, c.icon as cat_icon, c.color as cat_color FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE hp.available = 1 ORDER BY hp.rating DESC LIMIT 6\`).all();
  res.render("landing", { title: "FixIt Pro — Professional Handyman Services", page: "home", categories, handymen });
});

router.get("/browse", (req, res) => {
  const { category, search, sort } = req.query;
  let sql = \`SELECT u.id, u.name, u.avatar, u.address, hp.bio, hp.hourly_rate, hp.rating, hp.total_reviews, hp.experience_years, hp.service_area, hp.verified, hp.available, c.name as category, c.icon as cat_icon, c.color as cat_color FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE 1=1\`;
  const params = [];
  if (category) { sql += " AND c.id = ?"; params.push(category); }
  if (search) { sql += " AND (u.name LIKE ? OR hp.bio LIKE ? OR c.name LIKE ?)"; params.push(\`%\${search}%\`, \`%\${search}%\`, \`%\${search}%\`); }
  if (sort === "rating") sql += " ORDER BY hp.rating DESC";
  else if (sort === "price_low") sql += " ORDER BY hp.hourly_rate ASC";
  else if (sort === "price_high") sql += " ORDER BY hp.hourly_rate DESC";
  else if (sort === "experience") sql += " ORDER BY hp.experience_years DESC";
  else sql += " ORDER BY hp.rating DESC";
  const handymen = db.prepare(sql).all(...params);
  const categories = db.prepare("SELECT * FROM categories").all();
  res.render("browse", { title: "Find a Handyman", page: "browse", handymen, categories, filters: req.query });
});

router.get("/profile/:id", (req, res) => {
  const handyman = db.prepare(\`SELECT u.id, u.name, u.avatar, u.phone, u.address, hp.bio, hp.hourly_rate, hp.rating, hp.total_reviews, hp.total_jobs, hp.experience_years, hp.service_area, hp.verified, hp.available, c.name as category, c.icon as cat_icon, c.color as cat_color FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE u.id = ?\`).get(req.params.id);
  if (!handyman) return res.status(404).render("error", { message: "Handyman not found", currentUser: req.user, title: "Not Found" });
  const reviews = db.prepare(\`SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.handyman_id = ? ORDER BY r.created_at DESC\`).all(req.params.id);
  res.render("profile", { title: handyman.name, page: "browse", handyman, reviews });
});

module.exports = router;`);

// ═══════════════════════════════════════════════════════════════
// routes/auth.js
// ═══════════════════════════════════════════════════════════════
write("routes/auth.js", `const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");
const { validateRegistration, validateLogin } = require("../middleware/validate");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

router.get("/login", (req, res) => {
  if (req.user) return res.redirect(\`/\${req.user.role === "admin" ? "admin" : req.user.role === "handyman" ? "handyman" : "user"}/dashboard\`);
  res.render("auth/login", { title: "Sign In", page: "login" });
});

router.post("/login", validateLogin, (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.redirect("/auth/login?error=Invalid email or password");
  }
  const token = createToken(user);
  res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  const dest = user.role === "admin" ? "/admin/dashboard" : user.role === "handyman" ? "/handyman/dashboard" : "/user/dashboard";
  res.redirect(dest);
});

router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/");
  const categories = db.prepare("SELECT * FROM categories").all();
  res.render("auth/register", { title: "Create Account", page: "register", categories });
});

router.post("/register", validateRegistration, (req, res) => {
  const { name, email, password, phone, address, role, category_id, bio, hourly_rate, experience_years, service_area } = req.body;
  try {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.redirect("/auth/register?error=Email already registered");
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare("INSERT INTO users (name,email,password,phone,address,role) VALUES (?,?,?,?,?,?)").run(name, email, hash, phone, address, role || "user");
    if (role === "handyman") {
      db.prepare("INSERT INTO handyman_profiles (user_id,category_id,bio,hourly_rate,experience_years,service_area) VALUES (?,?,?,?,?,?)").run(info.lastInsertRowid, category_id || null, bio, hourly_rate || 0, experience_years || 0, service_area);
    }
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    const token = createToken(user);
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(\`/\${user.role === "handyman" ? "handyman" : "user"}/dashboard?success=Welcome to FixIt Pro!\`);
  } catch (e) {
    res.redirect("/auth/register?error=Registration failed. Please try again.");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;`);

// ═══════════════════════════════════════════════════════════════
// routes/user.js
// ═══════════════════════════════════════════════════════════════
write("routes/user.js", `const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBooking, validateReview } = require("../middleware/validate");

router.use(requireAuth, requireRole("user"));

router.get("/dashboard", (req, res) => {
  const stats = {
    total: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE user_id = ?").get(req.user.id).c,
    pending: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE user_id = ? AND status = 'pending'").get(req.user.id).c,
    active: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE user_id = ? AND status IN ('accepted','in_progress')").get(req.user.id).c,
    completed: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE user_id = ? AND status = 'completed'").get(req.user.id).c,
  };
  const bookings = db.prepare(\`SELECT b.*, u.name as handyman_name, u.avatar as handyman_avatar, c.name as category FROM bookings b JOIN users u ON u.id = b.handyman_id LEFT JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 10\`).all(req.user.id);
  res.render("user/dashboard", { title: "My Dashboard", page: "user-dashboard", stats, bookings });
});

router.get("/bookings", (req, res) => {
  const { status } = req.query;
  let sql = "SELECT b.*, u.name as handyman_name, u.avatar as handyman_avatar FROM bookings b JOIN users u ON u.id = b.handyman_id WHERE b.user_id = ?";
  const params = [req.user.id];
  if (status) { sql += " AND b.status = ?"; params.push(status); }
  sql += " ORDER BY b.created_at DESC";
  const bookings = db.prepare(sql).all(...params);
  res.render("user/bookings", { title: "My Bookings", page: "user-bookings", bookings, filter: status || "" });
});

router.get("/book/:handymanId", (req, res) => {
  const handyman = db.prepare("SELECT u.id, u.name, u.avatar, hp.hourly_rate, c.name as category FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE u.id = ?").get(req.params.handymanId);
  if (!handyman) return res.redirect("/browse?error=Handyman not found");
  res.render("user/book", { title: "Book " + handyman.name, page: "user-bookings", handyman });
});

router.post("/book/:handymanId", validateBooking, (req, res) => {
  const { service_description, address, scheduled_date, scheduled_time, notes } = req.body;
  db.prepare("INSERT INTO bookings (user_id,handyman_id,service_description,address,scheduled_date,scheduled_time,notes) VALUES (?,?,?,?,?,?,?)").run(req.user.id, req.params.handymanId, service_description, address, scheduled_date, scheduled_time, notes);
  res.redirect("/user/bookings?success=Booking request sent!");
});

router.post("/bookings/:id/cancel", (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!booking || !["pending", "accepted"].includes(booking.status)) return res.redirect("/user/bookings?error=Cannot cancel this booking");
  db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.redirect("/user/bookings?success=Booking cancelled");
});

router.post("/bookings/:id/review", validateReview, (req, res) => {
  const { rating, comment } = req.body;
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = 'completed'").get(req.params.id, req.user.id);
  if (!booking) return res.redirect("/user/bookings?error=Cannot review this booking");
  const existing = db.prepare("SELECT id FROM reviews WHERE booking_id = ?").get(req.params.id);
  if (existing) return res.redirect("/user/bookings?error=Already reviewed");
  db.prepare("INSERT INTO reviews (booking_id,user_id,handyman_id,rating,comment) VALUES (?,?,?,?,?)").run(req.params.id, req.user.id, booking.handyman_id, rating, comment);
  const stats = db.prepare("SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE handyman_id = ?").get(booking.handyman_id);
  db.prepare("UPDATE handyman_profiles SET rating = ?, total_reviews = ? WHERE user_id = ?").run(Math.round(stats.avg * 10) / 10, stats.count, booking.handyman_id);
  res.redirect("/user/bookings?success=Review submitted!");
});

router.get("/profile", (req, res) => {
  const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.render("user/profile", { title: "My Profile", page: "user-profile", profile });
});

router.post("/profile", (req, res) => {
  const { name, phone, address } = req.body;
  db.prepare("UPDATE users SET name=?, phone=?, address=? WHERE id=?").run(name, phone, address, req.user.id);
  res.redirect("/user/profile?success=Profile updated");
});

module.exports = router;`);

// ═══════════════════════════════════════════════════════════════
// routes/handyman.js
// ═══════════════════════════════════════════════════════════════
write("routes/handyman.js", `const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("handyman"));

router.get("/dashboard", (req, res) => {
  const stats = {
    pending: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE handyman_id = ? AND status = 'pending'").get(req.user.id).c,
    active: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE handyman_id = ? AND status IN ('accepted','in_progress')").get(req.user.id).c,
    completed: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE handyman_id = ? AND status = 'completed'").get(req.user.id).c,
    earnings: db.prepare("SELECT COALESCE(SUM(total_price),0) as total FROM bookings WHERE handyman_id = ? AND status = 'completed'").get(req.user.id).total,
  };
  const pending = db.prepare(\`SELECT b.*, u.name as user_name, u.phone as user_phone FROM bookings b JOIN users u ON u.id = b.user_id WHERE b.handyman_id = ? AND b.status = 'pending' ORDER BY b.created_at DESC\`).all(req.user.id);
  const active = db.prepare(\`SELECT b.*, u.name as user_name, u.phone as user_phone FROM bookings b JOIN users u ON u.id = b.user_id WHERE b.handyman_id = ? AND b.status IN ('accepted','in_progress') ORDER BY b.scheduled_date ASC\`).all(req.user.id);
  res.render("handyman/dashboard", { title: "Handyman Dashboard", page: "handyman-dashboard", stats, pending, active });
});

router.get("/bookings", (req, res) => {
  const { status } = req.query;
  let sql = "SELECT b.*, u.name as user_name, u.phone as user_phone, u.address as user_address FROM bookings b JOIN users u ON u.id = b.user_id WHERE b.handyman_id = ?";
  const params = [req.user.id];
  if (status) { sql += " AND b.status = ?"; params.push(status); }
  sql += " ORDER BY b.created_at DESC";
  const bookings = db.prepare(sql).all(...params);
  res.render("handyman/bookings", { title: "Manage Bookings", page: "handyman-bookings", bookings, filter: status || "" });
});

router.post("/bookings/:id/status", (req, res) => {
  const { status, total_price } = req.body;
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND handyman_id = ?").get(req.params.id, req.user.id);
  if (!booking) return res.redirect("/handyman/bookings?error=Booking not found");
  const validTransitions = { pending: ["accepted", "declined"], accepted: ["in_progress", "cancelled"], in_progress: ["completed"] };
  if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status)) return res.redirect("/handyman/bookings?error=Invalid status change");
  db.prepare("UPDATE bookings SET status = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, total_price || booking.total_price, req.params.id);
  if (status === "completed") db.prepare("UPDATE handyman_profiles SET total_jobs = total_jobs + 1 WHERE user_id = ?").run(req.user.id);
  res.redirect("/handyman/bookings?success=Booking updated");
});

router.get("/profile", (req, res) => {
  const profile = db.prepare(\`SELECT u.*, hp.bio, hp.hourly_rate, hp.experience_years, hp.service_area, hp.available, hp.category_id, hp.rating, hp.total_reviews, hp.total_jobs, c.name as category FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE u.id = ?\`).get(req.user.id);
  const categories = db.prepare("SELECT * FROM categories").all();
  res.render("handyman/profile", { title: "My Profile", page:══════════════════════════════════════════════════
write("routes/admin.js", `const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { requireAuth, requireRole } = require("../middleware/auth");

 "handyman-profile", profile, categories });
});

router.post("/profile", (req, res) => {
  const { name, phone, address, bio, hourly_rate, experience_years, service_area, category_id, available } = req.body;
  db.prepare("UPDATE users SET name=?, phone=?, address=? WHERE id=?").run(name, phone, address, req.user.id);
  db.prepare("UPDATE handyman_profiles SET bio=?, hourly_rate=?, experience_years=?, service_area=?, category_id=?, available=? WHERE user_id=?").run(bio, hourly_rate || 0, experience_years || 0, service_area, category_id || null, available ? 1 : 0, req.user.id);
  res.redirect("/handyman/profile?success=Profile updated");
});

module.exports = router;`);

// ═══════════════════════════════════════════════════════════════
// routes/admin.js
// ═════════════router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", (req, res) => {
  const stats = {
    users: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c,
    handymen: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'handyman'").get().c,
    bookings: db.prepare("SELECT COUNT(*) as c FROM bookings").get().c,
    revenue: db.prepare("SELECT COALESCE(SUM(total_price),0) as total FROM bookings WHERE status = 'completed'").get().total,
    pending: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'").get().c,
    completed: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'").get().c,
  };
  const recentBookings = db.prepare(\`SELECT b.*, u1.name as user_name, u2.name as handyman_name FROM bookings b JOIN users u1 ON u1.id = b.user_id JOIN users u2 ON u2.id = b.handyman_id ORDER BY b.created_at DESC LIMIT 8\`).all();
  const topHandymen = db.prepare(\`SELECT u.name, u.avatar, hp.rating, hp.total_jobs, hp.total_reviews, c.name as category FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id ORDER BY hp.rating DESC LIMIT 5\`).all();
  res.render("admin/dashboard", { title: "Admin Dashboard", page: "admin-dashboard", stats, recentBookings, topHandymen });
});

router.get("/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC").all();
  res.render("admin/users", { title: "Manage Users", page: "admin-users", users });
});

router.post("/users/:id/delete", (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.redirect("/admin/users?error=Cannot delete yourself");
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.redirect("/admin/users?success=User deleted");
});

router.get("/handymen", (req, res) => {
  const handymen = db.prepare(\`SELECT u.*, hp.bio, hp.hourly_rate, hp.rating, hp.total_reviews, hp.total_jobs, hp.experience_years, hp.available, hp.verified, c.name as category FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id ORDER BY u.created_at DESC\`).all();
  res.render("admin/handymen", { title: "Manage Handymen", page: "admin-handymen", handymen });
});

router.post("/handymen/:id/verify", (req, res) => {
  db.prepare("UPDATE handyman_profiles SET verified = ? WHERE user_id = ?").run(req.body.verified ? 1 : 0, req.params.id);
  res.redirect("/admin/handymen?success=Updated");
});

router.post("/handymen/:id/delete", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.redirect("/admin/handymen?success=Handyman deleted");
});

router.get("/bookings", (req, res) => {
  const { status } = req.query;
  let sql = "SELECT b.*, u1.name as user_name, u2.name as handyman_name FROM bookings b JOIN users u1 ON u1.id = b.user_id JOIN users u2 ON u2.id = b.handyman_id";
  const params = [];
  if (status) { sql += " WHERE b.status = ?"; params.push(status); }
  sql += " ORDER BY b.created_at DESC";
  const bookings = db.prepare(sql).all(...params);
  res.render("admin/bookings", { title: "Manage Bookings", page: "admin-bookings", bookings, filter: status || "" });
});

router.post("/bookings/:id/delete", (req, res) => {
  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
  res.redirect("/admin/bookings?success=Booking deleted");
});

router.get("/categories", (req, res) => {
  const categories = db.prepare("SELECT c.*, (SELECT COUNT(*) FROM handyman_profiles hp WHERE hp.category_id = c.id) as handyman_count FROM categories c").all();
  res.render("admin/categories", { title: "Manage Categories", page: "admin-categories", categories });
});

router.post("/categories", (req, res) => {
  const { name, icon, description, color } = req.body;
  db.prepare("INSERT INTO categories (name,icon,description,color) VALUES (?,?,?,?)").run(name, icon || "fa-tools", description, color || "#E8A838");
  res.redirect("/admin/categories?success=Category added");
});

router.post("/categories/:id/delete", (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.redirect("/admin/categories?success=Category deleted");
});

module.exports = router;`);

// ═══════════════════════════════════════════════════════════════
// routes/api.js
// ═══════════════════════════════════════════════════════════════
write("routes/api.js", `const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/handymen", (req, res) => {
  const handymen = db.prepare(\`SELECT u.id, u.name, u.avatar, hp.hourly_rate, hp.rating, hp.total_reviews, hp.experience_years, hp.verified, c.name as category FROM users u JOIN handyman_profiles hp ON hp.user_id = u.id LEFT JOIN categories c ON c.id = hp.category_id WHERE hp.available = 1 ORDER BY hp.rating DESC\`).all();
  res.json(handymen);
});

router.get("/categories", (req, res) => {
  res.json(db.prepare("SELECT * FROM categories").all());
});

module.exports = router;`);

log("\x1b[36m📝 Core files created\x1b[0m");

// ═══════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════
log("\x1b[36m📝 Creating view templates...\x1b[0m");

// ── partials/header.ejs ──
write("views/partials/header.ejs", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> — FixIt Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔧</text></svg>">
</head>
<body>
  <header class="header" id="header">
    <div class="container header__inner">
      <a href="/" class="logo">
        <span class="logo__icon"><i class="fa-solid fa-wrench"></i></span>
        <span class="logo__text">FixIt<span class="logo__accent">Pro</span></span>
      </a>
      <nav class="nav" id="nav">
        <a href="/" class="nav__link<%= page === 'home' ? ' active' : '' %>">Home</a>
        <a href="/browse" class="nav__link<%= page === 'browse' ? ' active' : '' %>">Find Help</a>
        <% if (currentUser) { %>
          <% if (currentUser.role === 'user') { %>
            <a href="/user/dashboard" class="nav__link<%= page.startsWith('user') ? ' active' : '' %>">Dashboard</a>
          <% } else if (currentUser.role === 'handyman') { %>
            <a href="/handyman/dashboard" class="nav__link<%= page.startsWith('handyman') ? ' active' : '' %>">Dashboard</a>
          <% } else if (currentUser.role === 'admin') { %>
            <a href="/admin/dashboard" class="nav__link<%= page.startsWith('admin') ? ' active' : '' %>">Admin</a>
          <% } %>
          <div class="nav__user">
            <span class="nav__greeting">Hi, <%= currentUser.name.split(' ')[0] %></span>
            <a href="/auth/logout" class="btn btn--sm btn--outline">Logout</a>
          </div>
        <% } else { %>
          <a href="/auth/login" class="nav__link<%= page === 'login' ? ' active' : '' %>">Sign In</a>
          <a href="/auth/register" class="btn btn--sm btn--primary">Get Started</a>
        <% } %>
      </nav>
      <button class="header__burger" id="burger" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <main>`);

// ── partials/footer.ejs ──
write("views/partials/footer.ejs", `  </main>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="logo">
            <span class="logo__icon"><i class="fa-solid fa-wrench"></i></span>
            <span class="logo__text">FixIt<span class="logo__accent">Pro</span></span>
          </a>
          <p>Connecting skilled professionals with homeowners since 2024. Quality work, trusted service.</p>
        </div>
        <div class="footer__links">
          <h4>Services</h4>
          <a href="/browse">Plumbing</a>
          <a href="/browse">Electrical</a>
          <a href="/browse">Carpentry</a>
          <a href="/browse">Painting</a>
        </div>
        <div class="footer__links">
          <h4>Company</h4>
          <a href="/">About Us</a>
          <a href="/">Careers</a>
          <a href="/">Contact</a>
          <a href="/">Blog</a>
        </div>
        <div class="footer__links">
          <h4>Support</h4>
          <a href="/">Help Center</a>
          <a href="/">Safety</a>
          <a href="/">Terms</a>
          <a href="/">Privacy</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; 2025 FixIt Pro. All rights reserved.</p>
        <div class="footer__social">
          <a href="#"><i class="fa-brands fa-twitter"></i></a>
          <a href="#"><i class="fa-brands fa-facebook"></i></a>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
          <a href="#"><i class="fa-brands fa-linkedin"></i></a>
        </div>
      </div>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>`);

// ── partials/messages.ejs ──
write("views/partials/messages.ejs", `<% if (typeof success !== 'undefined' && success) { %>
  <div class="alert alert--success"><i class="fa-solid fa-circle-check"></i> <%= success %></div>
<% } %>
<% if (typeof error !== 'undefined' && error) { %>
  <div class="alert alert--error"><i class="fa-solid fa-circle-exclamation"></i> <%= error %></div>
<% } %>`);

// ── partials/dashboard-sidebar.ejs ──
write("views/partials/dashboard-sidebar.ejs", `<aside class="sidebar" id="sidebar">
  <button class="sidebar__toggle" id="sidebarToggle" aria-label="Toggle sidebar">
    <i class="fa-solid fa-bars"></i> Menu
  </button>
  <div class="sidebar__header">
    <div class="sidebar__avatar">
      <i class="fa-solid fa-<%= role === 'admin' ? 'shield-halved' : role === 'handyman' ? 'hard-hat' : 'user' %>"></i>
    </div>
    <div>
      <strong><%= currentUser.name %></strong>
      <span class="sidebar__role"><%= role.charAt(0).toUpperCase() + role.slice(1) %></span>
    </div>
  </div>
  <nav class="sidebar__nav">
    <% if (role === 'user') { %>
      <a href="/user/dashboard" class="<%= active === 'dashboard' ? 'active' : '' %>"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <a href="/user/bookings" class="<%= active === 'bookings' ? 'active' : '' %>"><i class="fa-solid fa-calendar-check"></i> My Bookings</a>
      <a href="/browse"><i class="fa-solid fa-magnifying-glass"></i> Find Handyman</a>
      <a href="/user/profile" class="<%= active === 'profile' ? 'active' : '' %>"><i class="fa-solid fa-user-pen"></i> Profile</a>
    <% } else if (role === 'handyman') { %>
      <a href="/handyman/dashboard" class="<%= active === 'dashboard' ? 'active' : '' %>"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <a href="/handyman/bookings" class="<%= active === 'bookings' ? 'active' : '' %>"><i class="fa-solid fa-calendar-check"></i> Bookings</a>
      <a href="/handyman/profile" class="<%= active === 'profile' ? 'active' : '' %>"><i class="fa-solid fa-user-pen"></i> My Profile</a>
    <% } else if (role === 'admin') { %>
      <a href="/admin/dashboard" class="<%= active === 'dashboard' ? 'active' : '' %>"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <a href="/admin/users" class="<%= active === 'users' ? 'active' : '' %>"><i class="fa-solid fa-users"></i> Users</a>
      <a href="/admin/handymen" class="<%= active === 'handymen' ? 'active' : '' %>"><i class="fa-solid fa-hard-hat"></i> Handymen</a>
      <a href="/admin/bookings" class="<%= active === 'bookings' ? 'active' : '' %>"><i class="fa-solid fa-calendar-check"></i> Bookings</a>
      <a href="/admin/categories" class="<%= active === 'categories' ? 'active' : '' %>"><i class="fa-solid fa-tags"></i> Categories</a>
    <% } %>
    <div class="sidebar__divider"></div>
    <a href="/"><i class="fa-solid fa-house"></i> Main Site</a>
    <a href="/auth/logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
  </nav>
</aside>
<script>
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar--collapsed");
    });
  }
</script>`);

// ── error.ejs ──
write("views/error.ejs", `<%- include('partials/header') %>
<div class="container" style="padding:6rem 0;text-align:center;">
  <div style="font-size:4rem;margin-bottom:1rem;">🔧</div>
  <h1>Oops!</h1>
  <p class="text-muted" style="font-size:1.2rem;margin:1rem 0 2rem;"><%= message %></p>
  <a href="/" class="btn btn--primary">Back to Home</a>
</div>
<%- include('partials/footer') %>`);

// ── landing.ejs ──
write("views/landing.ejs", `<%- include('partials/header') %>

<section class="hero">
  <div class="hero__bg">
    <div class="hero__shape hero__shape--1"></div>
    <div class="hero__shape hero__shape--2"></div>
    <div class="hero__shape hero__shape--3"></div>
  </div>
  <div class="container hero__content">
    <div class="hero__text">
      <span class="hero__badge"><i class="fa-solid fa-star"></i> Trusted by 10,000+ homeowners</span>
      <h1 class="hero__title">Home repairs,<br><span class="gradient-text">done right.</span></h1>
      <p class="hero__subtitle">Connect with verified, skilled handymen in your area. From plumbing to painting — get quality work with transparent pricing and guaranteed satisfaction.</p>
      <div class="hero__actions">
        <a href="/browse" class="btn btn--primary btn--lg"><i class="fa-solid fa-magnifying-glass"></i> Find a Handyman</a>
        <a href="/auth/register?role=handyman" class="btn btn--outline btn--lg"><i class="fa-solid fa-tools"></p class="sectioni> Join as Pro</a>
      </div>
      <div class="hero__stats">
        <div class="hero__stat"><strong>500+</strong><span>Verified Pros</span></div>
        <div class="hero__stat"><strong>12k+</strong><span>Jobs Completed</span></div>
        <div class="hero__stat"><strong>4.8★</strong><span>Average Rating</span></div>
      </div>
    </div>
    <div class="hero__visual">
      <div class="hero__card-stack">
        <div class="hero__float-card hero__float-card--1">
          <i class="fa-solid fa-faucet-drip" style="color:#3B82F6"></i>
          <div><strong>Plumbing</strong><span>Fixed in 45 min</span></div>
          <span class="hero__float-check"><i class="fa-solid fa-check"></i></span>
        </div>
        <div class="hero__float-card hero__float-card--2">
          <i class="fa-solid fa-bolt" style="color:#F59E0B"></i>
          <div><strong>Electrical</strong><span>3 fans installed</span></div>
          <span class="hero__float-check"><i class="fa-solid fa-check"></i></span>
        </div>
        <div class="hero__float-card hero__float-card--3">
          <div class="hero__avatar-row">
            <div class="avatar-sm" style="background:#E8A838;">M</div>
            <div class="avatar-sm" style="background:#3B82F6;">T</div>
            <div class="avatar-sm" style="background:#8B5CF6;">E</div>
          </div>
          <div><strong>500+ Pros</strong><span>Ready to help</span></div__desc">From quick fixes to major projects, our verified professionals handle it all.</p>
    </div>
    <div class="services-grid">
      <% categories.forEach(cat => { %>
        <a href="/browse?category=<%= cat.id %>" class="service-card" style="--card-accent: <%= cat.color %>">
          <div class="service-card__icon"><i class="fa-solid <%= cat.icon %>"></i></div>
          <h3><%= cat.name %></h3>
          <p><%= cat.description %></p>
          <span class="service-card__arrow"><i class="fa-solid fa-arrow-right"></i></span>
        </a>
      <% }) %>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__header">
      <span class="section__label">How It Works</span>
      <h2 class="section__title">Three simple steps</h2>
    </div>
    <div class="steps">
      <div class="step">
        <div class="step__number">01</div>
        <div class="step__icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <h3>Search & Compare</h3>
        <p>Browse verified handymen by specialty, rating, and price. Read real reviews from real customers.</p>
      </div>
      <div class="step__connector"></div>
      <div class="step">
        <div class="step__number">02</div>
        <div class="step__icon"><i class="fa-solid fa-calendar-check"></i></div>
        <h3>Book & Schedule</h3>
        <p>Choose your date and time. Describe your project and get matched with the right professional.</p>
      </div>
      <div class="step__connector"></div>
      <div class="step">
        <div class="step__number">03</div>
        <div class="step__icon"><i class="fa-solid fa-handshake"></i></div>
        <h3>Relax & Done</h3>
        <p>Your handyman arrives on time, completes the work, and you pay only when satisfied.</p>
      </div>
    </div>
  </div>
</section>

<section>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="container">
    <div class="section__header">
      <span class="section__label">What We Cover</span>
      <h2 class="section__title">Every service your home needs</h2>
      < class="section section %>" class="handyman-card">
            <div class="handyman-card__top" style="--accent: <%= h.cat_color || '#E8A838' %>">
              <div class="handyman-card__avatar">
                <span><%= h.name.charAt(0) %></span>
                <% if (h.verified) { %><span class="verified-badge"><i class="fa-solid fa-check"></i></span><% } %>
              </div>
              <h3><%= h.name %></h3>
              <span class="handyman-card__category"><i class="fa-solid <%= h.cat_icon %>"></i> <%= h.category %></span>
            </div>
            <div class="handyman-card__body">
              <p><%= h.bio ? h.bio.substring(0, 120) + '...' : '' %></p>
              <div class="handyman-card__meta">
                <span class="handyman-card__rating"><i class="fa-solid fa-star"></i> <%= h.rating.toFixed(1) %> <small>(<%= h.total_reviews %>)</small></span>
                <span class="handyman-card__price">$<%= h.hourly_rate %>/hr</span>
              </div>
              <div class="handyman-card__details">
                <span><i class="fa-solid fa-briefcase"></i> <%= h.experience_years %>y exp</span>
                <span><i class="fa-solid fa-location-dot"></i> <%= h.service_area || 'Local' %></span>
              </div>
            </div>
          </a>
        <% }) %>
      </div>
    <% } %>
  </div>
</section>
<%- include('partials/footer') %>`);

// ── profile.ejs ──
write("views/profile.ejs", `<%- include('partials/header') %>
<section class="page-header">
  <div class="container">
    <a href="/browse" class="btn btn--sm btn--outline" style="margin-bottom:1rem;display:inline-flex;"><i class="fa-solid fa-arrow-left"></i> Back to Browse</a>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container">
    <%- include('partials/messages') %>
    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-card__header" style="--accent: <%= handyman.cat_color || '#E8A838' %>">
          <div class="profile-card__avatar"><span><%= handyman.name.charAt(0) %></span></div>
          <h1><%= handyman.name %> <% if (handyman.verified) { %><span class="verified-badge"><i class="fa-solid fa-check"></i></span><% } %></h1>
          <span class="profile-card__category"><i class="fa-solid <%= handyman.cat_icon %>"></i> <%= handyman.category %></span>
        </div>
        <div class="profile-card__body">
          <div class="profile-card__stats">
            <div class="stat-pill"><i class="fa-solid fa-star"></i> <%= handyman.rating.toFixed(1) %> (<%= handyman.total_reviews %> reviews)</div>
            <div class="stat-pill"><i class="fa-solid fa-briefcase"></i> <%= handyman.experience_years %> years</div>
            <div class="stat-pill"><i class="fa-solid fa-check-double"></i> <%= handyman.total_jobs %> jobs done</div>
            <div class="stat-pill"><i class="fa-solid fa-dollar-sign"></i> $<%= handyman.hourly_rate %>/hr</div>
          </div>
          <h3>About</h3>
          <p><%= handyman.bio || 'No bio provided yet.' %></p>
          <div class="profile-card__info">
            <div><i class="fa-solid fa-location-dot"></i> <strong>Service Area:</strong> <%= handyman.service_area || 'Not specified' %></div>
            <div><i class="fa-solid fa-phone"></i> <strong>Phone:</strong> <%= handyman.phone || 'Not provided' %></div>
            <div><i class="fa-solid fa-circle" style="color:<%= handyman.available ? '#10B981' : '#EF4444' %>;font-size:0.5rem;"></i> <strong>Status:</strong> <%= handyman.available ? 'Available for work' : 'Currently unavailable' %></div>
          </div>
          <% if (currentUser && currentUser.role === 'user') { %>
            <a href="/user/book/<%= handyman.id %>" class="btn btn--primary btn--lg" style="width:100%;margin-top:1.5rem;"><i class="fa-solid fa-calendar-check"></i> Book This Handyman</a>
          <% } else if (!currentUser) { %>
            <a href="/auth/login" class="btn btn--primary btn--lg" style="width:100%;margin-top:1.5rem;">Sign in to Book</a>
          <% } %>
        </div>
      </div>
      <div class="profile-reviews">
        <h2>Reviews (<%= reviews.length %>)</h2>
        <% if (reviews.length === 0) { %>
          <div class="empty-state"><p>No reviews yet. Be the first to book and review!</p></div>
        <% } else { %>
          <% reviews.forEach(r => { %>
            <div class="review-card">
              <div class="review-card__header">
                <div class="avatar-sm" style="background:#3B82F6"><%= r.reviewer_name.charAt(0) %></div>
                <div>
                  <strong><%= r.reviewer_name %></strong>
                  <div class="review-card__stars">
                    <% for (let i = 1; i <= 5; i++) { %>
                      <i class="fa-<%= i <= r.rating ? 'solid' : 'regular' %> fa-star"></i>
                    <% } %>
                  </div>
                </div>
                <span class="review-card__date"><%= new Date(r.created_at).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) %></span>
              </div>
              <p><%= r.comment %></p>
            </div>
          <% }) %>
        <% } %>
      </div>
    </div>
  </div>
</section>
<%- include('partials/footer') %>`);

// ── auth/login.ejs ──
write("views/auth/login.ejs", `<%- include('../partials/header') %>
<section class="auth-section">
  <div class="auth-card">
    <div class="auth-card__header">
      <span class="logo__icon" style="font-size:2rem;"><i class="fa-solid fa-wrench"></i></span>
      <h1>Welcome back</h1>
      <p>Sign in to your FixIt Pro account</p>
    </div>
    <%- include('../partials/messages') %>
    <form action="/auth/login" method="POST" class="form">
      <div class="form__group">
        <label for="email"><i class="fa-solid fa-envelope"></i> Email</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required>
      </div>
      <div class="form__group">
        <label for="password"><i class="fa-solid fa-lock"></i> Password</label>
        <input type="password" id="password" name="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn--primary btn--lg" style="width:100%;">Sign In</button>
    </form>
    <div class="auth-card__footer">
      <p>Don't have an account? <a href="/auth/register">Create one free</a></p>
    </div>
    <div class="auth-card__demo">
      <p><strong>Demo Accounts</strong> (password: <code>password123</code>)</p>
      <div class="demo-accounts">
        <code>admin@fixitpro.com</code>
        <code>john@example.com</code>
        <code>mike@fixitpro.com</code>
      </div>
    </div>
  </div>
</section>
<%- include('../partials/footer') %>`);

// ── auth/register.ejs ──
write("views/auth/register.ejs", `<%- include('../partials/header') %>
<section class="auth-section">
  <div class="auth-card auth-card--wide">
    <div class="auth-card__header">
      <span class="logo__icon" style="font-size:2rem;"><i class="fa-solid fa-wrench"></i></span>
      <h1>Create your account</h1>
      <p>Join FixIt Pro — it's free!</p>
    </div>
    <%- include('../partials/messages') %>
    <form action="/auth/register" method="POST" class="form" id="registerForm">
      <div class="1>
      <form__row">
        <div class="form__group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" placeholder="John Smith" required>
        </div>
        <div class="form__group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required>
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Min 6 characters" required minlength="6">
        </div>
        <div class="form__group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" placeholder="555-0100">
        </div>
      </div>
      <div class="form__group">
        <label for="address">Address</label>
        <input type="text" id="address" name="address" placeholder="123 Main St, City">
      </div>
      <div class="form__group">
        <label>I want to:</label>
        <div class="role-toggle">
          <label class="role-option active" id="roleUser">
            <input type="radio" name="role" value="user" checked>
            <i class="fa-solid fa-user"></i>
            <span>Hire a Handyman</span>
          </label>
          <label class="role-option" id="roleHandyman">
            <input type="radio" name="role" value="handyman">
            <i class="fa-solid fa-tools"></i>
            <span>Work as a Handyman</span>
          </label>
        </div>
      </div>
      <div id="handymanFields" style="display:none;">
        <div class="form__row">
          <div class="form__group">
            <label for="category_id">Specialty</label>
            <select id="category_id" name="category_id">
              <option value="">Select a category</option>
              <% categories.forEach(c => { %>
                <option value="<%= c.id %>"><%= c.name %></option>
              <% }) %>
            </select>
          </div>
          <div class="form__group">
            <label for="hourly_rate">Hourly Rate ($)</label>
            <input type="number" id="hourly_rate" name="hourly_rate" placeholder="50" min="0">
          </div>
        </div>
        <div class="form__row">
          <div class="form__group">
            <label for="experience_years">Years of Experience</label>
            <input type="number" id="experience_years" name="experience_years" placeholder="5" min="0">
          </div>
          <div class="form__group">
            <label for="service_area">Service Area</label>
            <input type="text" id="service_area" name="service_area" placeholder="Downtown & Suburbs">
          </div>
        </div>
        <div class="form__group">
          <label for="bio">Bio / Description</label>
          <textarea id="bio" name="bio" rows="3" placeholder="Tell customers about your skills and experience..."></textarea>
        </div>
      </div>
      <button type="submit" class="btn btn--primary btn--lg" style="width:100%;">Create Account</button>
    </form>
    <div class="auth-card__footer">
      <p>Already have an account? <a href="/auth/login">Sign in</a></p>
    </div>
  </div>
</section>
<script>
  document.querySelectorAll(".role-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".role-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      document.getElementById("handymanFields").style.display = opt.querySelector("input").value === "handyman" ? "block" : "none";
    });
  });
</script>
<%- include('../partials/footer') %>`);

// ── user/dashboard.ejs ──
write("views/user/dashboard.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'user', active: 'dashboard' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header">
      <h1>Dashboard</ha href="/browse %></span><span class="stat-card__label">Total Bookings</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#FFFBEB;color:#F59E0B;"><i class="fa-solid fa-clock"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.pending %></span><span class="stat-card__label">Pending</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#F0FDF4;color:#10B981;"><i class="fa-solid fa-spinner"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.active %></span><span class="stat-card__label">Active</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#F5F3FF;color:#8B5CF6;"><i class="fa-solid fa-circle-check"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.completed %></span><span class="stat-card__label">Completed</span></div></div>
    </div>
    <div class="card">
      <div class="card__header"><h2>Recent Bookings</h2><a href="/user/bookings" class="btn btn--sm btn--outline">View All</a></div>
      <% if (bookings.length === 0) { %>
        <div class="empty-state"><i class="fa-solid fa-calendar-plus"></i><h3>No bookings yet</h3><p>Find a handyman and book your first service!</p><a href="/browse" class="btn btn--primary">Browse Handymen</a></div>
      <% } else { %>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Service</th><th>Handyman</th><th>Date</th><th>Status</th><th>Price</th></tr></thead>
            <tbody>
              <% bookings.forEach(b => { %>
                <tr>
                  <td><%= b.service_description.substring(0, 40) %>...</td>
                  <td<%= i %>><strong><%= b.handyman_name %></strong></td>
                  <td><%= b.scheduled_date || 'TBD' %></td>
                  <td><span class="badge badge--<%= b.status %>"><%= b.status.replace('_',' ') %></span></td>
                  <td><%= b.total_price ? '$' + b.total_price : 'TBD' %></td>
                </tr>
              <% }) %>
            </tbody>
          </table>
        </div>
      <% } %>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── user/bookings.ejs ──
write("views/user/bookings.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'user', active: 'bookings' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>My Bookings</h1></div>
    <%- include('../partials/messages') %>
    <div class="filter-tabs">
      <a href="/user/bookings" class="<%= !filter ? 'active' : '' %>">All</a>
      <a href="/user/bookings?status=pending" class="<%= filter === 'pending' ? 'active' : '' %>">Pending</a>
      <a href="/user/bookings?status=accepted" class="<%= filter === 'accepted' ? 'active' : '' %>">Accepted</a>
      <a href="/user/bookings?status=in_progress" class="<%= filter === 'in_progress' ? 'active' : '' %>">In Progress</a>
      <a href="/user/bookings?status=completed" class="<%= filter === 'completed' ? 'active' : '' %>">Completed</a>
      <a href="/user/bookings?status=cancelled" class="<%= filter === 'cancelled' ? 'active' : '' %>">Cancelled</a>
    </div>
    <% if (bookings.length === 0) { %>
      <div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><h3>No bookings found</h3><a href="/browse" class="btn btn--primary">Find a Handyman</a></div>
    <% } else { %>
      <div class="bookings-list">
        <% bookings.forEach(b => { %>
          <div class="booking-item">
            <div class="booking-item__main">
              <div class="booking-item__info">
                <h3><%= b.service_description %></h3>
                <p><i class="fa-solid fa-user"></i> <%= b.handyman_name %> &nbsp; <i class="fa-solid fa-location-dot"></i> <%= b.address %></p>
                <p><i class="fa-solid fa-calendar"></i> <%= b.scheduled_date || 'TBD' %> <%= b.scheduled_time || '' %></p>
              </div>
              <div class="booking-item__status">
                <span class="badge badge--<%= b.status %>"><%= b.status.replace('_',' ') %></span>
                <% if (b.total_price) { %><span class="booking-item__price">$<%= b.total_price %></span><% } %>
              </div>
            </div>
            <div class="booking-item__actions">
              <% if (['pending','accepted'].includes(b.status)) { %>
                <form action="/user/bookings/<="input-sm"%= b.id %>/cancel" method="POST" onsubmit="return confirm('Cancel this booking?')">
                  <button class="btn btn--sm btn--danger">Cancel</button>
                </form>
              <% } %>
              <% if (b.status === 'completed') { %>
                <button class="btn btn--sm btn--primary" onclick="document.getElementById('review-<%= b.id %>').style.display='block'">Leave Review</button>
              <% } %>
            </div>
            <% if (b.status === 'completed') { %>
              <div class="review-form" id="review-<%= b.id %>" style="display:none;">
                <form action="/user/bookings/<%= b.id %>/review" method="POST">
                  <div class="form__group">
                    <label>Rating</label>
                    <div class="star-input">
                      <% for (let i = 5; i >= 1; i--) { %>
                        <input type="radio" name="rating" value="<%= i %>" id="star-<%= b.id %>-<%= i %>" required>
                        <label for="star-<%= b.id %>-"><i class=".forEach(b => { %>
          <div class="booking-item booking-item--highlight">
            <div class="booking-item__main">
              <div class="booking-item__info">
                <h3><%= b.service_description %></h3>
                <p><i class="fa-solid fa-user"></i> <%= b.user_name %> &nbsp; <i class="fa-solid fa-phone"></i> <%= b.user_phone || 'N/A' %></p>
                <p><i class="fa-solid fa-location-dot"></i> <%= b.address %></p>
                <p><i class="fa-solid fa-calendar"></i> <%= b.scheduled_date || 'Flexible' %> <%= b.scheduled_time || '' %></p>
                <% if (b.notes) { %><p><i class="fa-solid fa-note-sticky"></i> <%= b.notes %></p><% } %>
              </div>
            </div>
            <div class="booking-item__actions">
              <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                <input type="hidden" name="status" value="accepted">
                <button class="btn btn--sm btn--primary"><i class="fa-solid fa-check"></i> Accept</button>
              </form>
              <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;" onsubmit="return confirm('Decline this request?')">
                <input type="hidden" name="status" value="declined">
                <button class="btn btn--sm btn--danger"><i class="fa-solid fa-xmark"></i> Decline</button>
              </form>
            </div>
          </div>
        <% }) %>
      </div>
    <% } %>
    <% if (active.length > 0) { %>
      <div class="card">
        <div class="card__header"><h2>Active Jobs</h2></div>
        <% active.forEach(b => { %>
          <div class="booking-item">
            <div class="booking-item__main">
              <div class="booking-item__info">
                <h3><%= b.service_description %></h3>
                <p><i class="fa-solid fa-user"></i> <%= b.user_name %> &nbsp; <i class="fa-solid fa-calendar"></i> <%= b.scheduled_date || 'TBD' %></p>
              </div>
              <span class="badge badge--<%= b.status %>"><%= b.status.replace('_',' ') %></span>
            </div>
            <div class="booking-item__actions">
              <% if (b.status === 'accepted') { %>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="in_progress">
                  <button class="btn btn--sm btn--outline">Start Job</button>
                </form>
              <% } %>
              <% if (b.status === 'in_progress') { %>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="completed">
                  <div style="display:flex;gap:0.5rem;align-items:center;">
                    <input type="number" name="total_price" placeholder="Price ($)" step="0.01" min="0" class required>
                    < <div class="booking-item__status">
                <span class="badge badge--<%= b.status %>"><%= b.status.replace('_',' ') %></span>
                <% if (b.total_price) { %><span class="booking-item__price">$<%= b.total_price %></span><% } %>
              </div>
            </div>
            <div class="booking-item__actions">
              <% if (b.status === 'pending') { %>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="accepted"><button class="btn btn--sm btn--primary">Accept</button>
                </form>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="declined"><button class="btn btn--sm btn--danger">Decline</button>
                </form>
              <% } else if (b.status === 'accepted') { %>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="in_progress"><button class="btn btn--sm btn--outline">Start Job</button>
                </form>
              <% } else if (b.status === 'in_progress') { %>
                <form action="/handyman/bookings/<%= b.id %>/status" method="POST" style="display:inline;">
                  <input type="hidden" name="status" value="completed">
                  <div style="display:flex;gap:0.5rem;align-items:center;">
                    <input type="number" name="total_price" placeholder="Price ($)" step="0.01" min="0" class="input-sm" required>
                    <button class="btn btn--sm btn--primary">Complete & Bill</button>
                  </div>
                </form>
              <% } %>
            </div>
          </div>
        <% }) %>
      </div>
    <% } %>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── handyman/profile.ejs ──
write("views/handyman/profile.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'handyman', active: 'profile' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>My Profile</h1></div>
    <%- include('../partials/messages') %>
    <div class="card" style="max-width:700px;">
      <div style="display:flex;gap:1rem;align-items:center;padding-bottom:1.5rem;border-bottom:1px solid var(--border);margin-bottom:1.5rem;">
        <div class="stat-card__icon" style="background:#EFF6FF;color:#3B82F6;font-size:1.5rem;width:3.5rem;height:3.5rem;"><i class="fa-solid fa-star"></i></div>
        <div>
          <strong style="font-size:1.3rem;"><%= profile.rating.toFixed(1) %> / 5.0</strong>
          <p class="text-muted"><%= profile.total_reviews %> reviews — <%= profile.total_jobs %> jobs completed</p>
        </div>
      </div>
      <form action="/handyman/profile" method="POST" class="form">
        <h3 style="margin-bottom:1rem;">Personal Information</h3>
        <div class="form__row">
          <div class="form__group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" value="<%= profile.name %>" required>
          </div>
          <div class="form__group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" value="<%= profile.phone || '' %>">
          </div>
        </div>
        <div class="form__group">
          <label for="address">Address</label>
          <input type="text" id="address" name="address" value="<%= profile.address || '' %>">
        </div>
        <h3 style="margin:1.5rem 0 1rem;">Professional Details</h3>
        <div class="form__row">
          <div class="form__group">
            <label for="category_id">Specialty</label>
            <select id="category_id" name="category_id">
              <option value="">Select</option>
              <% categories.forEach(c => { %>
                <option value="<%= c.id %>" <%= profile.category_id == c.id ? 'selected' : '' %>><%= c.name %></option>
              <% }) %>
            </select>
          </div>
          <div class="form__group">
            <label for="hourly_rate">Hourly Rate ($)</label>
            <input type="number" id="hourly_rate" name="hourly_rate" value="<%= profile.hourly_rate %>" min="0" step="5">
          </div>
        </div>
        <div class="form__row">
          <div class="form__group">
            <label for="experience_years">Years of Experience</label>
            <input type="number" id="experience_years" name="experience_years" value="<%= profile.experience_years %>" min="0">
          </div>
          <div class="form__group">
            <label for="service_area">Service Area</label>
            <input type="text" id="service_area" name="service_area" value="<%= profile.service_area || '' %>">
          </div>
        </div>
        <div class="form__group">
          <label for="bio">Bio</label>
          <textarea id="bio" name="bio" rows="4"><%= profile.bio || '' %></textarea>
        </div>
        <div class="form__group">
          <label class="checkbox-label">
            <input type="checkbox" name="available" <%= profile.available ? 'checked' : '' %>>
            <span>Available for new jobs</span>
          </label>
        </div>
        <button type="submit" class="btn btn--primary"><i class="fa-solid fa-save"></i> Save Changes</button>
      </form>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── admin/dashboard.ejs ──
write("views/admin/dashboard.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'admin', active: 'dashboard' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>Admin Dashboard</h1><span class="badge badge--admin">Super Admin</span></div>
    <%- include('../partials/messages') %>
    <div class="stats-grid stats-grid--6">
      <div class="stat-card"><div class="stat-card__icon" style="background:#EFF6FF;color:#3B82F6;"><i class="fa-solid fa-users"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.users %></span><span class="stat-card__label">Users</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#F0FDF4;color:#10B981;"><i class="fa-solid fa-hard-hat"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.handymen %></span><span class="stat-card__label">Handymen</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#FFFBEB;color:#F59E0B;"><i class="fa-solid fa-clipboard-list"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.bookings %></span><span class="stat-card__label">Bookings</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#F5F3FF;color:#8B5CF6;"><i class="fa-solid fa-dollar-sign"></i></div><div class="stat-card__info"><span class="stat-card__value">$<%= stats.revenue.toLocaleString() %></span><span class="stat-card__label">Revenue</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#FFF7ED;color:#F97316;"><i class="fa-solid fa-clock"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.pending %></span><span class="stat-card__label">Pending</span></div></div>
      <div class="stat-card"><div class="stat-card__icon" style="background:#ECFDF5;color:#059669;"><i class="fa-solid fa-check-double"></i></div><div class="stat-card__info"><span class="stat-card__value"><%= stats.completed %></span><span class="stat-card__label">Completed</span></div></div>
    </div>
    <div class="admin-grid">
      <div class="card">
        <div class="card__header"><h2>Recent Bookings</h2><a href="/admin/bookings" class="btn btn--sm btn--outline">View All</a></div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>ID</th><th>User</th><th>Handyman</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <% recentBookings.forEach(b => { %>
                <tr>
                  <td>#<%= b.id %></td>
                  <td><%= b.user_name %></td>
                  <td><%= b.handyman_name %></td>
                  <td><span class="badge badge--<%= b.status %>"><%= b.status %></span></td>
                  <td><%= b.scheduled_date || 'TBD' %></td>
                </tr>
              <% }) %>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card__header"><h2>Top Handymen</h2></div>
        <% topHandymen.forEach((h, i) => { %>
          <div class="leaderboard-item">
            <span class="leaderboard-item__rank">#<%= i + 1 %></span>
            <div class="avatar-sm" style="background:var(--accent);"><%= h.name.charAt(0) %></div>
            <div style="flex:1;"><strong><%= h.name %></strong><span class="text-muted"><%= h.category %></span></div>
            <span class="leaderboard-item__rating"><i class="fa-solid fa-star"></i> <%= h.rating.toFixed(1) %></span>
          </div>
        <% }) %>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── admin/users.ejs ──
write("views/admin/users.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'admin', active: 'users' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>Manage Users</h1></div>
    <%- include('../partials/messages') %>
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            <% users.forEach(u => { %>
              <tr>
                <td>#<%= u.id %></td>
                <td><strong><%= u.name %></strong></td>
                <td><%= u.email %></td>
                <td><%= u.phone || '—' %></td>
                <td><%= new Date(u.created_at).toLocaleDateString() %></td>
                <td>
                  <form action="/admin/users/<%= u.id %>/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete this user?')">
                    <button class="btn btn--sm btn--danger"><i class="fa-solid fa-trash"></i></button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── admin/handymen.ejs ──
write("views/admin/handymen.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'admin', active: 'handymen' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>Manage Handymen</h1></div>
    <%- include('../partials/messages') %>
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead><tr><th>Name</th><th>Category</th><th>Rate</th><th>Rating</th><th>Jobs</th><th>Verified</th><th>Actions</th></tr></thead>
          <tbody>
            <% handymen.forEach(h => { %>
              <tr>
                <td><strong><%= h.name %></strong><br><small class="text-muted"><%= h.email %></small></td>
                <td><%= h.category || '—' %></td>
                <td>$<%= h.hourly_rate %>/hr</td>
                <td><i class="fa-solid fa-star" style="color:#F59E0B;"></i> <%= h.rating.toFixed(1) %> (<%= h.total_reviews %>)</td>
                <td><%= h.total_jobs %></td>
                <td>
                  <form action="/admin/handymen/<%= h.id %>/verify" method="POST" style="display:inline;">
                    <input type="hidden" name="verified" value="<%= h.verified ? 0 : 1 %>">
                    <button class="btn btn--sm <%= h.verified ? 'btn--primary' : 'btn--outline' %>">
                      <i class="fa-solid fa-<%= h.verified ? 'check' : 'xmark' %>"></i> <%= h.verified ? 'Verified' : 'Verify' %>
                    </button>
                  </form>
                </td>
                <td>
                  <form action="/admin/handymen/<%= h.id %>/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete this handyman?')">
                    <button class="btn btn--sm btn--danger"><i class="fa-solid fa-trash"></i></button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── admin/bookings.ejs ──
write("views/admin/bookings.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'admin', active: 'bookings' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>Manage Bookings</h1></div>
    <%- include('../partials/messages') %>
    <div class="filter-tabs">
      <a href="/admin/bookings" class="<%= !filter ? 'active' : '' %>">All</a>
      <a href="/admin/bookings?status=pending" class="<%= filter === 'pending' ? 'active' : '' %>">Pending</a>
      <a href="/admin/bookings?status=accepted" class="<%= filter === 'accepted' ? 'active' : '' %>">Accepted</a>
      <a href="/admin/bookings?status=in_progress" class="<%= filter === 'in_progress' ? 'active' : '' %>">In Progress</a>
      <a href="/admin/bookings?status=completed" class="<%= filter === 'completed' ? 'active' : '' %>">Completed</a>
      <a href="/admin/bookings?status=declined" class="<%= filter === 'declined' ? 'active' : '' %>">Declined</a>
      <a href="/admin/bookings?status=cancelled" class="<%= filter === 'cancelled' ? 'active' : '' %>">Cancelled</a>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead><tr><th>ID</th><th>User</th><th>Handyman</th><th>Description</th><th>Date</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            <% bookings.forEach(b => { %>
              <tr>
                <td>#<%= b.id %></td>
                <td><%= b.user_name %></td>
                <td><%= b.handyman_name %></td>
                <td><%= b.service_description.substring(0, 35) %>...</td>
                <td><%= b.scheduled_date || 'TBD' %></td>
                <td><span class="badge badge--<%= b.status %>"><%= b.status %></span></td>
                <td><%= b.total_price ? '$' + b.total_price : '—' %></td>
                <td>
                  <form action="/admin/bookings/<%= b.id %>/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete?')">
                    <button class="btn btn--sm btn--danger"><i class="fa-solid fa-trash"></i></button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

// ── admin/categories.ejs ──
write("views/admin/categories.ejs", `<%- include('../partials/header') %>
<div class="dashboard-layout">
  <%- include('../partials/dashboard-sidebar', { role: 'admin', active: 'categories' }) %>
  <div class="dashboard-main">
    <div class="dashboard-main__header"><h1>Manage Categories</h1></div>
    <%- include('../partials/messages') %>
    <div class="admin-grid">
      <div class="card">
        <div class="card__header"><h2>Add Category</h2></div>
        <form action="/admin/categories" method="POST" class="form">
          <div class="form__group">
            <label>Name</label>
            <input type="text" name="name" placeholder="e.g., Roofing" required>
          </div>
          <div class="form__row">
            <div class="form__group">
              <label>Icon (FontAwesome class)</label>
              <input type="text" name="icon" placeholder="fa-hammer" value="fa-tools">
            </div>
            <div class="form__group">
              <label>Color</label>
              <input type="color" name="color" value="#E8A838">
            </div>
          </div>
          <div class="form__group">
            <label>Description</label>
            <textarea name="description" rows="2" placeholder="Category description..."></textarea>
          </div>
          <button type="submit" class="btn btn--primary"><i class="fa-solid fa-plus"></i> Add Category</button>
        </form>
      </div>
      <div class="card">
        <div class="card__header"><h2>Existing Categories</h2></div>
        <% categories.forEach(c => { %>
          <div class="category-item">
            <div class="category-item__icon" style="background:<%= c.color %>20;color:<%= c.color %>;">
              <i class="fa-solid <%= c.icon %>"></i>
            </div>
            <div style="flex:1;">
              <strong><%= c.name %></strong>
              <p class="text-muted"><%= c.description || 'No description' %> — <%= c.handyman_count %> handymen</p>
            </div>
            <form action="/admin/categories/<%= c.id %>/delete" method="POST" onsubmit="return confirm('Delete?')">
              <button class="btn btn--sm btn--danger"><i class="fa-solid fa-trash"></i></button>
            </form>
          </div>
        <% }) %>
      </div>
    </div>
  </div>
</div>
<%- include('../partials/footer') %>`);

log("\x1b[36m📝 View templates created\x1b[0m");

// ═══════════════════════════════════════════════════════════════
// CSS — public/css/style.css
// ═══════════════════════════════════════════════════════════════
log("\x1b[36m📝 Creating CSS...\x1b[0m");

write("public/css/style.css", `/* ═══════════════════════════════════════════════════════
   FixIt Pro v2 — Complete Stylesheet
   ═══════════════════════════════════════════════════════ */

:root {
  --bg: #F8F7F4;
  --bg-dark: #0F1117;
  --bg-warm: #FAF8F5;
  --surface: #FFFFFF;
  --surface-dark: #1A1D27;
  --surface-dark-2: #222632;
  --surface-dark-3: #2A2E3D;
  --accent: #E8A838;
  --accent-hover: #D4952E;
  --accent-light: rgba(232, 168, 56, 0.1);
  --accent-glow: rgba(232, 168, 56, 0.25);
  --primary: #1A1D27;
  --text: #1A1D27;
  --text-light: #F8F7F4;
  --text-muted: #6B7280;
  --text-muted-light: #9CA3AF;
  --border: #E5E7EB;
  --border-light: #F0EDE8;
  --border-dark: #2D3142;
  --success: #10B981;
  --success-bg: rgba(16, 185, 129, 0.1);
  --warning: #F59E0B;
  --warning-bg: rgba(245, 158, 11, 0.1);
  --danger: #EF4444;
  --danger-bg: rgba(239, 68, 68, 0.1);
  --info: #3B82F6;
  --info-bg: rgba(59, 130, 246, 0.1);
  --purple: #8B5CF6;
  --purple-bg: rgba(139, 92, 246, 0.1);
  --radius: 14px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 48px rgba(0,0,0,0.12);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.16);
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: 0.15s ease;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body { font-family: var(--font-body); color: var(--text); background: var(--bg); line-height: 1.6; overflow-x: hidden; opacity: 0; transition: opacity 0.4s ease; }
body.loaded { opacity: 1; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
input, select, textarea, button { font-family: inherit; font-size: inherit; }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 700; line-height: 1.2; }
::selection { background: var(--accent); color: #000; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.container { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }
.text-muted { color: var(--text-muted); }
.gradient-text { background: linear-gradient(135deg, var(--accent), #F59E0B, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.4rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.9rem; border: 2px solid transparent; cursor: pointer; transition: var(--transition); white-space: nowrap; position: relative; overflow: hidden; }
.btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: var(--transition); }
.btn:hover::after { opacity: 1; }
.btn--primary { background: var(--accent); color: #000; border-color: var(--accent); }
.btn--primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }
.btn--outline { background: transparent; border-color: var(--border); color: var(--text); }
.btn--outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn--danger { background: transparent; border-color: var(--danger); color: var(--danger); }
.btn--danger:hover { background: var(--danger); color: #fff; transform: translateY(-1px); }
.btn--ghost { background: transparent; border-color: rgba(255,255,255,0.2); color: var(--text-light); }
.btn--ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(232,168,56,0.08); }
.btn--sm { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
.btn--lg { padding: 0.85rem 1.8rem; font-size: 1rem; }
.btn--icon { width: 40px; height: 40px; padding: 0; justify-content: center; border-radius: 50%; }
.btn:active { transform: translateY(0) scale(0.98); }

/* Toast */
.toast { position: fixed; top: 84px; right: 1.5rem; z-index: 9999; display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.2rem; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg); font-size: 0.9rem; font-weight: 500; transform: translateX(120%); opacity: 0; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); max-width: 420px; }
.toast--visible { transform: translateX(0); opacity: 1; }
.toast--success { border-left: 4px solid var(--success); }
.toast--success i { color: var(--success); }
.toast--error { border-left: 4px solid var(--danger); }
.toast--error i { color: var(--danger); }
.toast--info { border-left: 4px solid var(--info); }
.toast--info i { color: var(--info); }
.toast__close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.2rem; margin-left: 0.5rem; transition: var(--transition-fast); }
.toast__close:hover { color: var(--text); }

/* Alerts */
.alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.2rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; transition: all 0.3s ease; }
.alert--success { background: var(--success-bg); color: #065F46; border: 1px solid rgba(16,185,129,0.2); }
.alert--error { background: var(--danger-bg); color: #991B1B; border: 1px solid rgba(239,68,68,0.2); }

/* Header */
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(15, 17, 23, 0.75); backdrop-filter: blur(24px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.04); transition: all 0.35s ease; }
.header--scrolled { background: rgba(15, 17, 23, 0.95); border-bottom-color: rgba(255,255,255,0.08); box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
.header__inner { display: flex; align-items: center; justify-content: space-between; height: 70px; }
.logo { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-display); font-weight: 800; font-size: 1.35rem; color: var(--text-light); transition: var(--transition); }
.logo:hover { opacity: 0.85; }
.logo__icon { color: var(--accent); font-size: 1.15rem; }
.logo__accent { color: var(--accent); }
.nav { display: flex; align-items: center; gap: 0.25rem; }
.nav__link { padding: 0.5rem 0.9rem; border-radius: var(--radius-sm); color: var(--text-muted-light); font-weight: 500; font-size: 0.88rem; transition: var(--transition); position: relative; }
.nav__link:hover, .nav__link.active { color: var(--text-light); background: rgba(
