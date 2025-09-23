const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Registration = require("./models/Registration");
const ProvisionDraft = require("./models/provisionDraft");
const Invention = require("./models/Invention");
const InnoCheck = require("./models/InnoCheck");
const DraftMaster = require("./models/DraftMaster");
const { loginUser } = require("./models/login");
const { performance } = require("perf_hooks");
const { error } = require("console");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");
// In-memory job queue (would use Redis in production)
const jobQueue = new Map();

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Updated multer configuration with 50MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (50 * 1024 * 1024 bytes)
});

const missingVars = [];

if (!process.env.SERPAPI_KEY) {
  missingVars.push("SERPAPI_KEY");
}

if (!process.env.GEMINI_API_KEY) {
  missingVars.push("GEMINI_API_KEY");
}

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  process.exit(1);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection error:", err));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(cors());
// Add these two lines
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Existing line
app.use(express.static(path.join(__dirname, "public")));

// ******************Google Patent Code Starts**************

const apikey = process.env.SERPAPI_KEY;

const getPatentResults = async (query) => {
  try {
    const url = "https://serpapi.com/search";
    const params = {
      api_key: apikey,
      engine: "google_patents",
      q: query,
      tbm: "patents",
    };

    console.log("Query params:", { query, ...params });

    const response = await axios.get(url, { params });

    console.log("SerpApi Response:", response.data);

    if (
      response.data &&
      response.data.organic_results &&
      response.data.organic_results.length > 0
    ) {
      return response.data.organic_results;
    } else {
      return { error: "No patents found for this query." };
    }
  } catch (error) {
    console.error("Error fetching patent results:", error.message);

    if (error.response) {
      console.error("Error from SerpApi:", error.response.data);
    } else {
      console.error("Error Details:", error);
    }

    return { error: "Error fetching patent results. Please try again later." };
  }
};

app.get("/patents", async (req, res) => {
  const query = req.query.query || "artificial intelligence";
  const patentResults = await getPatentResults(query);

  if (patentResults.error) {
    res.status(500).json({ error: patentResults.error });
  } else {
    res.status(200).json({ patents: patentResults });
  }
});

//  ********************************* */ Get Invention Details for HomeTwo page
app.get("/inventions", async (req, res) => {
  const u_id = req.query.u_id; // Get u_id from query parameters

  if (!u_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // 1. Fetch base invention data for the user, sorted by creation date
    // Using .lean() for performance as we will modify the objects
    const inventions = await Invention.find({ u_id })
      .sort({ createdAt: -1 }) // Keep the original sorting
      .lean(); // Use lean for better performance

    if (!inventions || inventions.length === 0) {
      // Keep the 404 behavior if no base projects found
      return res
        .status(404)
        .json({ message: "No inventions found for this user" }); // Use message for consistency
    }

    // 2. Enhance each invention with last worked module info
    const enhancedInventions = await Promise.all(
      inventions.map(async (invention) => {
        const projectId = invention.project_id; // Get project ID from the invention

        // Potential Issue: project_id type might differ across collections.
        // Invention/DraftMaster seem to use Number, InnoCheck/ProvisionDraft use String.
        // Mongoose might handle simple cases, but explicit casting/consistent schema is safer.
        // Assuming current queries work due to Mongoose flexibility for now.
        const projectIdStr = String(projectId);
        const projectIdNum = Number(projectId); // For models expecting a Number

        try {
          // Find the latest updated document for each module type
          const latestInnoCheck = await InnoCheck.findOne({
            project_id: projectIdStr,
          })
            .sort({ updatedAt: -1 })
            .select("updatedAt createdAt") // Select timestamps
            .lean();

          const latestProvisio = await ProvisionDraft.findOne({
            project_id: projectIdStr,
          })
            .sort({ updatedAt: -1 })
            .select("updatedAt createdAt") // Select timestamps
            .lean();

          // DraftMaster uses custom timestamp names ('updated_at')
          const latestDraftMaster = await DraftMaster.findOne({
            project_id: projectIdNum,
          }) // Assuming DraftMaster uses Number
            .sort({ updated_at: -1 }) // Use custom field name
            .select("updated_at created_at") // Select custom timestamps
            .lean();

          // Store potential last updates with module name and timestamp
          let lastUpdates = [];
          if (latestInnoCheck) {
            lastUpdates.push({
              module: "InnoCheck",
              timestamp: new Date(
                latestInnoCheck.updatedAt || latestInnoCheck.createdAt
              ).getTime(),
            });
          }
          if (latestProvisio) {
            lastUpdates.push({
              module: "ProvisioDraft",
              timestamp: new Date(
                latestProvisio.updatedAt || latestProvisio.createdAt
              ).getTime(),
            });
          }
          if (latestDraftMaster) {
            lastUpdates.push({
              module: "DraftMaster",
              // Use custom field name and fallback
              timestamp: new Date(
                latestDraftMaster.updated_at || latestDraftMaster.created_at
              ).getTime(),
            });
          }

          // Find the overall latest update among the modules for this project
          let lastWorkedModule = null;
          let lastWorkedTimestamp = null;

          if (lastUpdates.length > 0) {
            lastUpdates.sort((a, b) => b.timestamp - a.timestamp); // Sort descending by time
            lastWorkedModule = lastUpdates[0].module;
            lastWorkedTimestamp = new Date(
              lastUpdates[0].timestamp
            ).toISOString(); // Store as ISO string
          }

          // Add the new fields to the invention object
          return {
            ...invention,
            lastWorkedModule, // e.g., "DraftMaster" or null
            lastWorkedTimestamp, // e.g., "2023-10-27T12:00:00.000Z" or null
          };
        } catch (err) {
          console.error(
            `Error fetching module data for project ${projectId}:`,
            err
          );
          // Return the invention without enhancement in case of error for this specific project
          return {
            ...invention,
            lastWorkedModule: null,
            lastWorkedTimestamp: null,
            errorFetchingModules: true, // Optionally flag the error
          };
        }
      }) // end map
    ); // end Promise.all

    // 3. Return the enhanced list
    res.json(enhancedInventions);
  } catch (error) {
    console.error("Error fetching inventions:", error);
    // Handle potential errors during the initial Invention.find query
    res
      .status(500)
      .json({ error: "Something went wrong while fetching inventions" });
  }
});

// *********************************** */ Fetch ProjectData Endpoint

app.get("/getProjectData", async (req, res) => {
  try {
    const { u_id, project_id } = req.query; // Get both u_id and project_id from the query

    // Check if u_id is provided
    if (!u_id) {
      return res.status(400).send({ error: "User ID (u_id) is required." });
    }

    // Create the query object for filtering the project data
    const query = { u_id: u_id };

    // If project_id is provided, add it to the query
    if (project_id) {
      query.project_id = project_id;
    }

    // Find the document matching the query
    const invention = await Invention.findOne(query);

    if (!invention) {
      return res.status(404).send({ error: "No project found for this user." });
    }

    // Return the full invention data (all fields in the document)
    res.status(200).send(invention);
  } catch (error) {
    console.error("Error fetching project data:", error);
    res.status(500).send({ error: "Failed to fetch project data" });
  }
});

// *********************************** */ Fetch DraftMaster data Endpoint

app.get("/api/getDraftMaster", async (req, res) => {
  const project_id = String(req.query.project_id); // Convert to string if not already

  console.log("Received project_id:", project_id); // Log received project_id
  try {
    const draftmaster = await DraftMaster.findOne({ project_id });
    console.log("DraftMaster fetched:", draftmaster); // Log fetched data
    res.json(draftmaster);
  } catch (error) {
    console.error("Error fetching draft master data:", error);
    res.status(500).json({ message: "Error fetching draft master data" });
  }
});

// ************************************ */ Save or update draftMaster

app.post("/api/saveDraftMaster", async (req, res) => {
  const {
    title_of_invention,
    background_of_invention,
    summary_of_invention,
    fields_of_invention,
    brief_description,
    detailed_description,
    claims,
    abstract,
    drawings,
    sequence_diagram,
    block_diagram,
    ambodiments,
    sequence_listing,
    industrial_applicability,
    custom_paragraphs,
    project_id,
    u_id,
  } = req.body;

  // Debugging log to check what data is being received
  console.log("Request body:", req.body);

  try {
    // Check if required fields are present
    if (!project_id || !u_id) {
      return res
        .status(400)
        .json({ message: "Missing required fields: project_id or u_id" });
    }

    // Step 1: Check if a draft already exists for the given project_id
    const existingDraftMaster = await DraftMaster.findOne({ project_id });

    if (existingDraftMaster) {
      // Update the existing draft
      existingDraftMaster.title_of_invention =
        title_of_invention || existingDraftMaster.title_of_invention;
      existingDraftMaster.background_of_invention =
        background_of_invention || existingDraftMaster.background_of_invention;
      existingDraftMaster.summary_of_invention =
        summary_of_invention || existingDraftMaster.summary_of_invention;
      existingDraftMaster.fields_of_invention =
        fields_of_invention || existingDraftMaster.fields_of_invention;
      existingDraftMaster.brief_description =
        brief_description || existingDraftMaster.existingDraftMaster;
      existingDraftMaster.detailed_description =
        detailed_description || existingDraftMaster.detailed_description;
      existingDraftMaster.claims = claims || existingDraftMaster.claims;
      existingDraftMaster.abstract = abstract || existingDraftMaster.abstract;
      existingDraftMaster.drawings = drawings || existingDraftMaster.drawings;
      existingDraftMaster.sequence_diagram =
        sequence_diagram || existingDraftMaster.sequence_diagram;
      existingDraftMaster.block_diagram = block_diagram || existingDraftMaster.block_diagram;
      existingDraftMaster.ambodiments =
        ambodiments || existingDraftMaster.ambodiments;
      existingDraftMaster.sequence_listing =
        sequence_listing || existingDraftMaster.sequence_listing;
      existingDraftMaster.industrial_applicability =
        industrial_applicability ||
        existingDraftMaster.industrial_applicability;
      existingDraftMaster.custom_paragraphs =
        custom_paragraphs || existingDraftMaster.custom_paragraphs;

      const updatedDraftMaster = await existingDraftMaster.save();
      return res
        .status(200)
        .json({ message: "Data updated successfully", updatedDraftMaster });
    } else {
      // Step 2: Create a new draft if it doesn't exist
      const newDraftMaster = new DraftMaster({
        title_of_invention,
        background_of_invention,
        summary_of_invention,
        fields_of_invention,
        brief_description,
        detailed_description,
        claims,
        abstract,
        drawings,
        sequence_diagram,
        block_diagram,
        ambodiments,
        sequence_listing,
        industrial_applicability,
        custom_paragraphs,
        project_id,
        u_id,
      });

      const savedDraftMaster = await newDraftMaster.save();
      return res
        .status(201)
        .json({ message: "Data saved successfully", savedDraftMaster });
    }
  } catch (error) {
    console.error("Error saving or updating draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//************************************* */ Fetch  ProvisionDraft  data EndPoint
app.get("/api/getProvisionDraft", async (req, res) => {
  const { project_id } = req.query;

  try {
    const drafts = await ProvisionDraft.find({ project_id }); // Find drafts by project_id
    res.json(drafts); // Send back the drafts
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching provision drafts" });
  }
});

//************************************** */ Save or update provision draft
app.post("/api/saveProvisionDraft", async (req, res) => {
  const {
    title_of_invention,
    background_of_invention,
    summery_of_invention,
    fields_of_invention,
    detailed_description,
    advantages_of_invention,
    add_embodiments,
    add_few_claims,
    add_key_features,
    add_abstract,
    add_custom_paragraph,
    project_id,
    u_id,
  } = req.body;

  // Validate required fields
  if (!project_id || !u_id) {
    return res
      .status(400)
      .json({ message: "project_id and u_id are required" });
  }

  try {
    console.log("Received data:", req.body); // Debug incoming data

    const existingDraft = await ProvisionDraft.findOne({ project_id });

    if (existingDraft) {
      existingDraft.title_of_invention =
        title_of_invention || existingDraft.title_of_invention || "";
      existingDraft.background_of_invention =
        background_of_invention || existingDraft.background_of_invention || "";
      existingDraft.summery_of_invention =
        summery_of_invention || existingDraft.summery_of_invention || "";
      existingDraft.fields_of_invention =
        fields_of_invention || existingDraft.fields_of_invention || "";
      existingDraft.detailed_description =
        detailed_description || existingDraft.detailed_description || "";
      existingDraft.advantages_of_invention =
        advantages_of_invention || existingDraft.advantages_of_invention || "";
      existingDraft.add_embodiments =
        add_embodiments || existingDraft.add_embodiments || "";
      existingDraft.add_few_claims =
        add_few_claims || existingDraft.add_few_claims || "";
      existingDraft.add_key_features =
        add_key_features || existingDraft.add_key_features || "";
      existingDraft.add_abstract =
        add_abstract || existingDraft.add_abstract || "";
      existingDraft.add_custom_paragraph =
        add_custom_paragraph || existingDraft.add_custom_paragraph || "";

      const updatedDraft = await existingDraft.save();
      return res
        .status(200)
        .json({ message: "Data updated successfully", updatedDraft });
    } else {
      const newDraft = new ProvisionDraft({
        title_of_invention: title_of_invention || "",
        background_of_invention: background_of_invention || "",
        summery_of_invention: summery_of_invention || "",
        fields_of_invention: fields_of_invention || "",
        detailed_description: detailed_description || "",
        advantages_of_invention: advantages_of_invention || "",
        add_embodiments: add_embodiments || "",
        add_few_claims: add_few_claims || "",
        add_key_features: add_key_features || "",
        add_abstract: add_abstract || "",
        add_custom_paragraph: add_custom_paragraph || "",
        project_id,
        u_id,
      });

      const savedDraft = await newDraft.save();
      return res
        .status(201)
        .json({ message: "Data saved successfully", savedDraft });
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// ********************************** */ Fetch Innocheck data EndPoint

app.get("/api/getInnocheck", async (req, res) => {
  const { project_id } = req.query; // Retrieve project_id from query params
  try {
    const innocheckData = await InnoCheck.find({ project_id });
    if (innocheckData.length > 0) {
      res.json(innocheckData); // Return data if found
    } else {
      res.status(404).json({ message: "No Innocheck draft found." });
    }
  } catch (error) {
    console.error("Error fetching Innocheck data:", error);
    res.status(500).json({ message: "Error fetching Innocheck data." });
  }
});

// *************************************
app.get("/api/getInnocheckData", async (req, res) => {
  const { project_id } = req.query; // Retrieve project_id from query params

  // Ensure project_id is treated as a string (if needed)
  const projectId = String(project_id);

  try {
    const innocheckData = await InnoCheck.find({ project_id: projectId });

    if (innocheckData.length > 0) {
      const selectedButtons = innocheckData[0].selected_buttons || [];
      res.json({
        success: true,
        selectedButtons: selectedButtons,
        projectId: projectId,
      });
    } else {
      res
        .status(404)
        .json({ message: "No Innocheck data found for the given project ID." });
    }
  } catch (error) {
    console.error("Error fetching Innocheck data:", error);
    res.status(500).json({ message: "Error fetching Innocheck data." });
  }
});

// ************************************* Save or update Innocheck Endpoint

app.post("/api/saveInnocheck", async (req, res) => {
  const {
    summary_of_invention,
    key_features,
    problem_statement,
    solution_statement,
    novelty_statement,
    result_metric,
    advantages_of_invention,
    comparative_analysis,
    industrial_applicability,
    relevant_excerpts,
    innovators_in_the_field,
    recommendation,
    selected_buttons,
    // New field for Analyze Invention data
    analyze_invention_data,
    project_id,
    u_id,
  } = req.body;

  // Validate required fields
  if (!project_id || !u_id) {
    return res
      .status(400)
      .json({ message: "project_id and u_id are required" });
  }

  try {
    let existingInnocheck = await InnoCheck.findOne({ project_id });

    if (existingInnocheck) {
      // Update existing record
      existingInnocheck.summary_of_invention =
        summary_of_invention || existingInnocheck.summary_of_invention;
      existingInnocheck.key_features =
        key_features || existingInnocheck.key_features;
      existingInnocheck.problem_statement =
        problem_statement || existingInnocheck.problem_statement;
      existingInnocheck.solution_statement =
        solution_statement || existingInnocheck.solution_statement;
      existingInnocheck.novelty_statement =
        novelty_statement || existingInnocheck.novelty_statement;
      existingInnocheck.result_metric =
        result_metric || existingInnocheck.result_metric;
      existingInnocheck.advantages_of_invention =
        advantages_of_invention || existingInnocheck.advantages_of_invention;
      existingInnocheck.comparative_analysis =
        comparative_analysis || existingInnocheck.comparative_analysis;
      existingInnocheck.industrial_applicability =
        industrial_applicability || existingInnocheck.industrial_applicability;
      existingInnocheck.relevant_excerpts =
        relevant_excerpts || existingInnocheck.relevant_excerpts;
      existingInnocheck.innovators_in_the_field =
        innovators_in_the_field || existingInnocheck.innovators_in_the_field;
      existingInnocheck.recommendation =
        recommendation || existingInnocheck.recommendation;
      existingInnocheck.selected_buttons =
        selected_buttons || existingInnocheck.selected_buttons;

      // Update Analyze Invention data if provided
      if (analyze_invention_data) {
        existingInnocheck.analyze_invention_data = analyze_invention_data;
      }

      await existingInnocheck.save();
      return res.status(200).json({
        message: "Innocheck draft updated successfully",
        data: existingInnocheck,
      });
    } else {
      // Create new record
      const newInnocheck = new InnoCheck({
        summary_of_invention,
        key_features,
        problem_statement,
        solution_statement,
        novelty_statement,
        result_metric,
        advantages_of_invention,
        comparative_analysis,
        industrial_applicability,
        relevant_excerpts,
        innovators_in_the_field,
        recommendation,
        selected_buttons,
        // Include Analyze Invention data if available
        analyze_invention_data,
        project_id,
        u_id,
      });

      const savedInnocheck = await newInnocheck.save();
      return res.status(201).json({
        message: "Innocheck Result saved successfully",
        data: savedInnocheck,
      });
    }
  } catch (error) {
    console.error("Error saving or updating Innocheck:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Updated endpoint for generating IDF from documents
app.post("/api/generateIDF", upload.array("files", 2), async (req, res) => {
  const jobId = uuidv4();
  console.log(`[${jobId}] Starting IDF generation job`);

  try {
    if (!req.files || req.files.length === 0) {
      console.log(`[${jobId}] Error: No files uploaded`);
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Extract text from all uploaded files
    let mergedText = "";
    let processedFiles = 0;

    for (const file of req.files) {
      try {
        console.log(
          `[${jobId}] Processing file: ${file.originalname} (${file.mimetype}), size: ${file.size} bytes`
        );
        let extractedText = "";

        if (file.mimetype === "application/pdf") {
          try {
            const data = await pdfParse(file.buffer);
            extractedText = data.text || "";
            console.log(
              `[${jobId}] Extracted ${extractedText.length} characters from PDF`
            );
          } catch (pdfError) {
            console.error(`[${jobId}] PDF parsing error:`, pdfError.message);
            return res
              .status(400)
              .json({ error: `Error parsing PDF file: ${file.originalname}` });
          }
        } else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          try {
            const { value } = await mammoth.extractRawText({
              buffer: file.buffer,
            });
            extractedText = value || "";
            console.log(
              `[${jobId}] Extracted ${extractedText.length} characters from DOCX`
            );
          } catch (docxError) {
            console.error(`[${jobId}] DOCX parsing error:`, docxError.message);
            return res
              .status(400)
              .json({ error: `Error parsing DOCX file: ${file.originalname}` });
          }
        } else {
          console.warn(
            `[${jobId}] Unsupported file type uploaded: ${file.mimetype}`
          );
          return res.status(400).json({
            error:
              "Unsupported file type. Please upload PDF or DOCX files only.",
          });
        }

        if (extractedText.trim()) {
          mergedText += extractedText + "\n\n";
          processedFiles++;
        } else {
          console.warn(
            `[${jobId}] No text extracted from file: ${file.originalname}`
          );
        }
      } catch (fileError) {
        console.error(
          `[${jobId}] Error extracting text from file ${file.originalname}:`,
          fileError
        );
        return res
          .status(400)
          .json({ error: `Error processing file: ${file.originalname}` });
      }
    }

    // If no text was extracted from any file
    if (!mergedText.trim() || processedFiles === 0) {
      console.error(
        `[${jobId}] Could not extract any text from the uploaded files`
      );
      return res
        .status(400)
        .json({ error: "Could not extract any text from the uploaded files" });
    }

    console.log(
      `[${jobId}] Successfully extracted text from ${processedFiles} files. Total text length: ${mergedText.length} characters`
    );

    // Limit the text size to avoid token limits
    const MAX_TEXT_LENGTH = 25000;
    if (mergedText.length > MAX_TEXT_LENGTH) {
      console.log(
        `[${jobId}] Truncating text from ${mergedText.length} to ${MAX_TEXT_LENGTH} characters`
      );
      mergedText = mergedText.substring(0, MAX_TEXT_LENGTH);
    }

    // Prepare the Gemini prompt
    const prompt = `I have given you a research I had published. Now I want you to generate the content of an invention disclosure form (IDF) I am creating. In the IDF, there are multiple fields such as Title of the Invention (a 1-liner title for the invention, could be different from the title of the research attached), Problem Statement (tells about the background of the invention), Solution Statement (tells about how the invention solves the background problem), and Novelty Statement (how the invention is novel as compared to the prior art in the same field), and Potential Applications (tells about how the invention could be used in various domains and as what kind of applications). for this, I want you to give me a json with key value pairs having 1 key and 1 associated value each, the keys being inventionTitle, problemStatement, solutionStatement, noveltyStatement, and potentialApplications respectively. give no other data\n\n${mergedText}`;

    console.log(
      `[${jobId}] Calling Gemini API with prompt length: ${prompt.length} characters`
    );

    // IMPORTANT: Use the correct model name that's working in your system
    try {
      // Direct Axios approach - use this if the Google SDK doesn't work for you
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      // Extract the generated text from Gemini's response
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error(
          `[${jobId}] Invalid or empty response from Gemini API:`,
          response.data
        );
        return res
          .status(500)
          .json({ error: "Invalid response from AI service" });
      }

      const generatedText = response.data.candidates[0].content.parts[0].text;
      console.log(
        `[${jobId}] Received response from Gemini API, length: ${generatedText.length} characters`
      );

      // Parse the JSON from the generated text
      let parsedJson = null;
      try {
        // Try multiple approaches to extract JSON
        // 1. First try direct JSON parse
        try {
          parsedJson = JSON.parse(generatedText.trim());
        } catch (directParseError) {
          console.log(
            `[${jobId}] Direct JSON parsing failed, trying to extract JSON block`
          );

          // 2. Try to extract JSON from code blocks
          const jsonMatch =
            generatedText.match(/```(?:json)?\n([\s\S]*?)\n```/) ||
            generatedText.match(/```([\s\S]*?)```/) ||
            generatedText.match(/{[\s\S]*?}/);

          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            parsedJson = JSON.parse(jsonStr.trim());
          } else {
            throw new Error("No JSON pattern found in response");
          }
        }

        // Validate required fields
        const requiredFields = [
          "inventionTitle",
          "problemStatement",
          "solutionStatement",
          "noveltyStatement",
          "potentialApplications",
        ];
        const missingFields = requiredFields.filter(
          (field) => !parsedJson[field]
        );

        if (missingFields.length > 0) {
          console.warn(
            `[${jobId}] Missing fields in generated JSON: ${missingFields.join(
              ", "
            )}`
          );
          // Don't fail because of missing fields, just log warning
        }

        console.log(`[${jobId}] Successfully parsed JSON response`);
      } catch (jsonError) {
        console.error(
          `[${jobId}] Error parsing JSON from Gemini response:`,
          jsonError
        );
        console.log(`[${jobId}] Raw response:`, generatedText);
        return res.status(500).json({
          error: "Failed to parse structured data from the AI response",
          details: jsonError.message,
        });
      }

      // Return the structured data for the frontend to generate the IDF
      return res.status(200).json({
        success: true,
        idfData: parsedJson,
      });
    } catch (geminiError) {
      console.error(`[${jobId}] Error calling Gemini API:`, geminiError);
      return res.status(500).json({
        error: "Failed to generate IDF content",
        details: geminiError.message,
      });
    }
  } catch (error) {
    console.error(`[${jobId}] Unhandled error in /api/generateIDF:`, error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// New endpoint for retrying patent comparison (matrix and excerpts)
app.post("/api/retry-patent-comparison", async (req, res) => {
  try {
    const { patentId, keyFeatures } = req.body;

    if (!patentId || !keyFeatures) {
      return res.status(400).json({
        success: false,
        error: "Patent ID and key features are required",
      });
    }

    console.log(`[Retry Comparison] Starting retry for patent: ${patentId}`);

    // First, fetch the patent details (needed for Prompt3)
    const details = await getPatentDetails(patentId);
    const patentDescription = details.fullDescription || "";

    if (!patentDescription) {
      return res.status(400).json({
        success: false,
        error: "Could not retrieve patent description",
      });
    }

    // Generate comparison (Prompt3 only)
    const prompt3 = generatePrompt3(keyFeatures, patentDescription);
    console.log(`[Retry Comparison] Running Prompt3 for Patent ${patentId}`);

    const geminiResponse3 = await runGeminiPrompt(prompt3);
    const parsed = parsePrompt3Output(geminiResponse3, patentId);

    console.log(`[Retry Comparison] Completed Prompt3 for Patent ${patentId}`);

    // Find and update any existing job that might have this patent result
    let jobUpdated = false;

    for (const [jobId, job] of jobQueue.entries()) {
      if (job.status === "completed" && job.result?.comparisons) {
        const compIndex = job.result.comparisons.findIndex(
          (comp) => comp.patentId === patentId
        );

        if (compIndex !== -1) {
          // Update the job's comparison data
          job.result.comparisons[compIndex].matrix = parsed.matrix;
          job.result.comparisons[compIndex].excerpts = parsed.excerpts;
          console.log(
            `[Retry Comparison] Updated job ${jobId} with new comparison data`
          );
          jobUpdated = true;
        }
      }
    }

    if (!jobUpdated) {
      console.log(
        `[Retry Comparison] No matching job found to update for patent ${patentId}`
      );
    }

    return res.json({
      success: true,
      matrix: parsed.matrix,
      excerpts: parsed.excerpts,
    });
  } catch (error) {
    console.error("[Retry Comparison] Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retry patent comparison",
    });
  }
});

//************************************** */ Register user Endpoint

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Registration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Registration({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User Registration Successfully",
      user: {
        id: newUser.u_id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try Again" });
  }
});

//************************************** */ Login User Endpoint

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await loginUser(email, password);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user.u_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// ************************************* */ save the invention endpoin from the textarea

app.post("/saveInvention", async (req, res) => {
  const { pdf_text, project_id, u_id } = req.body;

  try {
    const newInvention = new Invention({
      pdf_text: pdf_text,
      project_id: project_id,
      u_id: u_id,
    });

    const savedInvention = await newInvention.save();
    res.status(201).json({ success: true, data: savedInvention });
  } catch (err) {
    console.error("Error saving invention data", err);
    res
      .status(400)
      .json({ success: false, message: "Error saving the invention" });
  }
});

//
app.post("/generateReport", upload.single("file"), async (req, res) => {
  const { u_id, keywords, text } = req.body;
  const project_id = req.body.project_id || localStorage.getItem("project_id"); // Pass project_id from client
  const file = req.file;

  try {
    // Fetch existing project from database using project_id and u_id
    const project = await db.getProject(project_id, u_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Process file or text if provided, update project if needed
    const updatedText = file
      ? await extractTextFromFile(file)
      : text || project.text;
    const report = await generateReport(updatedText, JSON.parse(keywords));

    // Update project in database if necessary
    await db.updateProject(project_id, { text: updatedText, report });

    res.json({ success: true, text: updatedText });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to generate report", details: error.message });
  }
});
//*************************************** */ File upload Endpoint

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const u_id = req.body.u_id;
    if (!u_id)
      return res.status(400).json({ error: "User ID (u_id) is required." });

    const validUId = Number(u_id);
    if (isNaN(validUId))
      return res.status(400).json({ error: "Invalid User ID (u_id)." });

    const textInput = req.body.text || "";
    // const keywords = req.body.keywords ? JSON.parse(req.body.keywords) : []; // Keep if you use keywords
    const existingProjectId = req.body.project_id
      ? Number(req.body.project_id)
      : null;

    let extractedText = "";
    if (req.file) {
      console.log(
        `Processing uploaded file: ${req.file.originalname} (${req.file.mimetype})`
      );
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;

      if (!fileBuffer || !fileType) {
        return res
          .status(400)
          .json({ error: "No file provided or invalid file." });
      }

      if (fileType === "application/pdf") {
        const data = await pdfParse(fileBuffer);
        extractedText = data.text;
        console.log(`Extracted ${extractedText.length} characters from PDF.`);
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = value;
        console.log(`Extracted ${extractedText.length} characters from DOCX.`);
      } else {
        console.warn(`Unsupported file type uploaded: ${fileType}`);
        return res
          .status(400)
          .json({ error: "Unsupported file type. Please upload PDF or DOCX." });
      }
    } else if (textInput) {
      console.log("Processing text input.");
    } else {
      return res.status(400).json({ error: "No file or text input provided." });
    }

    const finalText =
      (extractedText || "") + (textInput ? "\n" + textInput : "");
    console.log(`Final text length for processing: ${finalText.length}`);

    if (!finalText || finalText.trim().length === 0) {
      console.error("Upload resulted in empty text content.");
      return res.status(400).json({
        error: "Could not extract text content from the provided input.",
      });
    }

    // --- START: Generate Title ---
    const generatedTitle = await generateInventionTitle(finalText);
    // --- END: Generate Title ---

    let project_id;
    let invention;
    let isNewProject = false;

    // Handle existing project
    if (existingProjectId) {
      console.log(
        `Attempting to update existing project: ${existingProjectId}`
      );
      invention = await Invention.findOne({
        project_id: existingProjectId,
        u_id: validUId,
      });
      if (!invention) {
        console.warn(
          `Project ${existingProjectId} not found for user ${validUId}. Cannot update.`
        );
        return res
          .status(404)
          .json({ error: "Project not found or you don't have access to it." });
      }
      // Update existing project
      invention.pdf_text = finalText;
      invention.project_title = generatedTitle; // Update title as well
      // invention.keywords = keywords; // Update keywords if needed
      project_id = existingProjectId;
      console.log(`Project ${project_id} found. Updating text and title.`);
    } else {
      // Create New Project
      isNewProject = true;
      console.log("Creating a new project.");
      // Generate new project ID only if no existing project_id is provided
      async function generateUniqueProjectId() {
        let new_project_id;
        let existingProject = true;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        while (existingProject && attempts < maxAttempts) {
          new_project_id = Math.floor(Math.random() * 999999) + 1;
          existingProject = await Invention.findOne({
            project_id: new_project_id,
          });
          attempts++;
          if (existingProject)
            console.log(
              `Project ID ${new_project_id} already exists. Retrying...`
            );
        }
        if (attempts >= maxAttempts) {
          throw new Error(
            "Failed to generate a unique project ID after multiple attempts."
          );
        }
        console.log(`Generated unique project ID: ${new_project_id}`);
        return new_project_id;
      }

      project_id = await generateUniqueProjectId();

      invention = new Invention({
        project_id: project_id,
        u_id: validUId,
        pdf_text: finalText,
        project_title: generatedTitle, // <-- Add generated title here
        // keywords: keywords, // Add keywords if needed
      });
      console.log(`Prepared new invention document for project ${project_id}`);
    }

    await invention.save();
    console.log(`Invention data for project ${project_id} saved successfully.`);

    res.status(isNewProject ? 201 : 200).json({
      // Use 201 for Created
      message: isNewProject
        ? "File processed, title generated, and new project created successfully!"
        : "Project updated successfully with new file content and title!",
      text: finalText, // Maybe don't send full text back? Depends on frontend need.
      project_id: project_id,
      project_title: generatedTitle, // Send back the title
    });
  } catch (error) {
    console.error("Error in /upload route:", error);
    res.status(500).json({
      error: "Error processing upload",
      details: error.message || "An internal server error occurred.",
    });
  }
});
//*************************************** */ Endpoint to chat with PDF using Gemini API
app.post("/chat", async (req, res) => {
  try {
    const { query, project_id } = req.body;

    // Validate required fields
    if (!query || !project_id) {
      return res
        .status(400)
        .send({ error: "Both query and project_id are required." });
    }

    // Fetch the invention document from MongoDB
    const invention = await Invention.findOne({ project_id });
    if (!invention) {
      return res.status(404).send({ error: "Invention not found." });
    }

    const pdfText = invention.pdf_text;

    // Construct the prompt
    const prompt = `Based on the following document: ${pdfText}, answer the query: ${query}`;

    // Send the prompt to the Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the answer from the response
    const answer = response.data.candidates[0].content.parts[0].text;
    res.status(200).send({ answer });
  } catch (error) {
    console.error("Error in /chat endpoint:", error.message);
    res.status(500).send({
      error: "Error communicating with Gemini API",
      details: error.message,
    });
  }
});

// *************************************** */

async function generateInventionTitle(text) {
  // Limit text sent to Gemini to avoid exceeding limits (e.g., first 10000 characters)
  const truncatedText = text.substring(0, 10000);
  const prompt = `Provide me a title for the provided invention content. Now the provided content may already have a title in it - if this is the case, return the exact title that is written in it. But many times, there won't be any title already in the given content. In that case, analyze the provided invention content deeply and generate a title for it. The final output should only contain the title, whether from the content itself or generated by you, with no extra content or headings:\n\n---\n\n${truncatedText}\n\n---\n\n`;
  try {
    console.log("Generating title with Gemini...");
    // Ensure GEMINI_API_KEY is accessible here (it should be from your setup)
    // Ensure axios is imported at the top of the file
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        // Optional: Add safety settings if needed
        // safetySettings: [
        //   { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        //   // Add other categories as needed
        // ],
        generationConfig: {
          // Optional: Control output
          temperature: 0.6,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 50, // Limit tokens for title
          // stopSequences: ["\n"] // Stop at newline if title is single line
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 45000, // Increased timeout for Gemini call (45 seconds)
      }
    );

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0].text
    ) {
      let title = response.data.candidates[0].content.parts[0].text.trim();
      // Clean up potential markdown or extra formatting
      title = title.replace(/[*#`]/g, "").replace(/\n/g, " ").trim();
      console.log("Generated Title:", title);
      return title || "Untitled Project"; // Return generated title or default
    } else {
      console.warn("Gemini response format unexpected:", response.data);
      // Check for blocked content
      if (response.data?.promptFeedback?.blockReason) {
        console.error(
          "Gemini prompt blocked:",
          response.data.promptFeedback.blockReason
        );
        return `Blocked Content - Check Logs`;
      }
      return "Untitled Project (Generation Error)";
    }
  } catch (error) {
    console.error(
      "Error generating invention title with Gemini:",
      error.response ? error.response.data : error.message
    );
    // Log specific Gemini error if available
    if (error.response && error.response.data && error.response.data.error) {
      console.error("Gemini API Error Details:", error.response.data.error);
    }
    return "Untitled Project (API Error)"; // Return default on error
  }
}
// EndPoint to count documents

app.get("/count", async (req, res) => {
  try {
    const count = await Invention.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting documents", error });
  }
});
// New Endpoint created*****************
app.get("/api/getPdfText", async (req, res) => {
  const { project_id } = req.query;

  console.log("Received request for PDF with project_id:", project_id);

  if (!project_id) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  try {
    // Try different data type formats for project_id to handle potential mismatches
    let invention = await Invention.findOne({ project_id: project_id });

    // If not found, try as string
    if (!invention) {
      console.log("Trying as string:", String(project_id));
      invention = await Invention.findOne({ project_id: String(project_id) });
    }

    // If still not found, try as number
    if (!invention && !isNaN(Number(project_id))) {
      console.log("Trying as number:", Number(project_id));
      invention = await Invention.findOne({ project_id: Number(project_id) });
    }

    if (!invention) {
      // If still not found, check if any inventions exist at all
      const count = await Invention.countDocuments();
      console.log(
        `No invention found with project_id ${project_id}. Total inventions in DB: ${count}`
      );
      return res.status(404).json({
        error: "No invention found with this project ID",
        project_id: project_id,
      });
    }

    console.log(
      "Invention found! PDF length:",
      invention.pdf_text?.length || 0
    );
    res.json({ pdf_text: invention.pdf_text });
  } catch (error) {
    console.error("Error fetching PDF text:", error);
    res.status(500).json({ error: "Failed to fetch PDF text" });
  }
});

// **************Invention Anlyzer Code Starts********

// --- Gemini API Setup ---
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({
  // Note: You mentioned earlier "gemini-1.5-pro" but if you need the newer version, adjust here.
  model: "gemini-2.5-pro",
});
// Add new model for flash version
const geminiFlashModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
const generationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 20000,
  responseMimeType: "text/plain",
};

/**
 * Runs a Gemini prompt and returns the text response.
 * Each call may take around 30 seconds.
 * @param {string} prompt - The prompt string.
 * @param {boolean} useFlashModel - Whether to use the flash model.
 * @returns {Promise<string>} - The Gemini response text.
 */
async function runGeminiPrompt(prompt, useFlashModel = false) {
  const startTime = performance.now();
  const promptId = Math.random().toString(36).substring(2, 10); // Generate a random ID for this prompt
  const modelName = useFlashModel ? "FLASH" : "PRO";
  console.log(
    `[PERF_LOG][GEMINI-${modelName}][${promptId}] Starting Gemini API call at ${new Date().toISOString()}`
  );
  console.log(
    `[PERF_LOG][GEMINI-${modelName}][${promptId}] Prompt first 100 chars: ${prompt.substring(
      0,
      100
    )}...`
  );

  try {
    const model = useFlashModel ? geminiFlashModel : geminiModel;
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    console.log(
      `[PERF_LOG][GEMINI-${modelName}][${promptId}] Completed in ${duration.toFixed(
        2
      )}s`
    );
    return result.response.text();
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    console.error(
      `[PERF_LOG][GEMINI-${modelName}][${promptId}] Error after ${duration.toFixed(
        2
      )}s:`,
      error
    );
    throw error;
  }
}

// --- SERP API Helpers ---
const SERPAPI_KEY = process.env.SERPAPI_KEY;
/**
 * Searches for patents using the SERP API.
 * @param {string} query - The search query.
 * @param {number} num - Number of results to fetch (default 10).
 * @returns {Promise<Array>} - An array of result objects containing patent_id, title, assignee, and snippet.
 */

async function searchPatents(query, num = 20) {
  const startTime = performance.now();
  const queryId = Math.random().toString(36).substring(2, 10);
  console.log(
    `[PERF_LOG][SERP_PATENTS][${queryId}] Starting patent search for: "${query.substring(
      0,
      50
    )}..."`
  );

  try {
    const url = "https://serpapi.com/search";
    const params = {
      engine: "google_patents",
      q: query,
      num,
      api_key: SERPAPI_KEY,
      tbm: "patents",
      // Remove clustered: "true" - no CPC data needed
    };

    const response = await axios.get(url, { params, timeout: 120000 });
    const results = response.data.organic_results || [];

    const endTime = performance.now();
    console.log(
      `[PERF_LOG][SERP_PATENTS][${queryId}] Completed in ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s with ${results.length} results`
    );

    // Map results without CPC fields
    return results.map((item) => ({
      patent_id: item.patent_id || null,
      title: item.title || "N/A",
      assignee: item.assignee || "N/A",
      snippet: item.snippet || "N/A",
      filing_date: item.filing_date || "N/A",
      inventor: item.inventor || "N/A",
      patent_link: item.patent_link || "",
      scholar_id: null,
      scholar_link: "",
      author: "",
      publication_date: item.publication_date || "N/A",
      is_scholar: false,
      // Remove cpc and cpc_description fields
    }));
  } catch (error) {
    const endTime = performance.now();
    console.error(
      `[PERF_LOG][SERP_PATENTS][${queryId}] Error after ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s:`,
      error.message
    );
    return [];
  }
}

async function searchScholarResults(query, num = 2) {
  // Default to 2 results
  const startTime = performance.now();
  const queryId = Math.random().toString(36).substring(2, 10);
  console.log(
    `[PERF_LOG][SERP_SCHOLAR][${queryId}] Starting scholar search for: "${query.substring(
      0,
      50
    )}..."`
  );

  try {
    const url = "https://serpapi.com/search";
    const params = {
      engine: "google_scholar", // Use the scholar engine
      q: query,
      num,
      api_key: SERPAPI_KEY,
    };
    const response = await axios.get(url, { params, timeout: 100000 });
    const results = response.data.organic_results || [];

    const endTime = performance.now();
    console.log(
      `[PERF_LOG][SERP_SCHOLAR][${queryId}] Completed in ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s with ${results.length} results`
    );

    // Map results, extracting relevant fields and marking as scholar
    return results.map((item) => ({
      patent_id: null, // No patent_id for scholar results
      title: item.title || "",
      assignee: "", // Scholar results don't have assignees
      // Use publication_info.summary for snippet if available, otherwise snippet
      snippet: item.publication_info?.summary || item.snippet || "",
      filing_date: "", // No filing date
      inventor: "", // No inventor typically
      patent_link: "", // No direct patent link
      scholar_id: item.result_id || null, // Use result_id as scholar_id
      scholar_link: item.link || "",
      author:
        item.publication_info?.authors?.map((a) => a.name).join(", ") || "", // Extract authors
      publication_date: item.publication_info?.year || "", // Extract year
      is_scholar: true, // Mark as scholar result
    }));
  } catch (error) {
    const endTime = performance.now();
    console.error(
      `[PERF_LOG][SERP_SCHOLAR][${queryId}] Error after ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s:`,
      error.message
    );
    // Don't throw, return empty array on error
    return [];
  }
}

/**
 * Retrieves full patent details using the SERP API's Google Patents Details endpoint.
 * Additionally, if a "description_link" is provided, fetches the full HTML description,
 * strips the HTML tags, and returns the full text.
 * If the stripped text is empty, falls back to using response.data.description or abstract.
 * Also returns the description_link.
 * @param {string} patentId - The patent ID.
 * @returns {Promise<Object>} - The patent details object with a "fullDescription" and "descriptionLink" field.
 */

// MODIFY: Update getPatentDetails with better HTML handling
// MODIFY: Update getPatentDetails with better HTML handling and truncation
async function getPatentDetails(patentId) {
  const startTime = performance.now();
  console.log(
    `[PERF_LOG][PATENT_DETAILS][${patentId}] Starting patent details fetch`
  );

  try {
    const url = "https://serpapi.com/search";
    const params = {
      engine: "google_patents_details",
      patent_id: patentId,
      api_key: SERPAPI_KEY,
    };

    // Step 1: Get initial patent details
    const detailsFetchStart = performance.now();
    console.log(
      `[PERF_LOG][PATENT_DETAILS][${patentId}] Fetching initial patent details`
    );
    const patentDetailsPromise = axios.get(url, {
      params,
      timeout: 120000,
    });

    // Step 2: Initialize variables
    let fullDescription = "";
    let abstract = "";
    let descriptionLink = "";
    let patentData = null;
    let claims = "";

    // Step 3: Wait for patent details
    try {
      const response = await patentDetailsPromise;
      const detailsFetchEnd = performance.now();
      console.log(
        `[PERF_LOG][PATENT_DETAILS][${patentId}] Initial details fetched in ${(
          (detailsFetchEnd - detailsFetchStart) /
          1000
        ).toFixed(2)}s`
      );

      patentData = response.data;
      abstract = patentData.abstract || "";
      descriptionLink = patentData.description_link;
      claims = patentData.claims || "";

      let assignees = [];
      if (patentData.assignees && Array.isArray(patentData.assignees)) {
        assignees = patentData.assignees;
      } else if (patentData.assignee) {
        assignees = [patentData.assignee]; // Wrap single assignee in an array
      }

      // Step 4: If we have a description link, fetch it in parallel
      if (descriptionLink) {
        // Start time for description fetch
        const descFetchStart = performance.now();
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] Fetching full description from link: ${descriptionLink}`
        );

        // Run both description fetching and HTML processing in parallel
        const [descResponse] = await Promise.all([
          axios
            .get(descriptionLink, {
              timeout: 120000,
              responseType: "text",
            })
            .catch((err) => {
              console.warn(
                `Warning: Could not fetch description link: ${err.message}`
              );
              return { data: patentData.description || "" };
            }),
        ]);

        const descFetchEnd = performance.now();
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] Description fetched in ${(
            (descFetchEnd - descFetchStart) /
            1000
          ).toFixed(2)}s`
        );

        // Process the HTML content
        const htmlProcessStart = performance.now();
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] Processing HTML content, size: ${descResponse.data.length} chars`
        );

        fullDescription = descResponse.data
          .replace(/<style[^>]*>.*<\/style>/gis, " ")
          .replace(/<script[^>]*>.*<\/script>/gis, " ")
          .replace(/<header[^>]*>.*<\/header>/gis, " ")
          .replace(/<footer[^>]*>.*<\/footer>/gis, " ")
          .replace(/<nav[^>]*>.*<\/nav>/gis, " ")
          .replace(/<img[^>]*>/gi, " ")
          .replace(/<a[^>]*>([^<]+)<\/a>/gi, "$1")
          .replace(/<[^>]+>/g, " ")
          .replace(/(&nbsp;|\s)+/g, " ")
          .trim();

        const htmlProcessEnd = performance.now();
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] HTML processing completed in ${(
            (htmlProcessEnd - htmlProcessStart) /
            1000
          ).toFixed(2)}s`
        );
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] Processed description size: ${fullDescription.length} chars`
        );
      } else {
        fullDescription = patentData.description || "";
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] No description link, using API description field: ${fullDescription.length} chars`
        );
      }

      // Truncate if necessary
      const MAX_DESC_LENGTH = 250000;
      if (fullDescription.length > MAX_DESC_LENGTH) {
        console.log(
          `[PERF_LOG][PATENT_DETAILS][${patentId}] Truncating description from ${fullDescription.length} to ${MAX_DESC_LENGTH} chars.`
        );
        fullDescription = fullDescription.substring(0, MAX_DESC_LENGTH);
      }

      const endTime = performance.now();
      console.log(
        `[PERF_LOG][PATENT_DETAILS][${patentId}] Completed in ${(
          (endTime - startTime) /
          1000
        ).toFixed(2)}s`
      );

      // Return enhanced response with claims
      return {
        ...patentData,
        fullDescription,
        descriptionLink,
        abstract,
        claims,
        title: patentData.title || "N/A",
        assignees: assignees || "N/A",
        filing_date: patentData.filing_date || "N/A",
        inventor: patentData.inventor || "N/A",
        publication_number: patentData.publication_number || "N/A",
      };
    } catch (error) {
      // Handle errors more gracefully
      console.error(
        `[PERF_LOG][PATENT_DETAILS][${patentId}] Error processing patent after ${(
          (performance.now() - startTime) /
          1000
        ).toFixed(2)}s:`,
        error.message
      );
      return {
        fullDescription: "",
        descriptionLink: "",
        abstract: "",
        claims: "",
        title: "Error Processing Patent",
        assignee: "N/A",
        filing_date: "N/A",
        inventor: "N/A",
        publication_number: patentId,
        error: error.message,
      };
    }
  } catch (error) {
    console.error(
      `[PERF_LOG][PATENT_DETAILS][${patentId}] Fatal error after ${(
        (performance.now() - startTime) /
        1000
      ).toFixed(2)}s:`,
      error.message
    );
    throw error;
  }
}

// --- Helper: Count Words ---
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// --- Prompt 1: Query Generation (Update) ---
function generatePrompt1(inventionText) {
  return `
  You are an expert patent searcher specialized in generating high-quality Google Patents search queries. You must perform internal brainstorming to identify invention's key words, find exhaustive set of synonyms, select relevant synonyms and deselect irrelevant ones so we can get best results only and then give the 3 queries at the end of the response. Do the brainstorming internally and don't give that output to me. The final output should be the queries at the end, wherein each query is enclosed within <h1> </h1> tags. In total, there should be 3 pair of <h1> </h1> tags and no more. No other tags to be used apart from the required h1 tags. Some general guidelines on how to use Google Patent are the use of Boolean operators such as OR to indicate detection of any of the key words (usually single word synonyms of a key words are separated by OR, also those key words need not be in double quotes), AND to indicate detection of all key words. We mostly don't want multi word phrases but if you do need to include them, they should be enclosed in double quotes. Also, the usage of wild cards such as * to replace any number of characters in a key word (for instance, car* means car and any other word starting with car such as cars). Sometimes, you can use NEAR keyword also coupled with others like (electric OR motor) NEAR (car OR vehicle). Don't use the minus (-) operator. Using all these operators/wildcards, detailed yet simple and specific queries have to be generated so that we can get the best result set. Don't use complicated codes or phrases in the queries. Use the queries that google patent database will actually give good results on.  Our biggest purpose is to create 3 best queries to find most relevant or closely similar prior art to our invention. You may combine or exclude terms to refine precision and recall. You can use up to 400 words in the total output of the queries– the queries should be targeted, detailed, specific, and exhaustive, covering various synonyms properly. I want the queries to be highly targetted so we can find novelty defeating prior art - so do the best ever job here. The final output (after free form brainstorming) must have the 3 queries, each enclosed within their respective <h1> </h1> tags. Before putting the queries in h1 tags, ensure that they will give actual results by verifying the syntax and seeing nothing wrong in them. The invention text is:
  ${inventionText}
  `;
}

// --- Prompt 2: Patent Selection (Update) ---
function generatePrompt2(inventionText, resultsText) {
  return `You are a highly analytical patent assessor with deep expertise in technical evaluation. Given the following invention description and a consolidated list of around 100 or fewer patent search results (each result includes the patent number, title, assignee, and a snippet), perform a comprehensive internal brainstorming analysis to determine which patent results are most relevant to the invention. In your analysis, consider technical details, synonyms, and context, and be sure to avoid selecting multiple patents from the same family or redundant entries. Do the brainstorming internally and don't give that output to me. Once the brainstorming is done, output exactly five unique patent IDs in the following format: \`patent/{publication_number}/en\` (for example, \`patent/US1234567B2/en\`), each enclosed within <h1> and </h1> tags and nothing else. The invention description is: ${inventionText} and the patent results are: ${resultsText}`;
}

// --- NEW: Prompt for Top 30 Selection ---
function generatePrompt_Top30Selection(inventionText, resultsText) {
  return `You are an expert patent searcher specialized in identifying potentially relevant prior art. Your task is to perform a preliminary screening of patent search results to identify the 30 most promising candidates for detailed analysis.

Given the invention description and approximately 120 patent search results (each with patent ID, title, assignee, and snippet), you must identify the 30 patents that show the highest potential for technical relevance.

SCREENING METHODOLOGY:
- Technical concept overlap: Look for patents mentioning similar technical elements, methods, or problems in title and snippet
- Snippet quality: Prioritize patents whose snippets contain substantive technical content rather than generic descriptions  
- Title relevance: Titles that describe specific technical solutions rather than broad categories
- Assignee diversity: Try to include patents from different organizations to ensure broad coverage
- Avoid clear mismatches: Exclude patents that are obviously in different technical domains despite keyword matches

INTERNAL ANALYSIS PROCESS:
1. Identify the core technical concepts from the invention
2. Scan each result for presence of relevant technical concepts in title and snippet
3. Weight patents that address similar technical problems or use similar technical approaches
4. Create mental buckets of patents by technical approach and select best representatives from each

OUTPUT REQUIREMENTS:
You must output EXACTLY 30 patent IDs in a numbered list format. Each line must follow this exact pattern:
<select>[NUMBER]. patent/[PUBLICATION_NUMBER]/en</select>

Example format:
<select>1. patent/US1234567B2/en</select>
<select>2. patent/WO2023123456A1/en</select>
... (continuing to exactly 30)

The invention description is: ${inventionText}

The patent search results are: ${resultsText}

Remember: Output exactly 30 selections in the specified format, no more, no less.`;
}

// --- NEW: Prompt for Final 5 Selection from Claims ---
function generatePrompt_Final5Selection(inventionText, patentsWithPartialDescriptions) {
  return `You are a patent prior art analyst with deep expertise in technical assessment. You have been provided with 30 pre-screened patents, each with their partial descriptions (first 50,000 characters), to make a final selection of the 5 most relevant prior art references.

IMPORTANT NOTE: You are seeing a substantial portion (up to 50,000 characters) of each patent's description. This extensive content typically includes the field of invention, background, summary, detailed description of embodiments, and often some claims. Use this comprehensive information to make a thorough assessment.

DESCRIPTION ANALYSIS METHODOLOGY:
With 50,000 characters available, you can analyze:

1. Field alignment: Complete understanding of the patent's technical domain
2. Problem-solution match: Full context of technical problems and their solutions
3. Technical approach similarity: Detailed methods, systems, and implementation details
4. Component overlap: Comprehensive mapping of technical elements to the invention
5. Embodiment variations: Multiple implementations that may relate to different aspects

SELECTION CRITERIA:
- Highest weight: Patents whose extensive descriptions show clear and comprehensive technical similarity
- Medium weight: Patents with strong relevance in core aspects but divergence in implementation
- Lower weight: Patents with transferable concepts or partial technical overlap
- Avoid: Patents that despite initial promise reveal fundamental differences in their detailed descriptions

The substantial descriptions provide deep insight into:
- Complete technical architecture
- Detailed implementation methods
- Multiple embodiments and variations
- Specific technical advantages and features
- Relationships between components

Perform systematic analysis:
1. Read all 30 partial descriptions thoroughly
2. Identify which 10-12 have strongest overall technical alignment
3. Among those, select the 5 with most comprehensive relevance
4. Consider both breadth and depth of technical overlap

The invention description is: ${inventionText}

The 30 patents with their partial descriptions are provided below: ${patentsWithPartialDescriptions}

Output EXACTLY 5 patent IDs in this format, each on its own line within h1 tags:
<h1>patent/[PUBLICATION_NUMBER]/en</h1>

Example:
<h1>patent/US1234567B2/en</h1>
<h1>patent/EP1234567B1/en</h1>
(continue for exactly 5 patents)`;
}

// --- NEW: Parser for Top 30 Selection ---
function parseTop30Selection(geminiOutput) {
  const selections = [];
  
  // Primary pattern: look for <select> tags
  const selectPattern = /<select>(\d+)\.\s*(patent\/[^<]+)<\/select>/g;
  let match;
  
  while ((match = selectPattern.exec(geminiOutput)) !== null) {
    selections.push(match[2].trim());
  }
  
  // Fallback pattern if AI doesn't use tags perfectly
  if (selections.length < 30) {
    const fallbackPattern = /(\d+)\.\s*(patent\/[\w\d]+\/\w+)/g;
    const fallbackMatches = geminiOutput.matchAll(fallbackPattern);
    
    for (const fbMatch of fallbackMatches) {
      const patentId = fbMatch[2].trim();
      if (!selections.includes(patentId)) {
        selections.push(patentId);
      }
    }
  }
  
  if (selections.length !== 30) {
    console.warn(`Expected 30 selections but got ${selections.length}`);
  }
  
  return selections.slice(0, 30); // Ensure max 30
}

// --- Prompt 3: Comparison (Update) ---
function generatePrompt3(keyFeatures, patentDescription) {
  return `You are an expert patent analyst. Your task is to perform a one on one exhaustive comparison between the provided key features of a new invention and the provided patent prior art description. You must perform brainstorming internally to analyze and scrutinize the key features against all the prior art embodiments listed in the prior art description. You must do the brainstorming internally but not give that as output at all. Immediately after the brainstorming is done, then you will provide a 3-column matrix of comparison between the key features and the prior art. The 3-column matrix would have 3 columns called Key Feature, Prior Art, and Overlap. In the key feature column, you will write the exact key feature; in the prior art column, you will write about how similar/dissimilar the prior art is to the key feature based on your interpretation; and in the Overlap column, you will write either Considerable, - (just the hyphen symbol, no other text), or Partial. Ensure that the entire table is properly provided with the pipe symbols separating the data within properly, including at the beginning and end of each row as well among other places. Finally, you will provide relevant excerpts from the prior art (only a couple of lines each that are most relevant) enclosed within a single pair of <h2> tags. Take around 300 words for the table matrix and around 200 words for the excerpts. Your output format should be such that the entire key feature matrix is enclosed within a single pair of <h1> tags and the excerpts within a single pair of <h2> tags. Ensure that the entire table is properly provided with the pipe symbols separating the data within properly, including at the beginning and end of each row as well among other places. Think step by step. The key features are: ${keyFeatures} and the prior art is: ${patentDescription}. Importantly: after concluding the internal brainstorming, you must provide the required 3-column matrix within a pair of h1 tags and then the relevant excerpts within a pair of h2 tags and no irrelevant content apart from these`;
}

// --- NEW Prompt 4: Patent Ranking (Add this) ---
function generatePrompt4(allComparisonTables, patentIds) {
  return `
  You are a patent relevance analyst with expertise in evaluating invention similarities. I will provide you with comparison tables for ${
    patentIds.length
  } different patents, each showing how they compare to key features of a new invention.

  ===== YOUR TASK =====

  STEP 1: TABLE ANALYSIS
  For each patent's comparison table:
  - The first column contains key features of the invention
  - The second column explains how the patent compares to each feature
  - The third column shows the overlap rating: "Considerable" (strong match), "Partial" (partial match), or "-" (no match)

  STEP 2: CALCULATE RELEVANCE SCORES
  For each patent:
  - Count occurrences of "Considerable" in the Overlap column
  - Count occurrences of "Partial" in the Overlap column 
  - Count occurrences of "-" in the Overlap column
  - Calculate total score = (Considerable_count × 2) + (Partial_count × 1)

  STEP 3: RANK THE PATENTS
  Assign ranks 1-${patentIds.length} where:
  - Rank 1 = Highest relevance score (most relevant)
  - Rank ${patentIds.length} = Lowest relevance score (least relevant)
  - For tied scores: patent with more "Considerable" ratings ranks higher
  - If still tied: patent with fewer "-" ratings ranks higher

  STEP 4: CREATE FEATURE SUMMARY
  For each patent, create a summary line:
  FOUND FEATURES: List the key features found in this patent (those with "Considerable" or "Partial" overlap)
   - Format as a cohesive sentence starting with "This reference covers..."
   - Mention the feature numbers (e.g., "features 1a, 2, and 3c...") and short description of how mapping is
   - Prioritize mentioning "Considerable" matches first, then "Partial"
   
  STEP 5: FORMAT OUTPUT
  Provide your complete analysis using this exact XML structure for each patent:

  <patent>
  <id>\${EXACT_PATENT_ID}</id>
  <rank>\${NUMERICAL_RANK}</rank>
  <found>\${FOUND_FEATURES_SUMMARY}</found>
  <considerable>\${COUNT_OF_CONSIDERABLE_MATCHES}</considerable>
  <partial>\${COUNT_OF_PARTIAL_MATCHES}</partial>
  <none>\${COUNT_OF_NO_MATCHES}</none>
  </patent>

  ===== INPUT DATA =====

  ${allComparisonTables
    .map(
      (table, index) => `
  PATENT ID: ${patentIds[index]}
  ${table}
  ------------------------------
  `
    )
    .join("\n\n")}

  ===== IMPORTANT NOTES =====
  
  1. Return exactly ${
    patentIds.length
  } <patent> blocks in order of descending relevance (highest rank first)
  2. Use the exact patent IDs as provided
  3. Make summary concise (under 80 words) but comprehensive
  4. Ensure your output is strictly formatted as specified - no additional text
  5. Include the count values to verify your calculations
  `;
}

// --- Add this function to parse the ranking output ---
function parsePrompt4Output(output) {
  if (!output || typeof output !== "string") {
    console.error("Invalid output from Prompt 4");
    return [];
  }

  // Extract <patent> blocks
  const patentBlocks = output.match(/<patent>[\s\S]*?<\/patent>/g) || [];

  return patentBlocks.map((block) => {
    // Extract data for each patent
    const idMatch = block.match(/<id>(.*?)<\/id>/);
    const rankMatch = block.match(/<rank>(.*?)<\/rank>/);
    const foundMatch = block.match(/<found>(.*?)<\/found>/);
    const considerableMatch = block.match(
      /<considerable>(.*?)<\/considerable>/
    );
    const partialMatch = block.match(/<partial>(.*?)<\/partial>/);
    const noneMatch = block.match(/<none>(.*?)<\/none>/);

    return {
      patentId: idMatch ? idMatch[1].trim() : "Unknown",
      rank: rankMatch ? parseInt(rankMatch[1].trim()) : 999,
      foundSummary: foundMatch
        ? foundMatch[1].trim()
        : "No feature summary available",
      metrics: {
        considerable: considerableMatch
          ? parseInt(considerableMatch[1].trim())
          : 0,
        partial: partialMatch ? parseInt(partialMatch[1].trim()) : 0,
        none: noneMatch ? parseInt(noneMatch[1].trim()) : 0,
      },
    };
  });
}

// --- Helper to Build a Consolidated Text Block from Patent Results ---
function buildResultsText(patentResults) {
  return patentResults
    .map(
      (result) =>
        `Patent ID: ${result.patent_id}, Title: ${result.title}, Assignee: ${result.assignee}, Snippet: ${result.snippet}`
    )
    .join(" || ");
}

// Add these new functions
/**
 * Helper function to extract a simplified patent number from a patent ID
 */
function extractPatentNumber(patentId) {
  if (!patentId) return "";
  return patentId.replace(/^patent\//, "").replace(/\/en$/, "");
}

/**
 * Post-processes a comparison matrix for better readability
 */
function postProcessMatrix(matrix, patentId) {
  if (!matrix) return "";

  const simplifiedPatentId = extractPatentNumber(patentId);

  // Replace "Prior Art" with "Search Result" in the column header
  let processedMatrix = matrix.replace(
    /\|\s*Prior Art\s*\|/i,
    "| Search Result |"
  );

  // Replace all instances of "prior art" with the patent number
  processedMatrix = processedMatrix.replace(
    /(P|p)rior (A|a)rt/g,
    simplifiedPatentId
  );

  return processedMatrix;
}

// REPLACE the original parsePrompt3Output with this updated version
function parsePrompt3Output(output, patentId) {
  const matrixMatch = output.match(/<h1>([\s\S]*?)<\/h1>/);
  let matrix = matrixMatch ? matrixMatch[1].trim() : "";

  // Post-process the matrix if a patent ID is provided
  if (patentId) {
    matrix = postProcessMatrix(matrix, patentId);
  }

  const excerptsMatch = output.match(/<h2>([\s\S]*?)<\/h2>/);
  const excerpts = excerptsMatch ? excerptsMatch[1].trim() : "";

  return { matrix, excerpts };
}

// --- Main Endpoint (Iteration 3) ---
// --- Main Endpoint (Asynchronous Version) ---
app.post("/api/process-invention", async (req, res) => {
  try {
    // Step 0: Validate input
    const { inventionText, keyFeatures } = req.body;
    if (!inventionText) {
      return res.status(400).json({ error: "inventionText is required" });
    }

    // Create a unique job ID
    const jobId = uuidv4();

    // Initialize job status
    jobQueue.set(jobId, {
      status: "processing",
      progress: 0,
      startTime: Date.now(),
      result: null,
      error: null,
    });

    // Process the invention analysis in the background
    processInventionAsync(jobId, inventionText, keyFeatures);

    // Return immediately with the job ID
    return res.status(202).json({
      jobId,
      status: "processing",
      message:
        "Invention analysis started. Check status with /api/process-invention/status/{jobId}",
    });
  } catch (err) {
    console.error("Error initiating invention analysis:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Add these new endpoints
// Status check endpoint
app.get("/api/process-invention/status/:jobId", (req, res) => {
  const { jobId } = req.params;

  if (!jobQueue.has(jobId)) {
    return res.status(404).json({ error: "Job not found" });
  }

  const job = jobQueue.get(jobId);
  return res.json({
    jobId,
    status: job.status,
    progress: job.progress,
    elapsedTime: Date.now() - job.startTime,
  });
});

// Results endpoint
app.get("/api/process-invention/result/:jobId", (req, res) => {
  const { jobId } = req.params;

  if (!jobQueue.has(jobId)) {
    return res.status(404).json({ error: "Job not found" });
  }

  const job = jobQueue.get(jobId);

  if (job.status !== "completed") {
    return res
      .status(400)
      .json({ error: "Job is not yet completed", status: job.status });
  }

  return res.json(job.result);
});

async function processInventionAsync(
  jobId,
  inventionText,
  providedKeyFeatures = null
) {
  const job = jobQueue.get(jobId);
  const startTime = performance.now();
  console.log(
    `[PERF_LOG][${jobId}] Starting invention analysis at ${new Date().toISOString()}`
  );

  try {
    // Step 1: Get Key Features
    const step1Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 1 - Key Features: Starting at ${new Date().toISOString()}`
    );
    job.progress = 10;
    let keyFeatures;
    if (providedKeyFeatures && providedKeyFeatures.trim() !== "") {
      console.log(
        `[Analyze Invention Log - Backend Step 1] Using provided key features for Job ${jobId}.`
      );
      keyFeatures = providedKeyFeatures
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      console.log(
        `[Analyze Invention Log - Backend Step 1.2] Provided Key Features (cleaned - first 200 chars):`,
        keyFeatures.substring(0, 200) + "..."
      );
    } else {
      console.log(
        `[Analyze Invention Log - Backend Step 1] Generating key features with Gemini for Job ${jobId}.`
      );
      const prompt4 = generatePrompt4(inventionText);
      const geminiResponse4 = await runGeminiPrompt(prompt4, true); // Use flash model for prompt4
      keyFeatures = geminiResponse4
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      console.log(
        `[Analyze Invention Log - Backend Step 1.2] Generated Key Features (cleaned - first 200 chars):`,
        keyFeatures.substring(0, 200) + "..."
      );
    }
    const step1End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 1 - Key Features: Completed in ${(
        (step1End - step1Start) /
        1000
      ).toFixed(2)}s`
    );

    // Step 2: Generate Search Queries (TWO SETS IN PARALLEL)
    const step2Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 2 - Generate Queries: Starting at ${new Date().toISOString()}`
    );
    job.progress = 25;
    // Original prompt
    const prompt1 = generatePrompt1(inventionText);
    // Modified prompt with variation to get different results
    const prompt1Variation = generatePrompt1(
      inventionText +
        " Explore alternative embodiments and methods to achieve the same functional outcomes."
    );

    console.log(
      `[Analyze Invention Log - Backend Step 2] Running Prompt 1 in parallel (Generate Queries) for Job ${jobId}.`
    );

    // Run both prompt generations in parallel
    const [geminiResponse1, geminiResponse1Variation] = await Promise.all([
      runGeminiPrompt(prompt1),
      runGeminiPrompt(prompt1Variation),
    ]);

    // Extract queries from both responses
    const queries1 = [];
    const regex1 = /<h1>(.*?)<\/h1>/g;
    let match1;
    while ((match1 = regex1.exec(geminiResponse1)) !== null) {
      queries1.push(match1[1].trim());
    }

    const queries2 = [];
    let match2;
    while ((match2 = regex1.exec(geminiResponse1Variation)) !== null) {
      queries2.push(match2[1].trim());
    }

    // Combine all queries
    const queries = [...queries1, ...queries2].filter((q) => q.trim() !== "");

    console.log(
      `[Analyze Invention Log - Backend Step 2.1] Generated ${queries.length} SERP Queries (${queries1.length} from set 1, ${queries2.length} from set 2) for Job ${jobId}:`,
      JSON.stringify(queries, null, 2)
    );
    const step2End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 2 - Generate Queries: Completed in ${(
        (step2End - step2Start) /
        1000
      ).toFixed(2)}s`
    );

    // Step 3: Fetch Patent Results from all queries in parallel
    const step3Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 3 - Fetch Patent Results: Starting at ${new Date().toISOString()}`
    );
    job.progress = 40;
    console.log(
      `[Analyze Invention Log - Backend Step 3] Fetching PATENT results for Job ${jobId}...`
    );

    // Search all queries in parallel with reduced results per query
    let patentResultsOnly = [];
    try {
      // Use Promise.allSettled instead of Promise.all to handle partial failures
      const settledResults = await Promise.allSettled(
        queries.map(async (query) => {
          console.log(
            `[Analyze Invention Log - Backend Step 3.1] Running PATENT SERP query for Job ${jobId}: "${query}"`
          );
          try {
            const results = await searchPatents(query, 20);
            console.log(
              `[Analyze Invention Log - Backend Step 3.2] Received ${results.length} PATENT results for query "${query}" (Job ${jobId})`
            );
            return results;
          } catch (queryError) {
            console.error(
              `Error in specific query "${query}":`,
              queryError.message
            );
            return []; // Return empty results but don't fail the whole batch
          }
        })
      );

      // Extract results from successful promises only
      patentResultsOnly = settledResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .flat();

      console.log(
        `[Analyze Invention Log - Backend Step 3.3] Total PATENT results fetched in parallel: ${patentResultsOnly.length}`
      );

      // Continue with empty results if nothing found rather than failing
      if (patentResultsOnly.length === 0) {
        console.warn(`No patent results found for any query in job ${jobId}`);
      }
    } catch (error) {
      // Log but DON'T rethrow the error - continue with whatever we have
      console.error(`Error in patent search process: ${error.message}`);
      patentResultsOnly = [];
    }

    // Deduplicate results based on patent_id
    const patentMap = new Map();
    patentResultsOnly.forEach((result) => {
      if (result.patent_id && !patentMap.has(result.patent_id)) {
        patentMap.set(result.patent_id, result);
      }
    });

    patentResultsOnly = Array.from(patentMap.values());
    console.log(
      `[Analyze Invention Log - Backend Step 3.3] Total unique PATENT results fetched: ${patentResultsOnly.length}`
    );

    // Step 3.5: Fetch Scholar Results Separately
    let scholarResultsOnly = [];
    if (queries.length > 0) {
      console.log(
        `[Analyze Invention Log - Backend Step 3.5] Fetching SCHOLAR results using first query for Job ${jobId}...`
      );
      scholarResultsOnly = await searchScholarResults(queries[0], 2); // Using the first query
      console.log(
        `[Analyze Invention Log - Backend Step 3.6] Received ${scholarResultsOnly.length} SCHOLAR results (Job ${jobId})`
      );
    } else {
      console.log(
        `[Analyze Invention Log - Backend Step 3.5] No queries generated, skipping Scholar search.`
      );
    }

    // Combine Patent and Scholar results for the final output, but filter for selection prompt
    const allResults = [...patentResultsOnly, ...scholarResultsOnly];
    const patentResultsForSelection = allResults.filter(
      (result) => !result.is_scholar
    ); // Use this for Prompt 2 input
    console.log(
      `[Analyze Invention Log - Backend Step 3.7] Total combined results: ${allResults.length}. Using ${patentResultsForSelection.length} patents for selection prompt.`
    );
    const step3End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 3 - Fetch Patent Results: Completed in ${(
        (step3End - step3Start) /
        1000
      ).toFixed(2)}s`
    );

    // Step 4: Build consolidated text for Top 20 Selection
    const step4Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 4 - Build Results Text: Starting at ${new Date().toISOString()}`
    );
    const resultsText = buildResultsText(patentResultsForSelection);
    console.log(
      `[Analyze Invention Log - Backend Step 4] Built consolidated patent results text for Top 20 Selection (Job ${jobId})`
    );
    const step4End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 4 - Build Results Text: Completed in ${(
        (step4End - step4Start) /
        1000
      ).toFixed(2)}s`
    );

    // Replace the relevant sections in processInventionAsync with these updates:

// Step 4.5: Select Top 30 Patents (instead of Top 20)
const step4_5Start = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.5 - Select Top 30: Starting at ${new Date().toISOString()}`
);
job.progress = 50;
const promptTop30 = generatePrompt_Top30Selection(inventionText, resultsText);
console.log(`[Analyze Invention] Running Top 30 Selection for Job ${jobId}.`);
const geminiResponseTop30 = await runGeminiPrompt(promptTop30);
const top30PatentIds = parseTop30Selection(geminiResponseTop30);
console.log(`[Analyze Invention] Selected ${top30PatentIds.length} patents for detailed analysis`);
const step4_5End = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.5 - Select Top 30: Completed in ${(
    (step4_5End - step4_5Start) /
    1000
  ).toFixed(2)}s`
);

// Step 4.6: Fetch Details for Top 30 (parallel)
const step4_6Start = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.6 - Fetch Top 30 Details: Starting at ${new Date().toISOString()}`
);
job.progress = 55;
console.log(`[Analyze Invention] Fetching details for 30 patents...`);

const detailsPromises = top30PatentIds.map(async (patentId) => {
  const details = await getPatentDetails(patentId);
  return {
    patentId,
    details,
    claims: details.claims || "",
    description: details.fullDescription || "",
    descriptionLink: details.descriptionLink || ""
  };
});

const top30Details = await Promise.all(detailsPromises);
console.log(`[Analyze Invention] Fetched details for ${top30Details.length} patents`);
const step4_6End = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.6 - Fetch Top 30 Details: Completed in ${(
    (step4_6End - step4_6Start) /
    1000
  ).toFixed(2)}s`
);

// Step 4.7: Build partial descriptions text for final selection with 50K chars
const step4_7Start = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.7 - Build Partial Descriptions (50K chars): Starting at ${new Date().toISOString()}`
);

const patentsWithPartialDescriptions = top30Details.map(p => {
  // Extract first 50,000 characters from description
  const partialDescription = (p.description || p.details.abstract || '').substring(0, 50000);
  
  return `Patent ID: ${p.patentId}
Title: ${p.details.title || 'N/A'}
Assignee: ${p.details.assignee || 'N/A'}
Filing Date: ${p.details.filing_date || 'N/A'}
Partial Description (50K chars): ${partialDescription}`;
}).join('\n\n---\n\n');

const step4_7End = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 4.7 - Build Partial Descriptions: Completed in ${(
    (step4_7End - step4_7Start) /
    1000
  ).toFixed(2)}s`
);

// Step 5: Select Final 5 from partial descriptions
const step5Start = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 5 - Select Final 5: Starting at ${new Date().toISOString()}`
);
job.progress = 65;
const promptFinal5 = generatePrompt_Final5Selection(inventionText, patentsWithPartialDescriptions);
console.log(`[Analyze Invention] Running Final 5 Selection from partial descriptions (50K chars each)...`);
const geminiResponseFinal5 = await runGeminiPrompt(promptFinal5);

// Parse final 5 selections (same as before)
const selectedPatentIdsRaw = [];
const regex2 = /<h1>(.*?)<\/h1>/g;
let match3;
while ((match3 = regex2.exec(geminiResponseFinal5)) !== null) {
  selectedPatentIdsRaw.push(match3[1].trim());
}
    
const selectedPatentIds = selectedPatentIdsRaw
  .map((id) => {
    let normalizedId = id;
    
    // NEW CLEANING LOGIC: Remove ** wrapping if present
    if (normalizedId.includes('**')) {
      normalizedId = normalizedId.replace(/\*\*/g, '');
    }
    
    // NEW CLEANING LOGIC: Remove duplicate patent/ prefixes
    // This regex will match patterns like "patent/patent/" and reduce to single "patent/"
    normalizedId = normalizedId.replace(/^(patent\/)+/g, 'patent/');
    
    // Existing normalization logic
    if (!normalizedId.startsWith("patent/"))
      normalizedId = "patent/" + normalizedId;
    if (!normalizedId.endsWith("/en") && !/\/[a-z]{2}$/.test(normalizedId))
      normalizedId = normalizedId + "/en";
    return normalizedId;
  })
  .filter((id) => id !== "patent//en");

const uniqueSelectedPatentIds = [...new Set(selectedPatentIds)].slice(0, 5);
console.log(
  `[Analyze Invention Log - Backend Step 5] Selected Final Patent IDs for Job ${jobId}:`,
  JSON.stringify(uniqueSelectedPatentIds, null, 2)
);
const step5End = performance.now();
console.log(
  `[PERF_LOG][${jobId}] Step 5 - Select Final 5: Completed in ${(
    (step5End - step5Start) /
    1000
  ).toFixed(2)}s`
);

// Step 6: Process Selected Patents (using stored details)
    const step6Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 6 - Process Selected Patents: Starting at ${new Date().toISOString()}`
    );
    job.progress = 75;
    console.log(
      `[Analyze Invention Log - Backend Step 6] Starting detailed analysis for ${uniqueSelectedPatentIds.length} selected patents (Job ${jobId})...`
    );
    
    const comparisonPromises = uniqueSelectedPatentIds.map(
      async (patentId, index) => {
        const patentStartTime = performance.now();
        console.log(
          `[PERF_LOG][${jobId}] Processing Patent ${index + 1}/${
            uniqueSelectedPatentIds.length
          } (${patentId}): Starting at ${new Date().toISOString()}`
        );
        console.log(
          `[Analyze Invention Log - Backend Step 6.0] Processing Patent ID: ${patentId} (Job ${jobId})`
        );
        try {
          // Find stored details from top20Details
          const storedPatentData = top30Details.find(d => d.patentId === patentId);

if (!storedPatentData) {
  // If not in top30Details (shouldn't happen), fetch it
  console.warn(`Patent ${patentId} not found in top30Details, fetching...`);
  const details = await getPatentDetails(patentId);
  storedPatentData = {
    patentId,
    details,
    description: details.fullDescription || "",
    descriptionLink: details.descriptionLink || ""
  };
}

          // Find matching patent in original SERP results for bibliographic data
          const matchingPatent = patentResultsForSelection.find(
            (result) => result.patent_id === patentId
          );

          console.log(
            `[Analyze Invention Log - Backend Step 6.0.1] Using stored details for ${patentId} (Job ${jobId})`
          );

          const patentDescription = storedPatentData.description;
          const descriptionWordCount = countWords(patentDescription);

          // Generate comparison (PROMPT 3)
          const prompt3StartTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}][${patentId}] Prompt 3 (Comparison): Starting at ${new Date().toISOString()}`
          );
          const prompt3 = generatePrompt3(keyFeatures, patentDescription);
          console.log(
            `[Analyze Invention Log - Backend Step 6.4] Running Prompt 3 (Comparison) for Patent ${patentId} (Job ${jobId}).`
          );
          const geminiResponse3 = await runGeminiPrompt(prompt3);
          const prompt3EndTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}][${patentId}] Prompt 3 (Comparison): Completed in ${(
              (prompt3EndTime - prompt3StartTime) /
              1000
            ).toFixed(2)}s`
          );

          // Parse response
          const parseStartTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}][${patentId}] Parse response: Starting`
          );
          const parsed = parsePrompt3Output(geminiResponse3, patentId);
          const parseEndTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}][${patentId}] Parse response: Completed in ${(
              (parseEndTime - parseStartTime) /
              1000
            ).toFixed(2)}s`
          );
          console.log(
            `[Analyze Invention Log - Backend Step 6.6] Parsed Matrix & Excerpts for Patent ${patentId} (Job ${jobId})`
          );

          // Enhanced details with proper handling of assignees and inventors
          const enhancedDetails = {
            title: storedPatentData.details.title || matchingPatent?.title || "",
            assignee: matchingPatent?.assignee || storedPatentData.details.assignee || "",
            assignees: matchingPatent?.assignee
              ? [matchingPatent.assignee]
              : Array.isArray(storedPatentData.details.assignees)
              ? storedPatentData.details.assignees
              : storedPatentData.details.assignee
              ? [storedPatentData.details.assignee]
              : [],
            filing_date:
              storedPatentData.details.filing_date || matchingPatent?.filing_date || "",
            inventor: matchingPatent?.inventor || storedPatentData.details.inventor || "",
            inventors: matchingPatent?.inventor
              ? [{ name: matchingPatent.inventor }]
              : Array.isArray(storedPatentData.details.inventors)
              ? storedPatentData.details.inventors
              : storedPatentData.details.inventor
              ? [{ name: storedPatentData.details.inventor }]
              : [],
            abstract: storedPatentData.details.abstract || "",
            snippet: matchingPatent?.snippet || storedPatentData.details.abstract || "",
            pdf: storedPatentData.details.pdf,
            publication_number: storedPatentData.details.publication_number,
            country: storedPatentData.details.country,
            publication_date: storedPatentData.details.publication_date,
          };

          console.log(
            `[Analyze Invention Log - Backend Step 6.7] Enhanced Details for Patent ${patentId} (Job ${jobId}).`
          );

          const patentEndTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}] Processing Patent ${index + 1}/${
              uniqueSelectedPatentIds.length
            } (${patentId}): Completed in ${(
              (patentEndTime - patentStartTime) /
              1000
            ).toFixed(2)}s`
          );

          return {
            patentId,
            details: enhancedDetails,
            matrix: parsed.matrix,
            excerpts: parsed.excerpts,
            descriptionWordCount,
            descriptionLink: storedPatentData.descriptionLink,
          };
        } catch (error) {
          console.error(`Error processing patent ${patentId}:`, error);
          const patentEndTime = performance.now();
          console.log(
            `[PERF_LOG][${jobId}] Processing Patent ${index + 1}/${
              uniqueSelectedPatentIds.length
            } (${patentId}): Failed after ${(
              (patentEndTime - patentStartTime) /
              1000
            ).toFixed(2)}s`
          );
          return {
            patentId,
            error: `Failed to process patent: ${error.message}`,
            details: {
              title: `Error processing ${extractPatentNumber(patentId)}`,
            },
            matrix: "",
            excerpts: "",
          };
        }
      }
    );

    const comparisons = await Promise.all(comparisonPromises);
    console.log(
      `[Analyze Invention Log - Backend Step 6.8] Completed parallel processing for all selected patents (Job ${jobId}).`
    );
    const step6End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 6 - Process Selected Patents: Completed in ${(
        (step6End - step6Start) /
        1000
      ).toFixed(2)}s`
    );

    // Step 7: NEW - Rank Patents by Relevance
    const step7Start = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 7 - Rank Patents: Starting at ${new Date().toISOString()}`
    );
    job.progress = 90;
    console.log(
      `[Analyze Invention Log - Backend Step 7] Ranking patents by relevance for Job ${jobId}...`
    );

    // Only proceed if we have valid comparisons
    if (comparisons.length > 0 && comparisons.some((comp) => comp.matrix)) {
      try {
        // Extract matrices and patent IDs for ranking
        const comparisonMatrices = comparisons
          .map((comp) => comp.matrix || "")
          .filter(Boolean);
        const comparisonPatentIds = comparisons
          .map((comp) => comp.patentId)
          .filter((id, i) => comparisons[i].matrix);

        if (comparisonMatrices.length > 0) {
          // Generate ranking prompt
          const prompt4 = generatePrompt4(
            comparisonMatrices,
            comparisonPatentIds
          );
          console.log(
            `[Analyze Invention Log - Backend Step 7.1] Running Prompt 4 (Ranking) for Job ${jobId}.`
          );
          const geminiResponse4 = await runGeminiPrompt(prompt4, true); // Use flash model for prompt4
          console.log(`
            ========== START PROMPT4 OUTPUT ==========
            ${geminiResponse4}
            ========== END PROMPT4 OUTPUT ==========
            `);
          console.log(
            `[Analyze Invention Log - Backend Step 7.2] Received ranking data for Job ${jobId}.`
          );

          // Parse ranking output
          const patentRankings = parsePrompt4Output(geminiResponse4);
          console.log(
            `[Analyze Invention Log - Backend Step 7.3] Parsed ${patentRankings.length} patent rankings for Job ${jobId}.`
          );

          // Create a map for easier lookup
          const rankingMap = new Map();
          patentRankings.forEach((ranking) => {
            rankingMap.set(ranking.patentId, ranking);
          });

          // Enhance comparisons with ranking info
          comparisons.forEach((comp) => {
            if (rankingMap.has(comp.patentId)) {
              const ranking = rankingMap.get(comp.patentId);
              comp.rank = ranking.rank;
              comp.foundSummary = ranking.foundSummary;
              comp.missingSummary = ranking.missingSummary;
              comp.metrics = ranking.metrics;
            }
          });

          // Sort comparisons by rank
          comparisons.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        }
      } catch (error) {
        console.error(`Error during patent ranking for Job ${jobId}:`, error);
        // Continue without ranking if there's an error
      }
    }
    const step7End = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Step 7 - Rank Patents: Completed in ${(
        (step7End - step7Start) /
        1000
      ).toFixed(2)}s`
    );

    // Step 8: Assemble Final Result
    job.progress = 95;
    const finalResult = {
      keyFeatures,
      queries,
      patentResults: allResults,
      selectedPatentIds: uniqueSelectedPatentIds,
      comparisons,
    };

    // Store the final result and mark job as completed
    job.progress = 100;
    job.status = "completed";
    job.result = finalResult;

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(
      `[PERF_LOG][${jobId}] Job completed successfully with total execution time: ${totalTime.toFixed(
        2
      )} seconds`
    );
    console.log(`[PERF_LOG][${jobId}] ==== TIMING SUMMARY ====`);
    console.log(
      `[PERF_LOG][${jobId}] Step 1 (Key Features): ${(
        (step1End - step1Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 2 (Generate Queries): ${(
        (step2End - step2Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 3 (Fetch Patent Results): ${(
        (step3End - step3Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 4 (Build Results Text): ${(
        (step4End - step4Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 4.5 (Select Top 20): ${(
        (step4_5End - step4_5Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 4.6 (Fetch Top 20 Details): ${(
        (step4_6End - step4_6Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 5 (Select Final 5): ${(
        (step5End - step5Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 6 (Process Selected Patents): ${(
        (step6End - step6Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(
      `[PERF_LOG][${jobId}] Step 7 (Rank Patents): ${(
        (step7End - step7Start) /
        1000
      ).toFixed(2)}s`
    );
    console.log(`[PERF_LOG][${jobId}] ==== END TIMING SUMMARY ====`);

    // Cleanup timeout
    setTimeout(() => {
      if (jobQueue.has(jobId)) {
        jobQueue.delete(jobId);
        console.log(`Job ${jobId} removed from queue after timeout`);
      }
    }, 3600000);
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    job.status = "failed";
    job.error = error.message;
    console.error(
      `[Analyze Invention Log - Backend ERROR] Job ${jobId} failed:`,
      error
    );
    const endTime = performance.now();
    console.log(
      `[PERF_LOG][${jobId}] Job failed after ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)} seconds`
    );
  }
}

// **************Invention Analyzer code ends*********

// Handle all other routes with index.html for React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});