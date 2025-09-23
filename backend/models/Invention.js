// backend/models/Invention.js
const mongoose = require("mongoose");

const InventionSchema = new mongoose.Schema(
  {
    project_id: {
      type: Number,
      required: true,
      unique: true, // Added unique constraint for project_id
    },
    u_id: {
      type: Number,
      required: true,
      ref: "registration",
    },
    pdf_text: {
      type: String,
      required: true,
    },
    project_title: {
      type: String,
      required: true, // Set to true as we'll generate it before saving
      default: "Untitled Project", // Add a default in case generation fails
    },
  },
  {
    timestamps: true, // This will add `createdAt` and `updatedAt` fields
  }
);

// Add index for faster lookups by u_id
InventionSchema.index({ u_id: 1 });

const Invention = mongoose.model("Invention", InventionSchema);

module.exports = Invention;
