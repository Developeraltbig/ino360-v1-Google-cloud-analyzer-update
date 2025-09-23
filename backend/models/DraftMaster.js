const mongoose = require("mongoose");

// Define the schema for the DraftMaster collection
const DraftMasterSchema = new mongoose.Schema(
  {
    title_of_invention: {
      type: String,
      required: true,
    },
    background_of_invention: {
      type: String,
      required: true,
    },
    summary_of_invention: {
      type: String,
      required: true,
    },
    fields_of_invention: {
      type: String,
      required: true,
    },
    brief_description: {
      type: String,
      required: true,
    },
    detailed_description: {
      type: String,
      required: true,
    },
    claims: {
      type: String,
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    drawings: {
      type: String, // You can adjust this to support file uploads or other formats depending on your application
      required: false, // Optional, as drawings might be uploaded later
    },
    sequence_diagram: {
      type: String,
      required: false,
    },
    block_diagram:{
      type:String,
      required:false,
    },
    project_id: {
      type: Number,
      required: true,
    },
    u_id: {
      type: Number,
      required: true,
      ref: "registration",
    },
    // New fields
    embodiments: {
      type: String, // You can adjust the type to whatever is appropriate (e.g., Array, Object)
      required: false, // Optional field
    },
    sequence_listing: {
      type: String, // You can adjust this to other types as well (e.g., Array, Object)
      required: false, // Optional field
    },
    industrial_applicability: {
      type: String, // Optional field
      required: false,
    },
    custom_paragraphs: {
      type: String, // Optional field
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
); // Automatically adds createdAt and updatedAt fields with custom names

// Create and export the model
const DraftMaster = mongoose.model("DraftMaster", DraftMasterSchema);
module.exports = DraftMaster;
