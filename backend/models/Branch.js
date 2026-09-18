const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    email: { type: String },
    phone: { type: String },
    joined: { type: Number },
    bio: { type: String },
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "Landmark" },
    description: { type: String },
    headcount: { type: Number, default: 0 },
    hierarchy: { type: [personSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Branch || mongoose.model("Branch", branchSchema);
