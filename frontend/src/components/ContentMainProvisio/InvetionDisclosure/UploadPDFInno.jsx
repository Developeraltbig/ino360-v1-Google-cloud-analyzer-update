import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./uploadPDF.css";
import ReactQuill from "react-quill";
import { Link, useNavigate, useBlocker } from "react-router-dom";
// Import the utility function at the top of your file
import { formatForQuill } from "../../../utils/formatUtils";
import { useToast } from "../../../context/ToastContext";
// *******************
import { OrbitProgress } from "react-loading-indicators";
import InventionAnalyzer from "../../InventionAnalyzer/InventionAnalyzer";
import PatentDraftingInno from "./PatentDraftingInno";
// *******************

function UploadPDFInno() {
  // Then add this ref inside the component
  const [analyzerReady, setAnalyzerReady] = useState(false);
  const inventionAnalyzerRef = useRef(null);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [generateButtonClicked, setGenerateButtonClicked] = useState(false);
  const [file, setFile] = useState(null);
  const buttonRef = useRef(null);
  const [query, setQuery] = useState(""); // Store the search query
  const [results, setResults] = useState([]); // Store patent results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Track error state

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for loader

  // Add this new state to track if Key Features are ready
  const [keyFeaturesReady, setKeyFeaturesReady] = useState(false);
  const [isAnalysisTriggeredByUser, setIsAnalysisTriggeredByUser] = useState(false);
  const [justGeneratedInno, setJustGeneratedInno] = useState(false);
  const [justGeneratedInno2, setJustGeneratedInno2] = useState(false);
  const [justGeneratedInno4, setJustGeneratedInno4] = useState(false);
  const [justGeneratedInno5, setJustGeneratedInno5] = useState(false);
  const [justGeneratedInno6, setJustGeneratedInno6] = useState(false);
  const [justGeneratedInno7, setJustGeneratedInno7] = useState(false);
  const [justGeneratedInno8, setJustGeneratedInno8] = useState(false);
  const [justGeneratedInno9, setJustGeneratedInno9] = useState(false);
  const [justGeneratedInno10, setJustGeneratedInno10] = useState(false);
  const [justGeneratedInno11, setJustGeneratedInno11] = useState(false);
  const [justGeneratedInno12, setJustGeneratedInno12] = useState(false);
  const [justGeneratedInno13, setJustGeneratedInno13] = useState(false);
  const [justGeneratedInno14, setJustGeneratedInno14] = useState(false);
  const [justGeneratedInno15, setJustGeneratedInno15] = useState(false);

  // Auto-update flags for edits
  const [editedInno, setEditedInno] = useState(false);
  const [editedInno2, setEditedInno2] = useState(false);
  const [editedInno4, setEditedInno4] = useState(false);
  const [editedInno5, setEditedInno5] = useState(false);
  const [editedInno6, setEditedInno6] = useState(false);
  const [editedInno7, setEditedInno7] = useState(false);
  const [editedInno8, setEditedInno8] = useState(false);
  const [editedInno9, setEditedInno9] = useState(false);
  const [editedInno10, setEditedInno10] = useState(false);
  const [editedInno11, setEditedInno11] = useState(false);
  const [editedInno12, setEditedInno12] = useState(false);
  const [editedInno13, setEditedInno13] = useState(false);
  const [editedInno14, setEditedInno14] = useState(false);
  const [editedInno15, setEditedInno15] = useState(false);

  const [questionInno, setQuestionInno] = useState("");
  const [questionInno2, setQuestionInno2] = useState("");
  const [questionInno4, setQuestionInno4] = useState("");
  const [questionInno5, setQuestionInno5] = useState("");
  const [questionInno6, setQuestionInno6] = useState("");
  const [questionInno7, setQuestionInno7] = useState("");
  const [questionInno8, setQuestionInno8] = useState("");
  const [questionInno9, setQuestionInno9] = useState("");
  const [questionInno10, setQuestionInno10] = useState("");
  const [questionInno11, setQuestionInno11] = useState("");
  const [questionInno12, setQuestionInno12] = useState("");
  const [questionInno13, setQuestionInno13] = useState("");
  const [questionInno14, setQuestionInno14] = useState("");
  const [questionInno15, setQuestionInno15] = useState("");
  const [answerInno, setanswerInno] = useState("");
  const [answerInno2, setanswerInno2] = useState("");
  const [answerInno4, setanswerInno4] = useState("");
  const [answerInno5, setanswerInno5] = useState("");
  const [answerInno6, setanswerInno6] = useState("");
  const [answerInno7, setanswerInno7] = useState("");
  const [answerInno8, setanswerInno8] = useState("");
  const [answerInno9, setanswerInno9] = useState("");
  const [answerInno10, setanswerInno10] = useState("");
  const [answerInno11, setanswerInno11] = useState("");
  const [answerInno12, setanswerInno12] = useState("");
  const [answerInno13, setanswerInno13] = useState("");
  const [answerInno14, setanswerInno14] = useState("");
  const [answerInno15, setanswerInno15] = useState("");
  const [generatinganswerInno, setGeneratinganswerInno] = useState(false);
  const [generatinganswerInno2, setGeneratinganswerInno2] = useState(false);
  const [generatinganswerInno4, setGeneratinganswerInno4] = useState(false);
  const [generatinganswerInno5, setGeneratinganswerInno5] = useState(false);
  const [generatinganswerInno6, setGeneratinganswerInno6] = useState(false);
  const [generatinganswerInno7, setGeneratinganswerInno7] = useState(false);
  const [generatinganswerInno8, setGeneratinganswerInno8] = useState(false);
  const [generatinganswerInno9, setGeneratinganswerInno9] = useState(false);
  const [generatinganswerInno10, setGeneratinganswerInno10] = useState(false);
  const [generatinganswerInno11, setGeneratinganswerInno11] = useState(false);
  const [generatinganswerInno12, setGeneratinganswerInno12] = useState(false);
  const [generatinganswerInno13, setGeneratinganswerInno13] = useState(false);
  const [generatinganswerInno14, setGeneratinganswerInno14] = useState(false);
  const [generatinganswerInno15, setGeneratinganswerInno15] = useState(false);
  const [innoCheckExists, setInnoCheckExists] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [draftData, setDraftData] = useState(null);

  const [pdfTextForPrompts, setPdfTextForPrompts] = useState("");

  // Block Navigation starts
  const [isAnyAnswerGeneratingGlobal, setIsAnyAnswerGeneratingGlobal] =
    useState(false);

  useEffect(() => {
    const anyGenerating =
      generatinganswerInno ||
      generatinganswerInno2 ||
      generatinganswerInno4 || // Assuming generatinganswerInno3 was intended or not used for a generating state
      generatinganswerInno5 ||
      generatinganswerInno6 ||
      generatinganswerInno7 ||
      generatinganswerInno8 ||
      generatinganswerInno9 ||
      generatinganswerInno10 ||
      generatinganswerInno11 ||
      generatinganswerInno12 ||
      generatinganswerInno13 ||
      generatinganswerInno14 ||
      generatinganswerInno15;
    setIsAnyAnswerGeneratingGlobal(anyGenerating);
  }, [
    generatinganswerInno,
    generatinganswerInno2,
    generatinganswerInno4,
    generatinganswerInno5,
    generatinganswerInno6,
    generatinganswerInno7,
    generatinganswerInno8,
    generatinganswerInno9,
    generatinganswerInno10,
    generatinganswerInno11,
    generatinganswerInno12,
    generatinganswerInno13,
    generatinganswerInno14,
    generatinganswerInno15,
  ]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isAnyAnswerGeneratingGlobal &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker && blocker.state === "blocked") {
      showWarning("Wait till all the answers are successfully generated.");
      blocker.reset();
    }
  }, [blocker]);

  // Block Navigation ends

  // Debounce function to limit save frequency
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Existing useEffects for hasUnsavedChanges and navigation remain unchanged
  useEffect(() => {
    if (
      projectData &&
      (answerInno ||
        answerInno2 ||
        answerInno4 ||
        answerInno5 ||
        answerInno6 ||
        answerInno7 ||
        answerInno8 ||
        answerInno9 ||
        answerInno10 ||
        answerInno11 ||
        answerInno12 ||
        answerInno13 ||
        answerInno14 ||
        answerInno15)
    ) {
      setHasUnsavedChanges(true);
    }
  }, [
    answerInno,
    answerInno2,
    answerInno4,
    answerInno5,
    answerInno6,
    answerInno7,
    answerInno8,
    answerInno9,
    answerInno10,
    answerInno11,
    answerInno12,
    answerInno13,
    answerInno14,
    answerInno15,
  ]);

  useEffect(() => {
    const pendingNavigation = localStorage.getItem(
      "triggerSaveBeforeNavigation"
    );
    if (pendingNavigation) {
      localStorage.removeItem("triggerSaveBeforeNavigation");
      handleSubmit();
      setTimeout(() => {
        navigate(pendingNavigation);
      }, 1000);
    }
  }, []);

  // Auto-save useEffects
  useEffect(() => {
    if (justGeneratedInno) {
      handleSubmit();
      setJustGeneratedInno(false);
    }
  }, [justGeneratedInno]);

  useEffect(() => {
    if (justGeneratedInno2) {
      handleSubmit();
      setJustGeneratedInno2(false);
    }
  }, [justGeneratedInno2]);

  useEffect(() => {
  const buttonClickedStatus = localStorage.getItem(
    "generateButtonClicked_innoCheckNext"
  );
  if (buttonClickedStatus === "true") {
    setGenerateButtonClicked(true);
    
    // Check if we need to generate fields when coming from Projects page
    const fromProjectsPage = localStorage.getItem("navigatedFromProjects");
    if (fromProjectsPage === "true" && projectData && !innoCheckExists) {
      // Clear the flag
      localStorage.removeItem("navigatedFromProjects");
      localStorage.removeItem("generateButtonClicked_innoCheckNext");
      
      // Trigger generation of all selected fields
      setTimeout(() => {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        handleAllButtonClick2(event);
      }, 500); // Small delay to ensure projectData is ready
    }
  }
}, [projectData, innoCheckExists]); // Add dependencies

  useEffect(() => {
    if (justGeneratedInno4) {
      handleSubmit();
      setJustGeneratedInno4(false);
    }
  }, [justGeneratedInno4]);

  useEffect(() => {
    if (justGeneratedInno5) {
      handleSubmit();
      setJustGeneratedInno5(false);
    }
  }, [justGeneratedInno5]);

  useEffect(() => {
    if (justGeneratedInno6) {
      handleSubmit();
      setJustGeneratedInno6(false);
    }
  }, [justGeneratedInno6]);

  useEffect(() => {
    if (justGeneratedInno7) {
      handleSubmit();
      setJustGeneratedInno7(false);
    }
  }, [justGeneratedInno7]);

  useEffect(() => {
    if (justGeneratedInno8) {
      handleSubmit();
      setJustGeneratedInno8(false);
    }
  }, [justGeneratedInno8]);

  useEffect(() => {
    if (justGeneratedInno9) {
      handleSubmit();
      setJustGeneratedInno9(false);
    }
  }, [justGeneratedInno9]);

  useEffect(() => {
    if (justGeneratedInno10) {
      handleSubmit();
      setJustGeneratedInno10(false);
    }
  }, [justGeneratedInno10]);

  useEffect(() => {
    if (justGeneratedInno11) {
      handleSubmit();
      setJustGeneratedInno11(false);
    }
  }, [justGeneratedInno11]);

  useEffect(() => {
    if (justGeneratedInno12) {
      handleSubmit();
      setJustGeneratedInno12(false);
    }
  }, [justGeneratedInno12]);

  useEffect(() => {
    if (justGeneratedInno13) {
      handleSubmit();
      setJustGeneratedInno13(false);
    }
  }, [justGeneratedInno13]);

  useEffect(() => {
    if (justGeneratedInno14) {
      handleSubmit();
      setJustGeneratedInno14(false);
    }
  }, [justGeneratedInno14]);

  useEffect(() => {
    if (justGeneratedInno15) {
      handleSubmit();
      setJustGeneratedInno15(false);
    }
  }, [justGeneratedInno15]);

  useEffect(() => {
    if (editedInno && !generatinganswerInno) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno(false);
      }, 1000); // 1-second debounce
      debouncedSave();
    }
  }, [editedInno, answerInno]);

  useEffect(() => {
    if (editedInno2 && !generatinganswerInno2) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno2(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno2, answerInno2]);

  useEffect(() => {
    if (editedInno4 && !generatinganswerInno4) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno4(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno4, answerInno4]);

  useEffect(() => {
    if (editedInno5 && !generatinganswerInno5) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno5(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno5, answerInno5]);

  useEffect(() => {
    if (editedInno6 && !generatinganswerInno6) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno6(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno6, answerInno6]);

  useEffect(() => {
    if (editedInno7 && !generatinganswerInno7) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno7(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno7, answerInno7]);

  useEffect(() => {
    if (editedInno8 && !generatinganswerInno8) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno8(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno8, answerInno8]);

  useEffect(() => {
    if (editedInno9 && !generatinganswerInno9) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno9(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno9, answerInno9]);

  useEffect(() => {
    if (editedInno10 && !generatinganswerInno10) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno10(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno10, answerInno10]);

  useEffect(() => {
    if (editedInno11 && !generatinganswerInno11) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno11(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno11, answerInno11]);

  useEffect(() => {
    if (editedInno12 && !generatinganswerInno12) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno12(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno12, answerInno12]);

  useEffect(() => {
    if (editedInno13 && !generatinganswerInno13) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno13(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno13, answerInno13]);

  useEffect(() => {
    if (editedInno14 && !generatinganswerInno14) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno14(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno14, answerInno14]);

  useEffect(() => {
    if (editedInno15 && !generatinganswerInno15) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEditedInno15(false);
      }, 1000);
      debouncedSave();
    }
  }, [editedInno15, answerInno15]);

  useEffect(() => {
    try {
      // First try to get PDF text from localStorage since it's already there
      const storedPdfText = localStorage.getItem("pdfText");
      const storedPdf_Text = localStorage.getItem("pdf_Text");

      if (storedPdfText && storedPdfText.length > 0) {
        console.log(
          "Using pdfText from localStorage, length:",
          storedPdfText.length
        );
        setPdfTextForPrompts(storedPdfText);
        return; // Exit early if we found the text
      }

      if (storedPdf_Text && storedPdf_Text.length > 0) {
        console.log(
          "Using pdf_Text from localStorage, length:",
          storedPdf_Text.length
        );
        setPdfTextForPrompts(storedPdf_Text);
        return; // Exit early if we found the text
      }

      // Only try API as fallback if not in localStorage
      const fetchPdfText = async () => {
        const projectId =
          localStorage.getItem("project_id") ||
          localStorage.getItem("selectedProject");
        if (!projectId) {
          console.error("No project ID found");
          return;
        }

        try {
          console.log("Fetching PDF text from API for project_id:", projectId);
          const response = await axios.get(
            `/api/getPdfText?project_id=${projectId}`
          );

          if (response.data && response.data.pdf_text) {
            setPdfTextForPrompts(response.data.pdf_text);
            // Also save to localStorage for future use
            localStorage.setItem("pdfText", response.data.pdf_text);
            console.log(
              "PDF text loaded from API, length:",
              response.data.pdf_text.length
            );
          } else {
            console.error("API response missing pdf_text:", response.data);
          }
        } catch (error) {
          console.error("Error fetching PDF text from API:", error);
        }
      };

      fetchPdfText();
    } catch (error) {
      console.error("Error in useEffect:", error);
    }
  }, []);

  useEffect(() => {
    if (answerInno15 !== "") {
      const timeoutId = setTimeout(() => {
        setQuery(answerInno15);
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [answerInno15]);

  useEffect(() => {
    if (query !== "") {
      const timeoutId = setTimeout(() => {
        buttonRef.current.click();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [query]);

  // Set All the answers to Local Storage
  const answers = [
    { key: "answerInnoCheck", value: answerInno },
    { key: "answerInnoCheck2", value: answerInno2 },
    { key: "answerInnoCheck4", value: answerInno4 },
    { key: "answerInnoCheck5", value: answerInno5 },
    { key: "answerInnoCheck6", value: answerInno6 },
    { key: "answerInnoCheck7", value: answerInno7 },
    { key: "answerInnoCheck8", value: answerInno8 },
    { key: "answerInnoCheck9", value: answerInno9 },
    { key: "answerInnoCheck10", value: answerInno10 },
    { key: "answerInnoCheck11", value: answerInno11 },
    { key: "answerInnoCheck12", value: answerInno12 },
    { key: "answerInnoCheck13", value: answerInno13 },
    { key: "answerInnoCheck14", value: answerInno14 },
    { key: "answerInnoCheck15", value: answerInno15 },
  ];

  useEffect(() => {
    answers.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
  }, [
    answerInno,
    answerInno2,
    answerInno4,
    answerInno5,
    answerInno6,
    answerInno7,
    answerInno8,
    answerInno9,
    answerInno10,
    answerInno11,
    answerInno12,
    answerInno13,
    answerInno14,
    answerInno15,
  ]);

  // ****************************

  // Add this handler function among your other functions
  const handleRegenerateAnalyzer = (e) => {
    e.preventDefault();

    if (
      !answerInno2 ||
      answerInno2.trim() === "" ||
      answerInno2 === "Generating answer... Wait for a while..."
    ) {
      showInfo(
        "Key Features must be generated before analyzing the invention."
      );
      return;
    }

    if (inventionAnalyzerRef.current) {
      // Reset the current analysis
      inventionAnalyzerRef.current.resetAnalysis();

      // Trigger the analysis again with current key features
      inventionAnalyzerRef.current
        .handleSubmit()
        .then(() => {
          console.log("Analyzer regenerated, saving all data");
          handleSubmit(); // Save the new data
        })
        .catch((error) => {
          console.error("Error regenerating analysis:", error);
          showError("Failed to regenerate analysis. Please try again.");
        });
    } else {
      showError("Analysis component not ready. Please try again later.");
    }
  };

  // ****************************

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Send GET request to the backend (Express server)
      const response = await fetch(
        `/patents?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occured");
      }

      const data = await response.json();

      // Handle the patent results
      if (data.patents) {
        // console.log(`Our data.patents data is ${data.patents}`)
        setResults(data.patents);
      } else {
        setError("No Patents Found For This Query!");
      }
    } catch (err) {
      console.error("Error fetching Patents:", err);
      setError(`Error: ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  // ***********************

  const [selectedButtons, setSelectedButtons] = useState([]);
  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  useEffect(() => {
    const selectedBtns = localStorage.getItem("selectedButtons");

    if (selectedBtns) {
      try {
        // Parse the JSON data correctly to an array
        const parsedBtns = JSON.parse(selectedBtns);
        setSelectedButtons(parsedBtns); // Store it as an array
      } catch (e) {
        console.error("Error parsing selected buttons:", e);
        setSelectedButtons([]); // Fallback to an empty array if parsing fails
      }
    }
  }, []);

  // Save pdfText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pdf_Text", pdfText);
  }, [pdfText]);

  // Example function to update pdfText
  const handleChange = (event) => {
    setPdfText(event.target.value);
  };

  // *************************

  async function generateanswerInnoWithQuestion(e, questionText) {
    setGeneratinganswerInno(true);
    e.preventDefault();
    setanswerInno("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno(formatForQuill(generatedAnswer));
      setJustGeneratedInno(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno(false);
  }

  async function generateanswerInno2WithQuestion(e, questionText) {
    setKeyFeaturesReady(false);
    setGeneratinganswerInno2(true);
    e.preventDefault();
    setanswerInno2("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-latest:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const keyFeaturesText =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno2(formatForQuill(keyFeaturesText));

      // Save to localStorage for later use
      localStorage.setItem("keyFeatures", keyFeaturesText);

      // Set keyFeaturesReady to true
      setKeyFeaturesReady(true);
      setJustGeneratedInno2(true);
    } catch (error) {
      console.log(error);
      setanswerInno2("Sorry - Something went wrong. Please try again!");
      setKeyFeaturesReady(false);
    }

    setGeneratinganswerInno2(false);
  }

  async function generateanswerInno4WithQuestion(e, questionText) {
    setGeneratinganswerInno4(true);
    e.preventDefault();
    setanswerInno4("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno4(formatForQuill(generatedAnswer));
      setJustGeneratedInno4(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno4("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno4(false);
  }

  async function generateanswerInno5WithQuestion(e, questionText) {
    setGeneratinganswerInno5(true);
    e.preventDefault();
    setanswerInno5("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno5(formatForQuill(generatedAnswer));
      setJustGeneratedInno5(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno5("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno5(false);
  }

  async function generateanswerInno6WithQuestion(e, questionText) {
    setGeneratinganswerInno6(true);
    e.preventDefault();
    setanswerInno6("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno6(formatForQuill(generatedAnswer));
      setJustGeneratedInno6(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno6("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno6(false);
  }

  async function generateanswerInno7WithQuestion(e, questionText) {
    setGeneratinganswerInno7(true);
    e.preventDefault();
    setanswerInno7("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno7(formatForQuill(generatedAnswer));
      setJustGeneratedInno7(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno7("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno7(false);
  }

  async function generateanswerInno8WithQuestion(e, questionText) {
    setGeneratinganswerInno8(true);
    e.preventDefault();
    setanswerInno8("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });
      const generateAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno8(formatForQuill(generatedAnswer));
      setJustGeneratedInno8(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno8("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno8(false);
  }

  async function generateanswerInno9WithQuestion(e, questionText) {
    setGeneratinganswerInno9(true);
    e.preventDefault();
    setanswerInno9("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno9(formatForQuill(generatedAnswer));
      setJustGeneratedInno9(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno9("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno9(false);
  }

  async function generateanswerInno10WithQuestion(e, questionText) {
    setGeneratinganswerInno10(true);
    e.preventDefault();
    setanswerInno10("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generateAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno10(formatForQuill(generatedAnswer));
      setJustGeneratedInno10(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno10("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno10(false);
  }

  async function generateanswerInno11WithQuestion(e, questionText) {
    setGeneratinganswerInno11(true);
    e.preventDefault();
    setanswerInno11("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno11(formatForQuill(generatedAnswer));
      setJustGeneratedInno11(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno11("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno11(false);
  }

  async function generateanswerInno12WithQuestion(e, questionText) {
    setGeneratinganswerInno12(true);
    e.preventDefault();
    setanswerInno12("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generateAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno12(formatForQuill(generatedAnswer));
      setJustGeneratedInno12(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno12("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno12(false);
  }

  async function generateanswerInno13WithQuestion(e, questionText) {
    setGeneratinganswerInno13(true);
    e.preventDefault();
    setanswerInno13("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno13(formatForQuill(generatedAnswer));
      setJustGeneratedInno13(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno13("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno13(false);
  }

  async function generateanswerInno14WithQuestion(e, questionText) {
    setGeneratinganswerInno14(true);
    e.preventDefault();
    setanswerInno14("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generateAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno14(formatForQuill(generatedAnswer));
      setJustGeneratedInno14(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno14("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno14(false);
  }

  async function generateanswerInno15WithQuestion(e, questionText) {
    setGeneratinganswerInno15(true);
    e.preventDefault();
    setanswerInno15("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generateAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setanswerInno15(formatForQuill(generatedAnswer));
      setJustGeneratedInno15(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setanswerInno15("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno15(false);
  }

  // Update the original functions to use the new ones
  async function generateanswerInno(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("firstQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno(newQuestion);
    generateanswerInnoWithQuestion(e, newQuestion);
  }

async function generateanswerInno2(e) {
  e.preventDefault();
  // ADD THIS LINE
  setIsAnalysisTriggeredByUser(true); 

  const questionInnoContent =
    document.getElementById("secondQuestionInno").innerText;
  const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
  setQuestionInno2(newQuestion);
  generateanswerInno2WithQuestion(e, newQuestion);
}

  async function generateanswerInno4(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("fourthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno4(newQuestion);
    generateanswerInno4WithQuestion(e, newQuestion);
  }

  async function generateanswerInno5(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("fifthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno5(newQuestion);
    generateanswerInno5WithQuestion(e, newQuestion);
  }

  async function generateanswerInno6(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("sixthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno6(newQuestion);
    generateanswerInno6WithQuestion(e, newQuestion);
  }

  async function generateanswerInno7(e) {
    e.preventDefault();
    const questionInnoContent = document.getElementById(
      "seventhQuestionInno"
    ).innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno7(newQuestion);
    generateanswerInno7WithQuestion(e, newQuestion);
  }

  async function generateanswerInno8(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("eighthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno8(newQuestion);
    generateanswerInno8WithQuestion(e, newQuestion);
  }

  async function generateanswerInno9(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("ninthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno9(newQuestion);
    generateanswerInno9WithQuestion(e, newQuestion);
  }

  async function generateanswerInno10(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("tenthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno10(newQuestion);
    generateanswerInno10WithQuestion(e, newQuestion);
  }

  async function generateanswerInno11(e) {
    e.preventDefault();
    const questionInnoContent = document.getElementById(
      "eleventhQuestionInno"
    ).innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno11(newQuestion);
    generateanswerInno11WithQuestion(e, newQuestion);
  }

  async function generateanswerInno12(e) {
    e.preventDefault();
    const questionInnoContent =
      document.getElementById("twelthQuestionInno").innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno12(newQuestion);
    generateanswerInno12WithQuestion(e, newQuestion);
  }

  async function generateanswerInno13(e) {
    e.preventDefault();
    const questionInnoContent = document.getElementById(
      "thirteenthQuestionInno"
    ).innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno13(newQuestion);
    generateanswerInno13WithQuestion(e, newQuestion);
  }

  async function generateanswerInno14(e) {
    e.preventDefault();
    const questionInnoContent = document.getElementById(
      "fourteenthQuestionInno"
    ).innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno14(newQuestion);
    generateanswerInno14WithQuestion(e, newQuestion);
  }

  async function generateanswerInno15(e) {
    e.preventDefault();
    const questionInnoContent = document.getElementById(
      "fifteenthQuestionInno"
    ).innerText;
    const newQuestion = `${projectData.pdf_text}\n${questionInnoContent}`;
    setQuestionInno15(newQuestion);
    generateanswerInno15WithQuestion(e, newQuestion);
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"], // Additional text formatting
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ align: [] }], // Text alignment
      ["link", "image", "video"], // Links, Images, and Videos
      [{ color: [] }, { background: [] }], // Text and background color
      ["clean"], // Remove formatting
    ],
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChangesInno1 = (html) => {
    setanswerInno(html);
    if (!generatinganswerInno) setEditedInno(true);
    console.log(`This is answerInno One ${answerInno}`);
  };

  const handleChangesInno2 = (html) => {
    setanswerInno2(html);
    if (!generatinganswerInno2) setEditedInno2(true);
  };

  const handleChangesInno4 = (html) => {
    setanswerInno4(html);
    if (!generatinganswerInno4) setEditedInno4(true);
  };

  const handleChangesInno5 = (html) => {
    setanswerInno5(html);
    if (!generatinganswerInno5) setEditedInno5(true);
  };

  const handleChangesInno6 = (html) => {
    setanswerInno6(html);
    if (!generatinganswerInno6) setEditedInno6(true);
  };

  const handleChangesInno7 = (html) => {
    setanswerInno7(html);
    if (!generatinganswerInno7) setEditedInno7(true);
  };

  const handleChangesInno8 = (html) => {
    setanswerInno8(html);
    if (!generatinganswerInno8) setEditedInno8(true);
  };

  const handleChangesInno9 = (html) => {
    setanswerInno9(html);
    if (!generatinganswerInno9) setEditedInno9(true);
  };

  const handleChangesInno10 = (html) => {
    setanswerInno10(html);
    if (!generatinganswerInno10) setEditedInno10(true);
  };

  const handleChangesInno11 = (html) => {
    setanswerInno11(html);
    if (!generatinganswerInno11) setEditedInno11(true);
  };

  const handleChangesInno12 = (html) => {
    setanswerInno12(html);
    if (!generatinganswerInno12) setEditedInno12(true);
  };

  const handleChangesInno13 = (html) => {
    setanswerInno13(html);
    if (!generatinganswerInno13) setEditedInno13(true);
  };

  const handleChangesInno14 = (html) => {
    setanswerInno14(html);
    if (!generatinganswerInno14) setEditedInno14(true);
  };

  const handleChangesInno15 = (html) => {
    setanswerInno15(html);
    if (!generatinganswerInno15) setEditedInno15(true);
  };
  // ******************************

  const handleButtonClickInno = () => {
    console.log("Button1 clicked");

    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("firstQuestionInno").innerText;
    setQuestionInno(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno2 = () => {
    console.log("Button2 clicked");

    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("secondQuestionInno").innerText;
    setQuestionInno2(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno4 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("fourthQuestionInno").innerText;
    setQuestionInno4(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno5 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("fifthQuestionInno").innerText;
    setQuestionInno5(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno6 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("sixthQuestionInno").innerText;
    setQuestionInno6(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno7 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent = document.getElementById(
      "seventhQuestionInno"
    ).innerText;
    setQuestionInno7(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno8 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("eighthQuestionInno").innerText;
    setQuestionInno8(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno9 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("ninthQuestionInno").innerText;
    setQuestionInno9(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno10 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("tenthQuestionInno").innerText;
    setQuestionInno10(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno11 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent = document.getElementById(
      "eleventhQuestionInno"
    ).innerText;
    setQuestionInno11(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno12 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent =
      document.getElementById("twelthQuestionInno").innerText;
    setQuestionInno12(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno13 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent = document.getElementById(
      "thirteenthQuestionInno"
    ).innerText;
    setQuestionInno13(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno14 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent = document.getElementById(
      "fourteenthQuestionInno"
    ).innerText;
    setQuestionInno14(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  const handleButtonClickInno15 = () => {
    if (!pdfTextForPrompts) {
      showInfo(
        "PDF content is not loaded yet. Please wait or refresh the page."
      );
      return;
    }

    const questionInnoContent = document.getElementById(
      "fifteenthQuestionInno"
    ).innerText;
    setQuestionInno15(`${pdfTextForPrompts}\n${questionInnoContent}`);
  };

  // Update the main function that handles all button clicks
  function handleAllButtonClick2(e) {
    e.preventDefault();

    // Set the state to true and save to localStorage
    setGenerateButtonClicked(true);
    localStorage.setItem("generateButtonClicked_innoCheckNext", "true");

    // Reset key features ready flag and previous analysis results
    setKeyFeaturesReady(false);
    setIsAnalysisTriggeredByUser(true); 
    // Reset any previous analysis results
    if (inventionAnalyzerRef.current) {
      inventionAnalyzerRef.current.resetAnalysis();
    }

    if (selectedButtons.includes("Summary Of Invention")) {
      const questionContent =
        document.getElementById("firstQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno(newQuestion);
      generateanswerInnoWithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Key Features")) {
      const questionContent =
        document.getElementById("secondQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno2(newQuestion);
      generateanswerInno2WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Problem Statement")) {
      const questionContent =
        document.getElementById("fourthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno4(newQuestion);
      generateanswerInno4WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Solution Statement")) {
      const questionContent =
        document.getElementById("fifthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno5(newQuestion);
      generateanswerInno5WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Novelty Statement")) {
      const questionContent =
        document.getElementById("sixthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno6(newQuestion);
      generateanswerInno6WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Listing Of Results")) {
      const questionContent = document.getElementById(
        "seventhQuestionInno"
      ).innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno7(newQuestion);
      generateanswerInno7WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Result Matrix vs Key Feature")) {
      const questionContent =
        document.getElementById("eighthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno8(newQuestion);
      generateanswerInno8WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Advantages Of Invention")) {
      const questionContent =
        document.getElementById("ninthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno9(newQuestion);
      generateanswerInno9WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Comparative Analysis")) {
      const questionContent =
        document.getElementById("tenthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno10(newQuestion);
      generateanswerInno10WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Industrial Applicability")) {
      const questionContent = document.getElementById(
        "eleventhQuestionInno"
      ).innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno11(newQuestion);
      generateanswerInno11WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Relevant Excerpts")) {
      const questionContent =
        document.getElementById("twelthQuestionInno").innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno12(newQuestion);
      generateanswerInno12WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Inovators In The Field")) {
      const questionContent = document.getElementById(
        "thirteenthQuestionInno"
      ).innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno13(newQuestion);
      generateanswerInno13WithQuestion(e, newQuestion);
    }

    if (selectedButtons.includes("Recommendation")) {
      const questionContent = document.getElementById(
        "fourteenthQuestionInno"
      ).innerText;
      const newQuestion = `${projectData.pdf_text}\n${questionContent}`;
      setQuestionInno14(newQuestion);
      generateanswerInno14WithQuestion(e, newQuestion);
    }
  }

  useEffect(() => {
  const fetchInnoCheckData = async () => {
    try {
      const userData = localStorage.getItem("user");
      const projectId = localStorage.getItem("project_id");
      const selectedProject = localStorage.getItem("selectedProject");

      const user = userData ? JSON.parse(userData) : null;
      if (!userData) {
        console.log("User data not found");
        return;
      }
      if (!projectId && !selectedProject) {
        console.log("Project ID not found");
        return;
      }

      const projectIdentifier = projectId || selectedProject;

      // Fetch project data
      const projectResponse = await axios.get("/getProjectData", {
        params: {
          u_id: user.id,
          project_id: projectIdentifier,
        },
      });
      console.log("Fetched project_id:", projectResponse.data.project_id);
      setProjectData(projectResponse.data);

      // Fetch InnoCheck data and determine existence
      try {
        const innocheckResponse = await axios.get("/api/getInnocheck", {
          params: { project_id: projectResponse.data.project_id },
        });

        if (innocheckResponse.data && innocheckResponse.data.length > 0) {
          const existingInnocheck = innocheckResponse.data[0];
          setDraftData(existingInnocheck);
          setInnoCheckExists(true); // InnoCheck data exists

          // IMPORTANT: Set selectedButtons from saved InnoCheck data
          if (existingInnocheck.selected_buttons && Array.isArray(existingInnocheck.selected_buttons)) {
            setSelectedButtons(existingInnocheck.selected_buttons);
            // Also update localStorage to keep it in sync
            localStorage.setItem("selectedButtons", JSON.stringify(existingInnocheck.selected_buttons));
          }

          // Populate form with existing data
          setanswerInno(existingInnocheck.summary_of_invention || "");
          setanswerInno2(existingInnocheck.key_features || "");
          setanswerInno4(existingInnocheck.problem_statement || "");
          setanswerInno5(existingInnocheck.solution_statement || "");
          setanswerInno6(existingInnocheck.novelty_statement || "");
          setanswerInno8(existingInnocheck.result_metric || "");
          setanswerInno9(existingInnocheck.advantages_of_invention || "");
          setanswerInno10(existingInnocheck.comparative_analysis || "");
          setanswerInno11(existingInnocheck.industrial_applicability || "");
          setanswerInno12(existingInnocheck.relevant_excerpts || "");
          setanswerInno13(existingInnocheck.innovators_in_the_field || "");
          setanswerInno14(existingInnocheck.recommendation || "");

          if (existingInnocheck.analyze_invention_data) {
            setTimeout(() => {
              if (
                inventionAnalyzerRef.current &&
                typeof inventionAnalyzerRef.current.setResultData ===
                  "function"
              ) {
                inventionAnalyzerRef.current.setResultData(
                  existingInnocheck.analyze_invention_data
                );
              }
            }, 1000);
          }
        } else {
          setInnoCheckExists(false); // No InnoCheck data
        }
      } catch (innocheckError) {
        if (
          innocheckError.response &&
          innocheckError.response.status === 404
        ) {
          console.log("No InnoCheck data found yet - new project");
          setInnoCheckExists(false); // No InnoCheck data on 404
        } else {
          console.warn("Error fetching InnoCheck data:", innocheckError);
          setInnoCheckExists(false); // Default to false on other errors
        }
      }
    } catch (error) {
      console.error("Error in fetchInnoCheckData:", error);
      setError("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  fetchInnoCheckData();
}, []); // Empty dependency array runs once on mount

  // Add this useEffect to trigger invention analysis when Key Features are ready
// Add this useEffect to trigger invention analysis when Key Features are ready
useEffect(() => {
  // MODIFIED CONDITION: Check for the user trigger flag first
  if (
    isAnalysisTriggeredByUser &&
    keyFeaturesReady &&
    answerInno2 &&
    answerInno2.trim() !== "" &&
    answerInno2 !== "Generating answer... Wait for a while..."
  ) {
    console.log(
      "User-triggered analysis: Key Features ready, initiating..."
    );

    if (inventionAnalyzerRef.current) {
      inventionAnalyzerRef.current.resetAnalysis();
      inventionAnalyzerRef.current
        .handleSubmit()
        .then(() => {
          console.log("Analyzer completed, saving all data");
          handleSubmit();
        })
        .catch((error) => {
          console.error("Error in analyzer handleSubmit:", error);
        });
    }
    // IMPORTANT: Reset the flag to prevent re-triggers on subsequent renders
    setIsAnalysisTriggeredByUser(false);
  }
}, [keyFeaturesReady, answerInno2, isAnalysisTriggeredByUser]); // ADD isAnalysisTriggeredByUser to the dependency array

  const handleSubmit = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const projectId = localStorage.getItem("project_id");
    const selectedProject = localStorage.getItem("selectedProject");
    const u_id = userData ? userData.id : null;

    if (!u_id) {
      showError("User ID is missing.");
      return;
    }

    // Determine which project_id to use: projectId from localStorage or selectedProject from localStorage
    const projectIdentifier = projectId || selectedProject;

    if (!projectIdentifier) {
      showError("Project ID is missing from localStorage.");
      return;
    }

    // Check if projectData exists in localStorage, if not, create a mock projectData for validation
    const projectData = JSON.parse(localStorage.getItem("projectData"));

    if (!projectData) {
      console.log(
        "No projectData found in localStorage. Using available project ID."
      );
      // If projectData is missing, we don't have an object to check. Instead, we just compare the project ID.
      if (
        String(projectIdentifier) !== String(projectId) &&
        String(projectIdentifier) !== String(selectedProject)
      ) {
        showError(`Project ID mismatch. Local ID: ${projectIdentifier}`);
        return;
      }
    } else {
      // Check if projectData exists and compare project_id values
      if (String(projectData.project_id) !== String(projectIdentifier)) {
        showError(
          `Project ID mismatch. Local ID: ${projectIdentifier}, Project Data ID: ${
            projectData?.project_id || "undefined"
          }`
        );
        return;
      }
    }

    setLoading(true);

    // Get Analyze Invention data if available
    let analyzeInventionData = null;
    if (
      inventionAnalyzerRef.current &&
      typeof inventionAnalyzerRef.current.getResultData === "function"
    ) {
      const resultData = inventionAnalyzerRef.current.getResultData();
      if (resultData) {
        analyzeInventionData = resultData;
      }
    }

    const dataToSend = {
      summary_of_invention: answerInno || "",
      key_features: answerInno2 || "",
      problem_statement: answerInno4 || "",
      solution_statement: answerInno5 || "",
      novelty_statement: answerInno6 || "",
      result_metric: answerInno8 || "",
      advantages_of_invention: answerInno9 || "",
      comparative_analysis: answerInno10 || "",
      industrial_applicability: answerInno11 || "",
      relevant_excerpts: answerInno12 || "",
      innovators_in_the_field: answerInno13 || "",
      recommendation: answerInno14 || "",
      selected_buttons: selectedButtons || [],
      // Add Analyze Invention data if available
      ...(analyzeInventionData && {
        analyze_invention_data: analyzeInventionData,
      }),
      project_id: projectIdentifier,
      u_id,
    };

    console.log("Sending data:", dataToSend);

    try {
      const response = await axios.post("/api/saveInnocheck", dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        console.log(response.data.message);
        // Optionally store the returned data
        localStorage.setItem(
          "projectData",
          JSON.stringify(response.data.data || projectData)
        );
      }
    } catch (error) {
      console.error(
        "Error during submission:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while saving the data.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {projectData && projectData.pdf_text ? (
        <div className="pdf-text-container" style={{ display: "none" }}>
          <h2 className="text-xl font-bold">PDF Text Content:</h2>
          <p>{projectData.pdf_text}</p>{" "}
          {/* Directly render the pdf_text here */}
        </div>
      ) : (
        <div>Loading project data...</div> // Display a loading message if projectData is null
      )}
      <div className="row">
        <div className="col-lg-8 col-md-8 col-sm-12 left-cont mar-bott-res">
          <button
            className="btn-stl-4 w-auto"
            onClick={() => navigate("/innoCheck")}
            style={{
              color: "#504f4f",
            }}
          >
            <b style={{ fontSize: "13px", fontWeight: "700" }}>Go to Input</b>
          </button>
          {!innoCheckExists && !generateButtonClicked && (
            <button
              className="btn-stl-4 w-auto"
              onClick={handleAllButtonClick2}
              style={{
                color: "#504f4f",
              }}
            >
              <b
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#495057",
                }}
              >
                Generate All Fields
              </b>
            </button>
          )}
          {selectedButtons.includes("Summary Of Invention") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ marginTop: "20px" }}
            >
              <h3 style={{ color: "#36718b" }}>Summary Of Invention</h3>
              {/* <p style={{ fontSize: "18px" }}>
          What is the tentative title for your invention?
        </p> */}
              <p id="firstQuestionInno" style={{ display: "none" }}>
                As a legal assistant, your task is to draft a 'Summary' for a
                patent. Your final output should: - Be a maximum of 150 words.
                Start with a small paragraph of around 50 words that captures
                the essence followed by several one-liner sentences starting
                with "Optionally, ...", as used in patents.
                <br />
                Make sure to use 1 or 2 paragraphs for the summary and no
                numbered line or anything to be there.
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
              </p>

              <div
                id="firstanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno}</ReactMarkdown> */}
                <ReactQuill
                  name="summary_of_invention"
                  value={answerInno}
                  onChange={handleChangesInno1}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example structure for second question */}
          {selectedButtons.includes("Key Features") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Key Features</h3>
              {/* <p style={{ fontSize: "18px" }}>
            Please indicate the occasion for making this invention. Describe the
            general problem statement and which prior art, already known to you
            that forms the starting of your invention?
          </p> */}
              <p id="secondQuestionInno" style={{ display: "none" }}>
                You are a patent search analyst tasked at patentability search
                projects. Understand the invention in detail and then start
                giving the key features focusing on the novel aspects and the
                solution of the invention mostly. The key features would have a
                preamble and then sub-features within it, the key features
                should further be nested like 1, 1.1, 1.2, 2, 2.1, and so on.
                The most important thing in key features is to divide them into
                really atomic units (like each key feature should be atomic,
                instead of clubbing features, look to divide them well). Note
                that the key features should describe the invention's solution
                and not the invention's prior art or application or advantage,
                should focus on the invention details so we can assist the
                patent searchers. Also note that the second key feature should
                refer to (like said X, if X was defined or explained in key
                feature 1) or kind of be in continuation to what was in the
                first key feature while being atomic. You can use up to 200 word
                max in total.
                <br />
                I am giving you 2 examples so you can use them for inspiration
                and writing style without getting affected by those invention
                data while doing your work.
                <br />
                Example 1 has Description: "We are engineering fusion proteins
                between an RNA-guided RNA- or DNA-targeting molecule (such as
                deactivated CRISPR-Cas proteins or CRISPR inspired RNA targeting
                proteins) and a pro-domain-truncated initiator caspase
                (Caspase-2, -8, -9 or -10 or modified version of these). These
                will constitute a system that can detect one or multiple
                specific and programmable RNA or DNA sequences (Target
                Sequences) in living cells and activate a downstream protease
                cascade switch only if these Target Sequences are present in the
                cell. We use 2 guide RNAs (gRNAs) to position 2 of these fusion
                proteins in close proximity on the Target Sequence, which
                provides a signal for the truncated Caspase submodules to
                dimerize and thereby activate their protease activity. In the
                absence of the Target Sequence, the gRNAs will not bring these
                fusion proteins into close proximity and dimerisation and
                Caspase activation will not occur. If the Target Sequence is
                present in the cell, the subsequent Caspase protease activity
                will trigger a downstream response, which can be customized:
                e.g. i) by activating executioner Caspases, such as Caspase 3,
                triggering apoptosis; ii) by using engineered initiator Caspases
                with modified specificity, we can uncouple from the Caspase
                initiated apoptotic pathway and instead activate zymogens
                (inactive enzymes that can be activated by a protease),
                transcription factors or other signalling molecules. Overall,
                our invention can detect a programmable Target Sequence in
                living cells and initiate a downstream response, such as
                apoptosis, only if the Target Sequence is present in these
                cells. Our system will be the first of its kind to use nucleic
                acid sequence markers in living cells and to allow a response to
                be activated dependent on the presence of these target
                sequences. A very new technology was recently published and
                patented, which has a similar objective but achieves it in a
                very different way and at this stage its sensitivity and
                selectivity is low."
                <br />
                Example 1 has Key Features: "Primary Features: 1. Method for
                activating protease cascade switch upon detection of a target
                sequence (specific nucleic acid sequence) such as DNA or RNA in
                living cells, wherein; 1.1 Said activation is performed through
                an engineered system which includes CRISPR RNA guided fusion
                proteins between either RNA-guided RNA or DNA-targeting molecule
                (such as deactivated CRISPR-Cas proteins or CRISPR inspired RNA
                targeting proteins) with a pro-domain-truncated initiator
                caspase such as Caspase-2, -8, -9 or -10 or type III/E Craspase
                systems to activate caspase-8/9; 1.2 Two of said guide RNAs
                (gRNAs) used to position two of the fusion proteins in close
                proximity on the target sequence, wherein; 1.2.1 Said guide RNA
                provides a signal for the truncated caspase submodules to
                dimerize and further activates/triggered their protease
                activity. 1.3 A triggered downstream response can be customized
                in following different manner: 1.3.1 Activating executioner
                caspases, such as Caspase 3, triggering apoptosis or 1.3.2 Using
                engineered initiator caspases with modified specificity, we can
                uncouple from the caspase initiated apoptotic pathway and
                instead activate zymogens (inactive enzymes that can be
                activated by a protease), transcription factors or other
                signalling molecules. Secondary Features: 1.4 Said method and
                engineered system is applicable in following areas: 1.4.1
                Eliminating cancer cells very specifically and without or with
                minimal side effects and/or 1.4.2 Distinguishing and selectively
                eliminating one particular species from closely related species,
                effectively using it as an exceptionally selective pesticide or
                eliminating invasive species from endemic species and/or 1.4.3
                Visualizing target cells (e.g. cancer cells) for surgical
                applications."
                <br />
                Example 2 has description: "Recently, an idea came up making a
                flow sensor obsolete. An electric pump pumping water (or aqueous
                liquid) through a tube system. Detect if just air is aspirated
                because the reservoir is empty or there is a significant leak in
                the aspiration tubing or an aspiration tube is disconnected.
                Detect if one of the tubings is clogged or kinked so that the
                tube is blocked Current solution is to use a flow sensor. A New
                approach - Monitor the power consumption of the pump
                (electromotor) If a defined threshold of power consumption is
                exceeded, it indicates a blockage or clogging. If a defined
                threshold of power consumption is undershot, air is aspirated.
                We want just to monitor if liquid flows by pumping. NO
                quantification of flow required. We want to evaluate if the
                concept is free to use or if still patents are in force. Does
                expired patents exist which describe the concept?"
                <br />
                Example 2 has key features: "Primary Features: 1. A Power
                Monitoring Device comprises: 1a. The device monitors the power
                consumption of the pump (electromotor). 1b. If a defined
                threshold of power consumption is exceeded, it indicates a
                blockage or clogging. 1c. If a defined threshold of power
                consumption is undershot, air is aspirated. Secondary Feature:
                2. The pump is an electric pump pumping water (aqueous liquid)
                through a tube system."
                <br />
                I have given you description and key features pair examples. So
                learn my key feature writing style and generate the required key
                features in the format I want. Don't get influenced by the
                examples just use them for inspiration.
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
                <br />
                The invention description you need to work on is:
              </p>

              <div
                id="secondanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno2}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno2}
                  onChange={handleChangesInno2}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example structure for fourth question */}
          {selectedButtons.includes("Problem Statement") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Problem Statement</h3>
              {/* <p style={{ fontSize: "18px" }}>
            What is the novel aspect of your invention and how is it solving the
            drawbacks found in existing prior art?
          </p> */}
              <p id="fourthQuestionInno" style={{ display: "none" }}>
                You are a patent analyst. Your task is to read the given
                invention details and then identify the problem statement
                addressed in the invention details. While writing, please write
                the exact wording and sentences in the invention details and
                don’t rephrase them. Try not to include any other details such
                as patent numbers or solution details or anything else, just the
                problem statement being written in the invention details. Also
                use up to 200 words to answer (more or less depending what’s in
                the invention details form, don’t add or remove anything and
                don’t rephrase too).
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
              </p>

              <div
                id="fourthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno4}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno4}
                  onChange={handleChangesInno4}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example structure for fifth question */}
          {selectedButtons.includes("Solution Statement") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Solution Statement</h3>

              <p id="fifthQuestionInno" style={{ display: "none" }}>
                You are a patent analyst. Your task is to read the given
                invention details and then identify the solution statement
                addressed in the invention details. While writing, please write
                the exact wording and sentences in the invention details and
                don’t rephrase them. Try not to include any other details such
                as patent numbers or problem details or anything else, just the
                solution statement being written in the invention details. Also
                use up to 200 words to answer (more or less depending what’s in
                the invention details form, don’t add or remove anything and
                don’t rephrase too).
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
              </p>

              <div
                id="fifthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno5}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno5}
                  onChange={handleChangesInno5}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for sixth question */}
          {selectedButtons.includes("Novelty Statement") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Novelty Statement</h3>

              <p id="sixthQuestionInno" style={{ display: "none" }}>
                You are a patent analyst. Your task is to read the given
                invention details and then identify the novelty statement (or
                what’s written about novelty) addressed in the invention
                details. While writing, please write the exact wording and
                sentences in the invention details and don’t rephrase them. Try
                not to include any other details such as patent numbers or
                problem details or anything else, just the novelty statement
                being written in the invention details. Also use up to 200 words
                to answer (more or less depending what’s in the invention
                details form, don’t add or remove anything and don’t rephrase
                too).
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
              </p>

              <div
                id="sixthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno6}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno6}
                  onChange={handleChangesInno6}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Seventh question */}
          {selectedButtons.includes("Listing Of Results") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ display: "none" }}
            >
              <h3 style={{ color: "#36718b" }}>Listing of Results</h3>

              <p id="seventhQuestionInno" style={{ display: "none" }}>
                Provide me the Listing of Results of the above provided content.
                Provided content should only contain the Listing of Results and
                nothing else. First line must be a heading of "Listing of
                Results" in h1 tag.
                <br />
                Don't use html word in the answer.
                <br />
                Provide a detailed listing of the 20 search results, including
                relevant patents, applications, and non-patent literature that
                closely relate to the invention. Include key details like patent
                numbers, titles, abstract and publication dates.
                <br />
                And provided content should only give complete answer using
                proper html tags & not even single word is written without tag.
                And also give the content with proper heading and ordered list
                with proper alignment so that it looks good. And provided text
                must align to the left side. And the provided content must be
                left aligned.
              </p>

              <div
                id="seventhanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno7}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno7}
                  onChange={handleChangesInno7}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Eighth question */}
          {selectedButtons.includes("Result Matrix vs Key Feature") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ display: "none" }}
            >
              <h3 style={{ color: "#36718b" }}>Result Matrix vs Key Feature</h3>

              <p id="eighthQuestionInno" style={{ display: "none" }}>
                Provide me the Result Matrix vs Key Feature of the above
                provided content. Provided content should only contain the
                Result Matrix vs Key Feature and nothing else.
                <br />
                Don't use html word in the answer.
                <br />
                Create a matrix comparing the key features of the invention with
                the relevant prior art. For each feature, indicate whether a
                similar feature exists in the prior art, and explain any
                differences.
                <br />
                And provided content should only give complete answer using
                proper html tags & not even single word is written without tag.
                And also give the content with proper heading and ordered list
                with proper alignment so that it looks good. And provided text
                must align to the left side. And the provided content must be
                left aligned.
              </p>

              <div
                id="eighthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno8}
                  onChange={handleChangesInno8}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Ninth question */}
          {selectedButtons.includes("Advantages Of Invention") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Advantages of Invention</h3>

              <p id="ninthQuestionInno" style={{ display: "none" }}>
                You are a researcher. Your task is to read the given invention
                details and then identify the advantages the invention offers
                over existing technologies. The advantages can be in terms of
                improved performance, efficiency, cost, or usability compared to
                the prior art, whichever is disclosed and we don’t have to
                include all those advantage parameters I said, just the ones
                that are there in the invention detail only. While writing,
                please write the exact advantages written in the invention
                detail, do not add anything from your side. Try not to include
                any other details such as patent numbers or problem details or
                anything else, just the advantages being written in the
                invention details. Make the format such as a heading which is
                the advantage and then numbered line(s) below explaining the
                specific advantage of that and then the next advantage heading
                and then numbered line(s) below and so on. Also use up to 150
                words to answer (more or less depending what’s in the invention
                details form, don’t add or remove).
                <br />
                Ensure to give the top heading enclosed within a pair of h1
                tags. The following content below that should be enclosed within
                p tags (one or multiple, as required) and if some other heading
                or sub-heading has to be there, that should be enclosed within
                h2 tags. Ensure to not use any other tags in the output.
              </p>

              <div
                id="ninthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno9}
                  onChange={handleChangesInno9}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Tenth question */}
          {selectedButtons.includes("Comparative Analysis") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ display: "none" }}
            >
              <h3 style={{ color: "#36718b" }}>Comparative Analysis</h3>

              <p id="tenthQuestionInno" style={{ display: "none" }}>
                Provide me the Comparative Analysis of the above provided
                content. Provided content should only contain the Comparative
                Analysis and nothing else.
                <br />
                Don't use html word in the answer.
                <br />
                Conduct a detailed comparison between the invention and the most
                relevant prior art. Focus on similarities, differences, and why
                the invention stands out in terms of novelty and improvement.
                <br />
                And provided content should only give complete answer using
                proper html tags & not even single word is written without tag.
                And also give the content with proper heading and ordered list
                with proper alignment so that it looks good. And provided text
                must align to the left side. And the provided content must be
                left aligned.
              </p>

              <div
                id="tenthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno10}
                  onChange={handleChangesInno10}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Eleventh question */}
          {selectedButtons.includes("Industrial Applicability") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Industrial Applicability</h3>

              <p id="eleventhQuestionInno" style={{ display: "none" }}>
                You are a researcher. Your task is to read the given invention
                details and then identify the potential industrial applications
                of the invention. We want to understand where and how this
                invention could be applied in industry or commercial products.
                Try not to include any other details such as patent numbers or
                problem details or anything else, just the potential commercial
                applications of the invention. Make the format such that on the
                top, there is a single heading in a single pair of h1 tags
                called "Industrial Application". After that, a heading of the
                industry domain to be written and enclosed in a single pair of
                h2 tag then below that, in individual p tag pairs, you must give
                the actual applications in that domain. Then you will move on
                the next industry domain and give the h2 tag pair and the
                respective p tag pairs of that and so on. Also use up to 150
                words to answer (more or less depending what’s in the invention
                details form, don’t add or remove).
                <br />
                Ensure to give the single top heading enclosed within a pair of
                h1 tag. The following content below that should be enclosed
                within within the respective h2 and p tag pairs. Ensure to not
                use any other tags in the output.
              </p>

              <div
                id="eleventhanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno11}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno11}
                  onChange={handleChangesInno11}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Twelth question */}
          {selectedButtons.includes("Relevant Excerpts") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ display: "none" }}
            >
              <h3 style={{ color: "#36718b" }}>Relevant Excerpts</h3>

              <p id="twelthQuestionInno" style={{ display: "none" }}>
                Provide me the Relevant Excerpts of the above provided content.
                Provided content should only contain the Relevant Excerpts and
                nothing else.
                <br />
                Don't use html word in the answer.
                <br />
                Extract and list the most relevant excerpts or sections from the
                identified prior art that relate directly to the key features of
                the invention.
                <br />
                And provided content should only give complete answer using
                proper html tags & not even single word is written without tag.
                And also give the content with proper heading and ordered list
                with proper alignment so that it looks good. And provided text
                must align to the left side. And the provided content must be
                left aligned.
              </p>

              <div
                id="twelthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno12}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno12}
                  onChange={handleChangesInno12}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Thirteenth question */}
          {selectedButtons.includes("Inovators In The Field") && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>Inovators In The Field</h3>

              <p id="thirteenthQuestionInno" style={{ display: "none" }}>
                You are a researcher. Your task is to read the given invention
                details and then use your vast internal knowledge to identify
                the key innovators or companies in the relevant field.
                Categorize them into small, medium, and large entities based on
                their market presence, contributions, etc. and describe their
                role or contributions in similar technologies. Try not to
                include any other details such as patent numbers or problem
                details or anything else. Make the format such as at the top
                there is a single heading called Key Innovators enclosed within
                a single pair of h1 tags. Then a heading in a single pair of h2
                tags called Large Entity and then sub-headings (in h3 tag pair)
                which is the entity name and then below that one or two liner
                describing their presence/contribution (in a p tag pair) and
                then next sub-heading for the next entity name and so on. Then
                you do the same process with medium and small entities using the
                same format. Also use up to 200 words to answer (more or less
                depending what’s in the invention details form, don’t add or
                remove).
                <br />
                Ensure to give the single top heading enclosed within a pair of
                h1 tags. The following content below that should be enclosed
                within respective h2, h3, and p tags (one or multiple, as
                required). Ensure to not use any other tags in the output.
              </p>

              <div
                id="thirteenthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno13}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno13}
                  onChange={handleChangesInno13}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* Example Structure for Fourteenth question */}
          {selectedButtons.includes("Recommendation") && (
            <div
              className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
              style={{ display: "none" }}
            >
              <h3 style={{ color: "#36718b" }}>Recommendation</h3>

              <p id="fourteenthQuestionInno" style={{ display: "none" }}>
                Provide me the Recommendation of the above provided content.
                Provided content should only contain the Recommendation and
                nothing else.
                <br />
                Don't use html tag or word in the answer.
                <br />
                Based on the search results, provide recommendations on whether
                to proceed with a patent application, refine the invention, or
                explore alternative strategies. Include any actionable steps for
                further development.
                <br />
                And provided content should only give complete answer using
                proper html tags & not even single word is written without tag.
                And also give the content with proper heading and ordered list
                with proper alignment so that it looks good. And provided text
                must align to the left side. And the provided content must be
                left aligned.
              </p>

              <div
                id="fourteenthanswerInno"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{ borderRadius: "20px" }}
              >
                {/* <ReactMarkdown className="p-4">{answerInno6}</ReactMarkdown> */}
                <ReactQuill
                  value={answerInno14}
                  onChange={handleChangesInno14}
                  modules={modules}
                />
              </div>
            </div>
          )}
          {/* *********************Invention Analyzer starts********* */}
          <div
            className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
            style={{ backgroundColor: "white", borderRadius: "20px" }}
          >
            {
              <InventionAnalyzer
                ref={inventionAnalyzerRef}
                keyFeatures={answerInno2}
                onReady={() => setAnalyzerReady(true)}
              />
            }
          </div>
          {/* ***********Invention Analyzer Ends********* */}
          {/* Example Structure for Fifteenth question */}
          <div
            className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
            style={{ display: "none" }}
          >
            <h3 style={{ color: "#36718b" }}>Input for InnoCheck</h3>

            <p id="fifteenthQuestionInno" style={{ display: "none" }}>
              Provide me the Solution Statement of the above provided content.
              Provided content should only contain the Solution Statement as it
              is present in the provided pdf without any modification.
              <br />I want the solution statement as it is in the provided pdf
              and also without any diagram.
            </p>

            <div
              id="fifteenthanswerInno"
              className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg  shadow-lg transition-all duration-500 transform hover:scale-105"
              style={{ borderRadius: "20px" }}
            >
              {/* <ReactMarkdown className="p-4">{answerInno6}</ReactMarkdown> */}
              {/* <ReactQuill
                value={answerInno15}
                onChange={handleChangesInno15}
                modules={modules}
              /> */}
              <p style={{ padding: "20px" }}>{answerInno15}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-4 col-sm-12">
          <div>
            <h6 style={{ color: "#008CBF" }}>
              1 - Options to refine the Search Report
            </h6>
            <div className="d-flex align-items-center justify-content-left flex-wrap">
              <form onSubmit={generateanswerInno}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno}
                  onChange={(e) => setQuestionInno(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button1"
                  onClick={handleButtonClickInno}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno}
                >
                  <b>Regenerate - </b>Summary Of Invention
                </button>
              </form>

              <form onSubmit={generateanswerInno2}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno2}
                  onChange={(e) => setQuestionInno2(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button2"
                  onClick={handleButtonClickInno2}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno2}
                >
                  <b>Regenerate - </b> Key Features
                </button>
              </form>

              <form onSubmit={generateanswerInno4}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno4}
                  onChange={(e) => setQuestionInno4(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button4"
                  onClick={handleButtonClickInno4}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno4}
                >
                  <b>Regenerate - </b>Problem Statement
                </button>
              </form>

              <form onSubmit={generateanswerInno5}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno5}
                  onChange={(e) => setQuestionInno5(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button5"
                  onClick={handleButtonClickInno5}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno5}
                >
                  <b>Regenerate - </b>Solution Statement
                </button>
              </form>
              <form onSubmit={generateanswerInno6}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno6}
                  onChange={(e) => setQuestionInno6(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button6"
                  onClick={handleButtonClickInno6}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno6}
                >
                  <b>Regenerate - </b>Novelty Statement
                </button>
              </form>
              <form onSubmit={generateanswerInno7} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno7}
                  onChange={(e) => setQuestionInno7(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button7"
                  onClick={handleButtonClickInno7}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno7}
                >
                  <b>Regenerate - </b> Listing Of Results
                </button>
              </form>

              <form onSubmit={generateanswerInno8} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno8}
                  onChange={(e) => setQuestionInno8(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button8"
                  onClick={handleButtonClickInno8}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno8}
                >
                  <b>Regenerate - </b>Result Matrix vs Key Feature
                </button>
              </form>

              <form onSubmit={generateanswerInno9}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno9}
                  onChange={(e) => setQuestionInno9(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button9"
                  onClick={handleButtonClickInno9}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno9}
                >
                  <b>Regenerate - </b>Advantages Of Invention
                </button>
              </form>
              <form onSubmit={generateanswerInno10} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno10}
                  onChange={(e) => setQuestionInno10(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button10"
                  onClick={handleButtonClickInno10}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno10}
                >
                  <b>Regenerate - </b>Comparative Analysis
                </button>
              </form>

              <form onSubmit={generateanswerInno11}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno11}
                  onChange={(e) => setQuestionInno11(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button11"
                  onClick={handleButtonClickInno11}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno11}
                >
                  <b>Regenerate - </b>Industrial Applicability
                </button>
              </form>
              <form onSubmit={generateanswerInno12} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno12}
                  onChange={(e) => setQuestionInno12(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button12"
                  onClick={handleButtonClickInno12}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno12}
                >
                  <b>Regenerate - </b>Relevant Excerpts
                </button>
              </form>

              <form onSubmit={generateanswerInno13}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno13}
                  onChange={(e) => setQuestionInno13(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button13"
                  onClick={handleButtonClickInno13}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno13}
                >
                  <b>Regenerate - </b> Inovators In The Field
                </button>
              </form>

              <form onSubmit={generateanswerInno14} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno14}
                  onChange={(e) => setQuestionInno14(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button14"
                  onClick={handleButtonClickInno14}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno14}
                >
                  <b>Regenerate - </b>Recommendation
                </button>
              </form>

              <form onSubmit={generateanswerInno15} style={{ display: "none" }}>
                <textarea
                  id="passQuery"
                  required
                  className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                  value={questionInno15}
                  onChange={(e) => setQuestionInno15(e.target.value)}
                  placeholder="Ask anything"
                  style={{ display: "none" }}
                ></textarea>
                <button
                  id="button15"
                  onClick={handleButtonClickInno15}
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={generatinganswerInno15}
                  style={{ color: "#44B9FF", border: "1px solid #44B9FF" }}
                >
                  <b>Generate - </b>Novelty Search Results
                </button>
              </form>

              <form
                style={{ display: "block" }}
                onSubmit={handleRegenerateAnalyzer}
              >
                <button
                  id="button16"
                  type="submit"
                  className="btn-stl-3 w-auto"
                  disabled={!answerInno2 || generatinganswerInno2}
                >
                  <b>Regenerate - </b>Listing Of Results + Result Matrix vs Key
                  Features + Relevant Excerpts
                </button>
              </form>
            </div>
          </div>
          <div style={{ marginTop: "30px" }}>
            <h6 style={{ color: "rgb(0, 140, 191)" }}>
              2 - Select your next action
            </h6>
            <PatentDraftingInno />
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadPDFInno;
