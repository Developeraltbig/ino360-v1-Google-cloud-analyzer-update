const mongoose = require("mongoose");

const provisionDraftSchema = new mongoose.Schema(
  {
    title_of_invention: { type: String, default: "" },
    background_of_invention: { type: String, default: "" },
    summery_of_invention: { type: String, default: "" },
    fields_of_invention: { type: String, default: "" },
    detailed_description: { type: String, default: "" },
    advantages_of_invention: { type: String, default: "" },
    add_embodiments: { type: String, default: "" },
    add_few_claims: { type: String, default: "" },
    add_key_features: { type: String, default: "" },
    add_abstract: { type: String, default: "" },
    add_custom_paragraph: { type: String, default: "" },
    project_id: { type: String, required: true },
    u_id: { type: Number, required: true, ref: "registration" },
  },
  {
    timestamps: true, // This will add `createdAt` and `updatedAt` fields automatically
  }
);

const ProvisionDraft = mongoose.model("ProvisionDraft", provisionDraftSchema);

module.exports = ProvisionDraft;
