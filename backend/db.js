const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  if (connected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy backend/.env.example to backend/.env and paste in your free MongoDB Atlas connection string."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "che_dashboard",
  });

  connected = true;
  console.log("[db] Connected to MongoDB:", mongoose.connection.name);

  mongoose.connection.on("disconnected", () => {
    connected = false;
    console.warn("[db] MongoDB disconnected");
  });

  return mongoose.connection;
}

module.exports = connectDB;
