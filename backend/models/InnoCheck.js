const mongoose = require("mongoose");

const patentResultSchema = new mongoose.Schema(
  {
    patent_id: { type: String, required: false },
    title: { type: String, required: false },
    assignee: { type: String, required: false },
    snippet: { type: String, required: false },
    abstract: { type: String, required: false },
    filing_date: { type: String, required: false },
    inventor: { type: String, required: false },
    // Add these fields for Scholar Results
    is_scholar: { type: Boolean, required: false },
    scholar_id: { type: String, required: false },
    scholar_link: { type: String, required: false },
    author: { type: String, required: false },
    publication_date: { type: String, required: false },
  },
  { _id: false }
);

const comparisonSchema = new mongoose.Schema(
  {
    patentId: { type: String, required: false },
    matrix: { type: String, required: false },
    noveltyScore: { type: String, required: false },
    excerpts: { type: String, required: false },
    descriptionWordCount: { type: Number, required: false },
    descriptionLink: { type: String, required: false },
    details: { type: patentResultSchema, required: false },
    // Add these fields for prompt4 ranking output
    rank: { type: Number, required: false },
    foundSummary: { type: String, required: false },
    missingSummary: { type: String, required: false },
    metrics: {
      type: {
        considerable: { type: Number, required: false },
        partial: { type: Number, required: false },
        none: { type: Number, required: false },
      },
      required: false,
    },
  },
  { _id: false }
);

const analyzeInventionSchema = new mongoose.Schema(
  {
    keyFeatures: { type: String, required: false },
    queries: [{ type: String }],
    patentResults: [patentResultSchema],
    selectedPatentIds: [patentResultSchema], // Changed to store full details
    comparisons: [comparisonSchema],
  },
  { _id: false }
);

const innoCheckSchema = new mongoose.Schema(
  {
    summary_of_invention: { type: String, required: false },
    key_features: { type: String, required: false },
    problem_statement: { type: String, required: false },
    solution_statement: { type: String, required: false },
    novelty_statement: { type: String, required: false },
    advantages_of_invention: { type: String, required: false },
    industrial_applicability: { type: String, required: false },
    innovators_in_the_field: { type: String, required: false },
    selected_buttons: { type: [String], default: [] },
    analyze_invention_data: { type: analyzeInventionSchema, required: false },
    project_id: { type: String, required: true },
    u_id: { type: Number, required: true, ref: "registration" },
  },
  {
    timestamps: true,
  }
);

const InnoCheck = mongoose.model("InnoCheck", innoCheckSchema);

module.exports = InnoCheck;
