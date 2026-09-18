// Run with: npm run seed
// Wipes and re-inserts the 33 branches. Does NOT touch the users collection.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const Branch = require("../models/Branch");
const { buildSeedBranches } = require("./seedData");

(async () => {
  try {
    await connectDB();
    await Branch.deleteMany({});
    const branches = buildSeedBranches();
    await Branch.insertMany(branches);
    console.log(`[seed] Inserted ${branches.length} branches into MongoDB.`);
  } catch (err) {
    console.error("[seed] Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
