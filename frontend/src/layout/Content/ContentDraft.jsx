import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DiagramGallery from "../../components/Drawing/DiagramGallery";
import axios from "axios";
// import ReactMarkdown from "react-markdown";
import ReactQuill, { Quill } from "react-quill";
import "./Content.css";
import "react-quill/dist/quill.snow.css";
import { useToast } from "../../context/ToastContext";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from "docx";
import { useNavigate, useBlocker } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
// Import at the top if not already there
import { FaFilePdf, FaFileWord, FaDownload } from "react-icons/fa";
import Consult from "../../components/shared/Consult";
// Import the utility function
import { formatForQuill } from "../../utils/formatUtils";
import { svgToPng, dataUrlToBlob } from "../../utils/svgConverter";
import PlantUmlComponent from "../../components/Drawing/PlantUmlComponent";
import PlantUmlComponent2 from "../../components/Drawing/PlantUmlComponent2";
import {
  extractPlantUmlContent,
  getPlantUmlImageUrl,
  plantUmlToImage,
} from "../../utils/plantUmlRenderer";
import pako from "pako"; // Add this to your dependencies

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-4xl text-blue-600 cursor-pointer`}
      style={{ ...style }}
      onClick={onClick}
    >
      &lt; {/* HTML entity for < */}
    </div>
  );
};

// Custom Next Arrow Component
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-4xl text-blue-600 cursor-pointer`}
      style={{ ...style }}
      onClick={onClick}
    >
      &gt; {/* HTML entity for > */}
    </div>
  );
};

const renderMermaidToSvg = async (mermaidCode) => {
  if (!mermaidCode || mermaidCode.trim() === "") return null;

  try {
    // Dynamically import mermaid
    const mermaid = await import("mermaid");

    // Initialize mermaid
    mermaid.default.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
    });

    // Generate a unique ID
    const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Render to SVG string
    const { svg } = await mermaid.default.render(id, mermaidCode);
    return svg;
  } catch (error) {
    console.error("Failed to render diagram:", error);
    return null;
  }
};

const validateMermaidDiagram = async (diagramText) => {
  if (!diagramText || diagramText.trim() === "") return false;

  try {
    const mermaid = await import("mermaid");
    await mermaid.default.parse(diagramText, { suppressErrors: true });
    return true;
  } catch (error) {
    console.debug("Diagram validation failed:", error.message);
    return false;
  }
};

const convertMermaidToImage = async (mermaidCode) => {
  try {
    // First validate the diagram
    const isValid = await validateMermaidDiagram(mermaidCode);
    if (!isValid) {
      console.debug("Skipping invalid diagram");
      return null;
    }

    const svg = await renderMermaidToSvg(mermaidCode);
    if (!svg) return null;

    // Create a temporary container
    const container = document.createElement("div");
    container.innerHTML = svg;
    const svgElement = container.querySelector("svg");

    // Set larger canvas dimensions for better quality
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Larger canvas size for better quality
    canvas.width = 1600; // Doubled width
    canvas.height = 1200; // Doubled height

    // Create image from SVG
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        // Set white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;

        if (aspectRatio > 1) {
          drawHeight = canvas.width / aspectRatio;
        } else {
          drawWidth = canvas.height * aspectRatio;
        }

        // Center the image
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        // Draw image with some padding
        ctx.drawImage(img, x, y, drawWidth * 0.9, drawHeight * 0.9);

        // Convert to base64 and remove header
        const base64 = canvas
          .toDataURL("image/png", 1.0)
          .replace(/^data:image\/\w+;base64,/, "");
        resolve(base64);
      };
      img.src = "data:image/svg+xml;base64," + btoa(svg);
    });
  } catch (error) {
    console.error("Error converting diagram:", error);
    return null;
  }
};

// Replace the Mermaid extraction and rendering functions with PlantUML versions
const extractFlowchartDescription = (briefDescription) => {
  if (!briefDescription) return "";

  // Look for paragraph containing flow chart description (case insensitive)
  const flowchartRegex = /<p>.*?(flow\s*chart|flowchart).*?<\/p>/i;
  const match = briefDescription.match(flowchartRegex);

  return match ? match[0].replace(/<\/?p>/g, "") : "";
};

const extractBlockDiagramDescription = (briefDescription) => {
  if (!briefDescription) return "";

  // Look for paragraph containing block diagram description (case insensitive)
  const blockDiagramRegex = /<p>.*?(block\s*diagram).*?<\/p>/i;
  const match = briefDescription.match(blockDiagramRegex);

  if (match) {
    console.log("Found block diagram description:", match[0]);
    return match[0].replace(/<\/?p>/g, "");
  } else {
    console.log(
      "No block diagram description found in:",
      briefDescription.substring(0, 200) + "..."
    );
    return "";
  }
};

const ContentDraft = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);
  const [generateButtonClicked, setGenerateButtonClicked] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const handleChangeNew = (html) => setEditorContent(html);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");
  const [question4, setQuestion4] = useState("");
  const [question5, setQuestion5] = useState("");
  const [question6, setQuestion6] = useState("");
  const [question7, setQuestion7] = useState("");
  const [question8, setQuestion8] = useState("");
  const [question9, setQuestion9] = useState("");
  const [question10, setQuestion10] = useState("");
  const [question11, setQuestion11] = useState("");
  const [question12, setQuestion12] = useState("");
  const [question13, setQuestion13] = useState("");
  const [question14, setQuestion14] = useState("");
  const [question15, setQuestion15] = useState("");
  const [answer, setAnswer] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [answer4, setAnswer4] = useState("");
  const [answer5, setAnswer5] = useState("");
  const [answer6, setAnswer6] = useState("");
  const [answer7, setAnswer7] = useState("");
  const [answer8, setAnswer8] = useState("");
  const [answer9, setAnswer9] = useState("");
  const [answer10, setAnswer10] = useState("");
  const [answer11, setAnswer11] = useState("");
  const [answer12, setAnswer12] = useState("");
  const [answer13, setAnswer13] = useState("");
  const [answer14, setAnswer14] = useState("");
  const [answer15, setAnswer15] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [generatingAnswer2, setGeneratingAnswer2] = useState(false);
  const [generatingAnswer3, setGeneratingAnswer3] = useState(false);
  const [generatingAnswer4, setGeneratingAnswer4] = useState(false);
  const [generatingAnswer5, setGeneratingAnswer5] = useState(false);
  const [generatingAnswer6, setGeneratingAnswer6] = useState(false);
  const [generatingAnswer7, setGeneratingAnswer7] = useState(false);
  const [generatingAnswer8, setGeneratingAnswer8] = useState(false);
  const [generatingAnswer9, setGeneratingAnswer9] = useState(false);
  const [generatingAnswer10, setGeneratingAnswer10] = useState(false);
  const [generatingAnswer11, setGeneratingAnswer11] = useState(false);
  const [generatingAnswer12, setGeneratingAnswer12] = useState(false);
  const [generatingAnswer13, setGeneratingAnswer13] = useState(false);
  const [generatingAnswer14, setGeneratingAnswer14] = useState(false);
  const [generatingAnswer15, setGeneratingAnswer15] = useState(false);

  // ***********Block Navigation starts********
  const [isAnyAnswerGenerating, setIsAnyAnswerGenerating] = useState(false);

  useEffect(() => {
    const anyGenerating =
      generatingAnswer ||
      generatingAnswer2 ||
      generatingAnswer3 ||
      generatingAnswer4 ||
      generatingAnswer5 ||
      generatingAnswer6 ||
      generatingAnswer7 ||
      generatingAnswer8 ||
      generatingAnswer9 ||
      generatingAnswer10 ||
      generatingAnswer11 ||
      generatingAnswer12 ||
      generatingAnswer13 ||
      generatingAnswer14 ||
      generatingAnswer15;
    setIsAnyAnswerGenerating(anyGenerating);
  }, [
    generatingAnswer,
    generatingAnswer2,
    generatingAnswer3,
    generatingAnswer4,
    generatingAnswer5,
    generatingAnswer6,
    generatingAnswer7,
    generatingAnswer8,
    generatingAnswer9,
    generatingAnswer10,
    generatingAnswer11,
    generatingAnswer12,
    generatingAnswer13,
    generatingAnswer14,
    generatingAnswer15,
  ]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isAnyAnswerGenerating &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker && blocker.state === "blocked") {
      showWarning("Wait till all the answers are successfully generated.");
      blocker.reset();
    }
  }, [blocker]);

  // ***********Block Navigation ends********

  // Auto-save flags for generation
  const [justGenerated, setJustGenerated] = useState(false);
  const [justGenerated2, setJustGenerated2] = useState(false);
  const [justGenerated3, setJustGenerated3] = useState(false);
  const [justGenerated4, setJustGenerated4] = useState(false);
  const [justGenerated5, setJustGenerated5] = useState(false);
  const [justGenerated6, setJustGenerated6] = useState(false);
  const [justGenerated7, setJustGenerated7] = useState(false);
  const [justGenerated8, setJustGenerated8] = useState(false);
  const [justGenerated9, setJustGenerated9] = useState(false);
  const [justGenerated10, setJustGenerated10] = useState(false);
  const [justGenerated11, setJustGenerated11] = useState(false);
  const [justGenerated12, setJustGenerated12] = useState(false);
  const [justGenerated13, setJustGenerated13] = useState(false);
  const [justGenerated14, setJustGenerated14] = useState(false);
  const [justGenerated15, setJustGenerated15] = useState(false);

  // Auto-update flags for edits
  const [edited, setEdited] = useState(false);
  const [edited2, setEdited2] = useState(false);
  const [edited3, setEdited3] = useState(false);
  const [edited4, setEdited4] = useState(false);
  const [edited5, setEdited5] = useState(false);
  const [edited6, setEdited6] = useState(false);
  const [edited7, setEdited7] = useState(false);
  const [edited8, setEdited8] = useState(false);
  const [edited9, setEdited9] = useState(false);
  const [edited10, setEdited10] = useState(false);
  const [edited11, setEdited11] = useState(false);
  const [edited12, setEdited12] = useState(false);
  const [edited13, setEdited13] = useState(false);
  const [edited14, setEdited14] = useState(false);
  const [edited15, setEdited15] = useState(false);

  // ******* NEW DRAWINGS PROGRESS BAR STATE *******
  const [showDrawingsProgress, setShowDrawingsProgress] = useState(false);
  const [drawingsProgress, setDrawingsProgress] = useState(0);
  const [drawingsProgressMessage, setDrawingsProgressMessage] = useState(
    "Generating Drawings"
  );
  const [drawingsProgressTimer, setDrawingsProgressTimer] = useState(null);
  const [drawingsGenerationStatus, setDrawingsGenerationStatus] = useState({
    flowchart: false,
    blockDiagram: false,
    startTime: null,
    expectedDuration: 60, // Start with 60 second estimate
  });

  const [pdfText, setPdfText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Initialize a key for refresh
  const [refreshKey2, setRefreshKey2] = useState(0);
  const [refreshKey3, setRefreshKey3] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectData, setProjectData] = useState(null);
  const [draftdata, setDraftData] = useState(null);
  const [draftExists, setDraftExists] = useState(false);
  // ******************
  const [isButton10Visible, setIsButton10Visible] = useState(false);
  const [isButton11Visible, setIsButton11Visible] = useState(false);
  const [isButton12Visible, setIsButton12Visible] = useState(false);
  const [isButton13Visible, setIsButton13Visible] = useState(false);
  const [briefDescriptionGenerated, setBriefDescriptionGenerated] =
    useState(false);

  const triggerRef = useRef(null);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setShowDownloadOptions(false);
      }
    };

    if (showDownloadOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadOptions]);

  // ******* DRAWINGS PROGRESS BAR FUNCTIONS *******
  const startDrawingsProgress = () => {
    const startTime = Date.now();
    setShowDrawingsProgress(true);
    setDrawingsProgress(0);
    setDrawingsProgressMessage("Generating Drawings");
    setDrawingsGenerationStatus({
      flowchart: false,
      blockDiagram: false,
      startTime: startTime,
      expectedDuration: 60, // Start with 60 second estimate
    });

    let currentProgress = 0;
    let currentStage = 0;
    const stages = [
      "Generating Drawings",
      "Adding Notations",
      "Preparing Final Drawings",
    ];

    const progressTimer = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const currentStatus = drawingsGenerationStatus;

      // Calculate adaptive progress based on actual completion status
      if (currentStatus.flowchart && currentStatus.blockDiagram) {
        // Both complete - should have been handled by useEffect
        clearInterval(progressTimer);
        setDrawingsProgressTimer(null);
        return;
      } else if (currentStatus.flowchart || currentStatus.blockDiagram) {
        // One diagram complete - we're at least 60% done, now progress slowly to 90%
        const baseProgress = 60;
        const slowProgressRange = 30; // From 60% to 90%
        const slowProgressDuration = currentStatus.expectedDuration * 0.8; // Take 80% of expected remaining time
        const timeInSlowPhase =
          elapsedTime - currentStatus.expectedDuration * 0.6;
        const slowProgressRatio = Math.min(
          timeInSlowPhase / slowProgressDuration,
          1
        );
        currentProgress = baseProgress + slowProgressRange * slowProgressRatio;
      } else {
        // No diagrams complete yet - normal speed to 60%
        const normalProgressDuration = currentStatus.expectedDuration * 0.6;
        const progressRatio = Math.min(elapsedTime / normalProgressDuration, 1);
        currentProgress = 60 * progressRatio;
      }

      // Update stage based on progress
      if (currentProgress >= 25 && currentStage === 0) {
        currentStage = 1;
        setDrawingsProgressMessage(stages[1]);
        console.log("Progress stage changed to:", stages[1]);
      } else if (currentProgress >= 60 && currentStage === 1) {
        currentStage = 2;
        setDrawingsProgressMessage(stages[2]);
        console.log("Progress stage changed to:", stages[2]);
      }

      setDrawingsProgress(Math.min(currentProgress, 90)); // Cap at 90% until both are done

      // Failsafe: After 3 minutes, force completion
      if (elapsedTime > 180) {
        console.log("Force completing drawings progress after 3 minutes");
        clearInterval(progressTimer);
        setDrawingsProgressTimer(null);
        completeDrawingsProgress();
      }
    }, 1000);

    setDrawingsProgressTimer(progressTimer);
  };

  const updateDrawingsProgress = (diagramType) => {
    console.log(`${diagramType} diagram completed`);
    const currentTime = Date.now();

    setDrawingsGenerationStatus((prev) => {
      const elapsedTime = (currentTime - prev.startTime) / 1000;
      const newStatus = {
        ...prev,
        [diagramType]: true,
      };

      // Update time estimation based on actual performance
      if (diagramType === "flowchart" && !prev.blockDiagram) {
        // First diagram done, estimate remaining time more accurately
        const estimatedTotalTime = Math.max(elapsedTime * 1.8, 45); // Estimate total time, minimum 45s
        newStatus.expectedDuration = estimatedTotalTime;
        // console.log(
        //   `Updated expected duration to ${newStatus.expectedDuration}s based on first diagram completion`
        // );
      } else if (diagramType === "blockDiagram" && !prev.flowchart) {
        // Block diagram completed first (less common)
        const estimatedTotalTime = Math.max(elapsedTime * 1.6, 40);
        newStatus.expectedDuration = estimatedTotalTime;
        // console.log(
        //   `Updated expected duration to ${newStatus.expectedDuration}s based on block diagram completion`
        // );
      }

      return newStatus;
    });
  };

  const completeDrawingsProgress = () => {
    console.log("Completing drawings progress bar");
    if (drawingsProgressTimer) {
      clearInterval(drawingsProgressTimer);
      setDrawingsProgressTimer(null);
    }

    // Smooth completion animation from current progress to 100%
    setDrawingsProgress((prev) => {
      // Animate from current progress to 100%
      const startProgress = prev;
      let currentAnimationProgress = startProgress;

      const animationTimer = setInterval(() => {
        currentAnimationProgress += (100 - startProgress) / 10; // Complete animation in ~1 second
        if (currentAnimationProgress >= 100) {
          setDrawingsProgress(100);
          setDrawingsProgressMessage("Drawings Ready");
          clearInterval(animationTimer);

          // Hide the progress bar after showing "Drawings Ready"
          setTimeout(() => {
            setShowDrawingsProgress(false);
            setDrawingsProgress(0);
            setDrawingsProgressMessage("Generating Drawings");
            setDrawingsGenerationStatus({
              flowchart: false,
              blockDiagram: false,
              startTime: null,
              expectedDuration: 60,
            });
          }, 1500);
        } else {
          setDrawingsProgress(currentAnimationProgress);
        }
      }, 100);

      return startProgress;
    });
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (drawingsProgressTimer) {
        clearInterval(drawingsProgressTimer);
      }
    };
  }, [drawingsProgressTimer]);

  // **********************************
  // --- NEW: LocalStorage Handling ---
  const getLocalStorageKeyForDraftVisibility = (projectId) => {
    // Use a different key prefix than Content.jsx
    return `draftMaster_sectionVisibility_${projectId}`;
  };

  // EFFECT: Load section visibility from localStorage on projectData load
  useEffect(() => {
    if (projectData && projectData.project_id) {
      const visibilityKey = getLocalStorageKeyForDraftVisibility(
        projectData.project_id
      );
      const savedVisibility = localStorage.getItem(visibilityKey);
      if (savedVisibility) {
        try {
          const parsedVisibility = JSON.parse(savedVisibility);
          setIsButton10Visible(parsedVisibility.isButton10Visible || false);
          setIsButton11Visible(parsedVisibility.isButton11Visible || false);
          setIsButton12Visible(parsedVisibility.isButton12Visible || false);
          setIsButton13Visible(parsedVisibility.isButton13Visible || false);
          console.log(
            "Loaded DraftMaster section visibility from localStorage:",
            parsedVisibility
          );
        } catch (err) {
          console.error(
            "Failed to parse DraftMaster section visibility from localStorage",
            err
          );
          // Fallback to content check will happen in fetchDraftMaster
        }
      } else {
        console.log(
          "No DraftMaster section visibility in localStorage, will derive from draft content."
        );
        // Fallback to content check will happen in fetchDraftMaster
      }
    }
  }, [projectData]); // Dependency: projectData

  // EFFECT: Save section visibility to localStorage when they change
  useEffect(() => {
    if (projectData && projectData.project_id) {
      const visibilityKey = getLocalStorageKeyForDraftVisibility(
        projectData.project_id
      );
      const visibilityState = {
        isButton10Visible,
        isButton11Visible,
        isButton12Visible,
        isButton13Visible,
      };
      localStorage.setItem(visibilityKey, JSON.stringify(visibilityState));
      // console.log("Saved DraftMaster section visibility to localStorage:", visibilityState);
    }
    // Dependencies include the visibility states and projectData
  }, [
    isButton10Visible,
    isButton11Visible,
    isButton12Visible,
    isButton13Visible,
    projectData,
  ]);
  // --- END: LocalStorage Handling ---

  // **********************************

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleToggleButtonClick10 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton10Visible;
    setIsButton10Visible(!currentlyVisible);

    if (!currentlyVisible) {
      // Adding section
      console.log("Add - Alternative Embodiment clicked.");
      // Check if answer10 is effectively empty
      if (
        !answer10 ||
        answer10.trim() === "" ||
        (answer10.includes("<p><br></p>") && answer10.length < 20)
      ) {
        console.log("Auto-generating Alternative Embodiment...");
        // Add robustness checks inside generateAnswer10 if not already present
        await generateAnswer10(e);
      } else {
        console.log(
          "Alternative Embodiment already has content, just showing."
        );
      }
    } else {
      // Removing section
      console.log("Remove - Alternative Embodiment clicked.");
    }
  };

  const handleToggleButtonClick11 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton11Visible;
    setIsButton11Visible(!currentlyVisible);

    if (!currentlyVisible) {
      // Adding section
      console.log("Add - Sequence Listing clicked.");
      if (
        !answer11 ||
        answer11.trim() === "" ||
        (answer11.includes("<p><br></p>") && answer11.length < 20)
      ) {
        console.log("Auto-generating Sequence Listing...");
        await generateAnswer11(e);
      } else {
        console.log("Sequence Listing already has content, just showing.");
      }
    } else {
      // Removing section
      console.log("Remove - Sequence Listing clicked.");
    }
  };

  const handleToggleButtonClick12 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton12Visible;
    setIsButton12Visible(!currentlyVisible);

    if (!currentlyVisible) {
      // Adding section
      console.log("Add - Industrial Applicability clicked.");
      if (
        !answer12 ||
        answer12.trim() === "" ||
        (answer12.includes("<p><br></p>") && answer12.length < 20)
      ) {
        console.log("Auto-generating Industrial Applicability...");
        await generateAnswer12(e);
      } else {
        console.log(
          "Industrial Applicability already has content, just showing."
        );
      }
    } else {
      // Removing section
      console.log("Remove - Industrial Applicability clicked.");
    }
  };

  const handleToggleButtonClick13 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton13Visible;
    setIsButton13Visible(!currentlyVisible);

    if (!currentlyVisible) {
      // Adding section
      console.log("Add - Custom Paragraphs clicked.");
      if (
        !answer13 ||
        answer13.trim() === "" ||
        (answer13.includes("<p><br></p>") && answer13.length < 20)
      ) {
        console.log("Auto-generating Custom Paragraphs...");
        await generateAnswer13(e);
      } else {
        console.log("Custom Paragraphs already has content, just showing.");
      }
    } else {
      // Removing section
      console.log("Remove - Custom Paragraphs clicked.");
    }
  };

  // **********************

  const settings = {
    dots: true, // Show navigation dots below
    infinite: true, // Enable infinite looping
    speed: 500, // Transition speed in milliseconds
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    arrows: true, // Enable arrows
    prevArrow: <PrevArrow />, // Custom previous arrow
    nextArrow: <NextArrow />, // Custom next arrow
  };

  // **************Slick slider ends****************

  const quillRef = React.createRef();

  // For flowchart (activity diagram)
  const answer9Length = answer9 ? answer9.length : 0;
  const flowchartUml = extractPlantUmlContent(answer9);
  // console.log(
  //   "ContentDraft - Extracted flowchart UML:",
  //   flowchartUml ? `Length: ${flowchartUml.length}` : "None"
  // );

  // For block diagram (component diagram)
  const answer15Length = answer15 ? answer15.length : 0;
  const blockDiagramUml = extractPlantUmlContent(answer15);
  // console.log(
  //   "ContentDraft - Extracted block diagram UML:",
  //   blockDiagramUml ? `Length: ${blockDiagramUml.length}` : "None"
  // );

  // Add a logging utility function for diagram debugging
  const logDiagramState = () => {
    console.log("Diagram State Debug:", {
      flowchartUmlLength: flowchartUml?.length,
      blockDiagramUmlLength: blockDiagramUml?.length,
      extractedDiagramsCount: extractedDiagrams?.length,
    });
  };

  // *************************************

  useEffect(() => {
    if (
      answer ||
      answer8 ||
      answer2 ||
      answer3 ||
      answer4 ||
      answer7 ||
      answer5 ||
      answer6
    ) {
      setEditorContent(
        `${answer}\n\n${answer8}\n\n${answer2}\n\n${answer3}\n\n${answer4}\n\n${answer7}\n\n${answer5}\n\n${answer6}` +
          `${isButton10Visible && answer10 ? "\n\n" + answer10 : ""}` +
          `${isButton11Visible && answer11 ? "\n\n" + answer11 : ""}` +
          `${isButton12Visible && answer12 ? "\n\n" + answer12 : ""}` +
          `${isButton13Visible && answer13 ? "\n\n" + answer13 : ""}`
      );
    }
  }, [
    answer,
    answer8,
    answer2,
    answer3,
    answer4,
    answer7,
    answer5,
    answer6,
    answer9, // Still watched for side effects but not included directly
    answer10,
    answer11,
    answer12,
    answer13,
    answer14, // Still watched for side effects but not included directly
    answer15, // Still watched for side effects but not included directly
    isButton10Visible,
    isButton11Visible,
    isButton12Visible,
    isButton13Visible,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only update state if diagrams aren't being displayed
      if (!(flowchartUml || blockDiagramUml)) {
        setReloadFlag((prev) => !prev);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [flowchartUml, blockDiagramUml]);

  // Memoize diagram extraction to prevent re-parsing on every render
  // Memoize diagram extraction to prevent re-parsing on every render
  const extractedDiagrams = useMemo(() => {
    console.log("ContentDraft - Preparing diagrams for gallery");

    const diagrams = [
      blockDiagramUml
        ? {
            type: "block",
            content: blockDiagramUml,
            title: "Drawing 1: Block Diagram",
          }
        : null,
      flowchartUml
        ? {
            type: "flowchart",
            content: flowchartUml,
            title: "Drawing 2: Flow Chart",
          }
        : null,
    ].filter(Boolean);

    console.log(
      "ContentDraft - Prepared",
      diagrams.length,
      "diagrams for gallery"
    );

    // ******* Smart progress tracking *******
    if (showDrawingsProgress) {
      const hasFlowchart = !!flowchartUml;
      const hasBlockDiagram = !!blockDiagramUml;

      // Update individual diagram completion status
      if (hasFlowchart && !drawingsGenerationStatus.flowchart) {
        updateDrawingsProgress("flowchart");
      }
      if (hasBlockDiagram && !drawingsGenerationStatus.blockDiagram) {
        updateDrawingsProgress("blockDiagram");
      }

      // Complete when both are ready
      if (
        hasFlowchart &&
        hasBlockDiagram &&
        drawingsGenerationStatus.flowchart &&
        drawingsGenerationStatus.blockDiagram
      ) {
        console.log("Both diagrams are ready, completing progress");
        completeDrawingsProgress();
      }
    }

    return diagrams;
  }, [
    flowchartUml,
    blockDiagramUml,
    showDrawingsProgress,
    drawingsGenerationStatus.flowchart,
    drawingsGenerationStatus.blockDiagram,
  ]);

  const handlePrint4 = async () => {
    try {
      // Pre-render all diagrams to images
      const preRenderDiagrams = async () => {
        let diagramsHTML = "";

        // Render flowcharts
        if (flowchartUml) {
          diagramsHTML += `<h2>Flowcharts</h2>`;
          const flowchartUrl = getPlantUmlImageUrl(flowchartUml);
          if (flowchartUrl) {
            diagramsHTML += `<div style="text-align: center; margin: 20px 0;"><img src="${flowchartUrl}" alt="Flow Chart" /></div>`;
          }
        }

        // Render block diagrams
        if (blockDiagramUml) {
          diagramsHTML += `<h2>Block Diagrams</h2>`;
          const blockDiagramUrl = getPlantUmlImageUrl(blockDiagramUml);
          if (blockDiagramUrl) {
            diagramsHTML += `<div style="text-align: center; margin: 20px 0;"><img src="${blockDiagramUrl}" alt="Block Diagram" /></div>`;
          }
        }

        return diagramsHTML;
      };

      // Render all diagrams
      const diagramsHTML = await preRenderDiagrams();

      // Open new window and write content
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to view the report");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Patent Draft</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px 40px; background-color: #f6f6ff; }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f5f7f9; 
                color: #008cbf;
              }
              
              /* Headings */
              h2 { color: #36718b; margin-top: 25px; margin-bottom: 10px; }
              h3 { color: #2196f3; margin-top: 20px; margin-bottom: 10px; }
              h4 { color: #333; margin-top: 15px; }
              
              /* Diagrams */
              .diagram-container {
                margin: 20px 0;
                page-break-inside: avoid;
              }
              
              /* Image styles */
              img {
                max-width: 100%;
                height: auto;
                margin: 15px auto;
                display: block;
              }
              
              /* Other elements */
              pre { 
                white-space: pre-wrap; 
                font-family: inherit; 
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            ${editorContent}
            <div class="diagrams-section">
              ${diagramsHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("There was an error generating the report. Please try again.");
    }
  };

  const handlePrint5 = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Patent Draft</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>${editorContent}</body>
            </html>
        `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 2000);
  };

  const handlePrint6 = () => {
    const printWindow = window.open("", "_blank");

    // Build diagrams HTML
    let diagramsHTML = "";

    // Add flowchart if available
    if (flowchartUml) {
      diagramsHTML += `<h2>Flowchart</h2>`;
      const flowchartUrl = getPlantUmlImageUrl(flowchartUml);
      diagramsHTML += `<div style="text-align: center; margin: 20px 0;"><img src="${flowchartUrl}" alt="Flow Chart" /></div>`;
    }

    // Add block diagram if available
    if (blockDiagramUml) {
      diagramsHTML += `<h2>Block Diagram</h2>`;
      const blockDiagramUrl = getPlantUmlImageUrl(blockDiagramUml);
      diagramsHTML += `<div style="text-align: center; margin: 20px 0;"><img src="${blockDiagramUrl}" alt="Block Diagram" /></div>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Patent Draft</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px 40px; background-color: #f6f6ff; }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f7f9; 
              color: #008cbf;
            }
            
            /* Headings */
            h2 { color: #36718b; margin-top: 25px; margin-bottom: 10px; }
            h3 { color: #2196f3; margin-top: 20px; margin-bottom: 10px; }
            h4 { color: #333; margin-top: 15px; }
            
            /* Diagrams */
            .diagram-container {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            
            /* Other elements */
            pre { 
              white-space: pre-wrap; 
              font-family: inherit; 
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
            }
            
            /* Make sure images are responsive */
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${editorContent}
          <div class="diagrams-section">
            ${diagramsHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownload4 = async () => {
    try {
      const quill = quillRef.current.getEditor();
      const textContent = quill.getText();
      const lines = textContent
        .split("\n")
        .filter((line) => line.trim() !== "");
      const docElements = [];

      // Process text content
      lines.forEach((line) => {
        const isHeading =
          /^(Title of Invention|Abstract|Background|Summary|Field|Brief Description|Detailed Description|Claims|Drawings|Alternative Embodiment|Sequence Listing|Industrial Applicability|Custom Paragraphs)/i.test(
            line
          );

        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: isHeading,
                size: isHeading ? 32 : 24,
                color: "000000",
              }),
            ],
            spacing: {
              before: isHeading ? 400 : 200,
              after: isHeading ? 200 : 100,
            },
          })
        );
      });

      // Handle diagrams section
      if (flowchartUml || blockDiagramUml) {
        // Only add Drawings section if there are valid diagrams
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Drawings",
                bold: true,
                size: 32,
                color: "000000",
              }),
            ],
            spacing: { before: 400, after: 200 },
          })
        );

        // Process flowchart if available
        if (flowchartUml) {
          // Add page break before flowcharts
          docElements.push(
            new Paragraph({
              children: [new TextRun({ text: "", break: 1 })],
            })
          );

          const imageData1 = await plantUmlToImage(flowchartUml);
          if (imageData1) {
            docElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Drawing 1: Flow Chart",
                    bold: true,
                    size: 28,
                  }),
                ],
                spacing: { before: 200, after: 100 },
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: Uint8Array.from(atob(imageData1), (c) =>
                      c.charCodeAt(0)
                    ),
                    transformation: {
                      width: 400,
                      height: 300,
                    },
                  }),
                ],
                spacing: { before: 20, after: 40 },
                alignment: AlignmentType.CENTER,
              })
            );
          }
        }

        // Process block diagram if available
        if (blockDiagramUml) {
          // Add page break before block diagram
          docElements.push(
            new Paragraph({
              children: [new TextRun({ text: "", break: 1 })],
            })
          );

          const imageData2 = await plantUmlToImage(blockDiagramUml);
          if (imageData2) {
            docElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Drawing 2: Block Diagram",
                    bold: true,
                    size: 28,
                  }),
                ],
                spacing: { before: 200, after: 100 },
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: Uint8Array.from(atob(imageData2), (c) =>
                      c.charCodeAt(0)
                    ),
                    transformation: {
                      width: 400,
                      height: 300,
                    },
                  }),
                ],
                spacing: { before: 20, after: 40 },
                alignment: AlignmentType.CENTER,
              })
            );
          }
        }
      }

      // Create and save document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docElements,
          },
        ],
      });

      // Pack and download
      Packer.toBlob(doc).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `draftMaster-${projectData.project_id}.docx`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        setShowDownloadOptions(false);
      });
    } catch (error) {
      console.error("Error creating DOCX file:", error);
      alert("There was an error creating the DOCX file. Please try again.");
    }
  };

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  const handleChange = (event) => {
    setPdfText(event.target.value);
  };

  // Auto-save useEffects for generation
  useEffect(() => {
    if (justGenerated) {
      handleSubmit();
      setJustGenerated(false);
    }
  }, [justGenerated]);
  useEffect(() => {
    if (justGenerated2) {
      handleSubmit();
      setJustGenerated2(false);
    }
  }, [justGenerated2]);
  useEffect(() => {
    if (justGenerated3) {
      handleSubmit();
      setJustGenerated3(false);
    }
  }, [justGenerated3]);

  useEffect(() => {
    const buttonClickedStatus = localStorage.getItem(
      "generateButtonClicked_draft"
    );
    if (buttonClickedStatus === "true") {
      setGenerateButtonClicked(true);
    }
  }, []);

  useEffect(() => {
    if (justGenerated4) {
      handleSubmit();
      setJustGenerated4(false);
    }
  }, [justGenerated4]);
  useEffect(() => {
    if (justGenerated5) {
      handleSubmit();
      setJustGenerated5(false);
    }
  }, [justGenerated5]);
  useEffect(() => {
    if (justGenerated6) {
      handleSubmit();
      setJustGenerated6(false);
    }
  }, [justGenerated6]);
  useEffect(() => {
    if (justGenerated7) {
      handleSubmit();
      setJustGenerated7(false);
    }
  }, [justGenerated7]);
  useEffect(() => {
    if (justGenerated8) {
      handleSubmit();
      setJustGenerated8(false);
    }
  }, [justGenerated8]);
  useEffect(() => {
    if (justGenerated9) {
      handleSubmit();
      setJustGenerated9(false);
    }
  }, [justGenerated9]);
  useEffect(() => {
    if (justGenerated10) {
      handleSubmit();
      setJustGenerated10(false);
    }
  }, [justGenerated10]);
  useEffect(() => {
    if (justGenerated11) {
      handleSubmit();
      setJustGenerated11(false);
    }
  }, [justGenerated11]);
  useEffect(() => {
    if (justGenerated12) {
      handleSubmit();
      setJustGenerated12(false);
    }
  }, [justGenerated12]);
  useEffect(() => {
    if (justGenerated13) {
      handleSubmit();
      setJustGenerated13(false);
    }
  }, [justGenerated13]);
  useEffect(() => {
    if (justGenerated14) {
      handleSubmit();
      setJustGenerated14(false);
    }
  }, [justGenerated14]);
  useEffect(() => {
    if (justGenerated15) {
      handleSubmit();
      setJustGenerated15(false);
    }
  }, [justGenerated15]);

  // Auto-update useEffects for edits with debouncing
  useEffect(() => {
    if (edited && !generatingAnswer) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited, answer]);
  useEffect(() => {
    if (edited2 && !generatingAnswer2) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited2(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited2, answer2]);
  useEffect(() => {
    if (edited3 && !generatingAnswer3) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited3(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited3, answer3]);
  useEffect(() => {
    if (edited4 && !generatingAnswer4) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited4(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited4, answer4]);
  useEffect(() => {
    if (edited5 && !generatingAnswer5) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited5(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited5, answer5]);
  useEffect(() => {
    if (edited6 && !generatingAnswer6) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited6(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited6, answer6]);
  useEffect(() => {
    if (edited7 && !generatingAnswer7) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited7(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited7, answer7]);
  useEffect(() => {
    if (edited8 && !generatingAnswer8) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited8(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited8, answer8]);
  useEffect(() => {
    if (edited9 && !generatingAnswer9) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited9(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited9, answer9]);
  useEffect(() => {
    if (edited10 && !generatingAnswer10) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited10(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited10, answer10]);
  useEffect(() => {
    if (edited11 && !generatingAnswer11) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited11(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited11, answer11]);
  useEffect(() => {
    if (edited12 && !generatingAnswer12) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited12(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited12, answer12]);
  useEffect(() => {
    if (edited13 && !generatingAnswer13) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited13(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited13, answer13]);
  useEffect(() => {
    if (edited14 && !generatingAnswer14) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited14(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited14, answer14]);
  useEffect(() => {
    if (edited15 && !generatingAnswer15) {
      const debouncedSave = debounce(() => {
        handleSubmit();
        setEdited15(false);
      }, 1000);
      debouncedSave();
    }
  }, [edited15, answer15]);

  // ************************************

  async function generateAnswerWithQuestion(e, questionText) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Generating Answer... Wait for a while...");
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
      setAnswer(formatForQuill(generatedAnswer));
      setJustGenerated(true);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  async function generateAnswer2WithQuestion(e, questionText) {
    setGeneratingAnswer2(true);
    e.preventDefault();
    setAnswer2("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer2(formatForQuill(generatedAnswer));
      setJustGenerated2(true);
    } catch (error) {
      console.log(error);
      setAnswer2("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer2(false);
  }

  async function generateAnswer3WithQuestion(e, questionText) {
    setGeneratingAnswer3(true);
    e.preventDefault();
    setAnswer3("Generating Answer... Wait for a while...");
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
      setAnswer3(formatForQuill(generatedAnswer));
      setJustGenerated3(true);
    } catch (error) {
      console.log(error);
      setAnswer3("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer3(false);
  }

  async function generateAnswer4WithQuestion(e, questionText) {
    setGeneratingAnswer4(true);
    e.preventDefault();
    setAnswer4("Generating Answer... Wait for a while...");
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
      setAnswer4(formatForQuill(generatedAnswer));
      setJustGenerated4(true);
    } catch (error) {
      console.log(error);
      setAnswer4("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer4(false);
  }

  async function generateAnswer5WithQuestion(e, questionText) {
    // Only generate if this is the first time or if there's no content yet
    if (briefDescriptionGenerated && answer5 && answer5.trim() !== "") {
      console.log("Brief description already generated, skipping regeneration");
      return;
    }

    setGeneratingAnswer5(true);
    e.preventDefault();
    setAnswer5("Generating Answer... Wait for a while...");
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
      setAnswer5(formatForQuill(generatedAnswer));
      setBriefDescriptionGenerated(true);
      setJustGenerated5(true);

      // After brief description generation, trigger drawings and detailed description generation
      // After brief description generation, trigger drawings and detailed description generation
      // Inside generateAnswer5WithQuestion function
      setTimeout(() => {
        // ******* START DRAWINGS PROGRESS BAR *******
        startDrawingsProgress();

        // Flow chart generation
        if (!answer9 || answer9.trim() === "") {
          const flowchartDesc = extractFlowchartDescription(generatedAnswer);
          console.log("Extracted flowchart description:", flowchartDesc);
          if (flowchartDesc) {
            const flowchartQuestion =
              document.getElementById("ninthQuestion").innerText;
            const newQuestion9 = `${projectData.pdf_text}\n${flowchartQuestion}\nUse this specific description from the Brief Description of Drawings: ${flowchartDesc}`;
            setQuestion9(newQuestion9);
            generateAnswer9WithQuestion(e, newQuestion9);
          }
        }

        // Block diagram generation
        if (!answer15 || answer15.trim() === "") {
          const blockDiagramDesc =
            extractBlockDiagramDescription(generatedAnswer);
          console.log("Extracted block diagram description:", blockDiagramDesc);
          if (blockDiagramDesc) {
            const blockDiagramQuestion =
              document.getElementById("fifteenthQuestion").innerText;
            const newQuestion15 = `${projectData.pdf_text}\n${blockDiagramQuestion}\nUse this specific description from the Brief Description of Drawings: ${blockDiagramDesc}`;
            setQuestion15(newQuestion15);
            generateAnswer15WithQuestion(e, newQuestion15);
          }
        }

        // Detailed description generation with brief description included
        if (!answer6 || answer6.trim() === "") {
          const detailedDescQuestion =
            document.getElementById("sixthQuestion").innerText;
          const newQuestion6 = `${projectData.pdf_text}\n${detailedDescQuestion}\n\nHere is the Brief Description of Drawings to reference:\n${generatedAnswer}`;
          setQuestion6(newQuestion6);
          generateAnswer6WithQuestion(e, newQuestion6);
        }
      }, 500);
    } catch (error) {
      console.log(error);
      setAnswer5("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer5(false);
  }

  async function generateAnswer6WithQuestion(e, questionText) {
    setGeneratingAnswer6(true);
    e.preventDefault();
    setAnswer6("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer6(formatForQuill(generatedAnswer));
      setJustGenerated6(true);
    } catch (error) {
      console.log(error);
      setAnswer6("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer6(false);
  }

  async function generateAnswer7WithQuestion(e, questionText) {
    setGeneratingAnswer7(true);
    e.preventDefault();
    setAnswer7("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer7(formatForQuill(generatedAnswer));
      setJustGenerated7(true);
    } catch (error) {
      console.log(error);
      setAnswer7("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer7(false);
  }

  async function generateAnswer8WithQuestion(e, questionText) {
    setGeneratingAnswer8(true);
    e.preventDefault();
    setAnswer8("Generating Answer... Wait for a while...");
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
      setAnswer8(formatForQuill(generatedAnswer));
      setJustGenerated8(true);
    } catch (error) {
      console.log(error);
      setAnswer8("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer8(false);
  }

  async function generateAnswer9WithQuestion(e, questionText) {
    setGeneratingAnswer9(true);
    e.preventDefault();
    setAnswer9("Generating Answer... Wait for a while...");
    try {
      // Emphasize the importance of clean, raw PlantUML syntax
      const enhancedQuestion = `${questionText}\n\nIMPORTANT: Return ONLY the raw PlantUML syntax, without any HTML tags, formatting, or additional text. Start with @startuml on its own line and end with @enduml on its own line. Do not include backticks, markdown formatting, or explanations.`;

      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: enhancedQuestion }] }],
        },
      });

      let generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      // console.log("Raw flowchart answer:", generatedAnswer);

      // Post-process the generated answer to clean it up
      generatedAnswer = generatedAnswer
        // Remove markdown code blocks if present
        .replace(/```(?:plantuml|uml)?\n/g, "")
        .replace(/```/g, "")
        // Ensure startuml and enduml are properly formatted
        .replace(/@startuml/, "@startuml\n")
        .replace(/@enduml/, "\n@enduml")
        .trim();

      // If the answer doesn't contain @startuml and @enduml, wrap it
      if (
        !generatedAnswer.includes("@startuml") ||
        !generatedAnswer.includes("@enduml")
      ) {
        generatedAnswer = `@startuml\n${generatedAnswer.replace(
          /@startuml|@enduml/g,
          ""
        )}\n@enduml`;
      }

      console.log("Processed flowchart answer:", generatedAnswer);
      setAnswer9(generatedAnswer);
      setJustGenerated9(true);
    } catch (error) {
      console.log(error);
      setAnswer9("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer9(false);
  }

  async function generateAnswer10WithQuestion(e, questionText) {
    setGeneratingAnswer10(true);
    e.preventDefault();
    setAnswer10("Generating Answer... Wait for a while...");
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
      setAnswer10(formatForQuill(generatedAnswer));
      setJustGenerated10(true);
    } catch (error) {
      console.log(error);
      setAnswer10("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer10(false);
  }

  async function generateAnswer11WithQuestion(e, questionText) {
    setGeneratingAnswer11(true);
    e.preventDefault();
    setAnswer11("Generating Answer... Wait for a while...");
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
      setAnswer11(formatForQuill(generatedAnswer));
      setJustGenerated11(true);
    } catch (error) {
      console.log(error);
      setAnswer11("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer11(false);
  }

  async function generateAnswer12WithQuestion(e, questionText) {
    setGeneratingAnswer12(true);
    e.preventDefault();
    setAnswer12("Generating Answer... Wait for a while...");
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
      setAnswer12(formatForQuill(generatedAnswer));
      setJustGenerated12(true);
    } catch (error) {
      console.log(error);
      setAnswer12("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer12(false);
  }

  async function generateAnswer13WithQuestion(e, questionText) {
    setGeneratingAnswer13(true);
    e.preventDefault();
    setAnswer13("Generating Answer... Wait for a while...");
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
      setAnswer13(formatForQuill(generatedAnswer));
      setJustGenerated13(true);
    } catch (error) {
      console.log(error);
      setAnswer13("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer13(false);
  }

  async function generateAnswer14WithQuestion(e, questionText) {
    setGeneratingAnswer14(true);
    e.preventDefault();
    setAnswer14("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer14(formatForQuill(generatedAnswer));
      setJustGenerated14(true);
    } catch (error) {
      console.log(error);
      setAnswer14("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer14(false);
  }

  // Fix this function - the state never gets properly set to false
  async function generateAnswer15WithQuestion(e, questionText) {
    setGeneratingAnswer15(true);
    e.preventDefault();
    setAnswer15("Generating Answer... Wait for a while...");
    try {
      // Emphasize the importance of clean, raw PlantUML syntax
      const enhancedQuestion = `${questionText}\n\nIMPORTANT: Return ONLY the raw PlantUML syntax, without any HTML tags, formatting, or additional text. Start with @startuml on its own line and end with @enduml on its own line. Do not include backticks, markdown formatting, or explanations.`;

      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: enhancedQuestion }] }],
        },
      });

      let generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      console.log("Raw block diagram answer:", generatedAnswer);

      // Post-process the generated answer to clean it up
      generatedAnswer = generatedAnswer
        // Remove markdown code blocks if present
        .replace(/```(?:plantuml|uml)?\n/g, "")
        .replace(/```/g, "")
        // Ensure startuml and enduml are properly formatted
        .replace(/@startuml/, "@startuml\n")
        .replace(/@enduml/, "\n@enduml")
        .trim();

      // If the answer doesn't contain @startuml and @enduml, wrap it
      if (
        !generatedAnswer.includes("@startuml") ||
        !generatedAnswer.includes("@enduml")
      ) {
        generatedAnswer = `@startuml\n${generatedAnswer.replace(
          /@startuml|@enduml/g,
          ""
        )}\n@enduml`;
      }

      // console.log("Processed block diagram answer:", generatedAnswer);
      setAnswer15(generatedAnswer);
      setJustGenerated15(true);
    } catch (error) {
      console.log(error);
      setAnswer15("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer15(false);
  }

  // Original generateAnswer functions that delegate to the WithQuestion versions
  async function generateAnswer(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("firstQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion(newQuestion);
    generateAnswerWithQuestion(e, newQuestion);
  }

  async function generateAnswer2(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("secondQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion2(newQuestion);
    generateAnswer2WithQuestion(e, newQuestion);
  }

  async function generateAnswer3(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("thirdQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion3(newQuestion);
    generateAnswer3WithQuestion(e, newQuestion);
  }

  async function generateAnswer4(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("fourthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion4(newQuestion);
    generateAnswer4WithQuestion(e, newQuestion);
  }

  async function generateAnswer5(e) {
    // Check if brief description has already been generated
    if (briefDescriptionGenerated && answer5 && answer5.trim() !== "") {
      console.log("Brief description already generated, skipping regeneration");
      return;
    }

    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("fifthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion5(newQuestion);
    generateAnswer5WithQuestion(e, newQuestion);
  }

  async function generateAnswer6(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("sixthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion6(newQuestion);
    generateAnswer6WithQuestion(e, newQuestion);
  }

  async function generateAnswer7(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent =
      document.getElementById("seventhQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion7(newQuestion);
    generateAnswer7WithQuestion(e, newQuestion);
  }

  async function generateAnswer8(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent = document.getElementById("eighthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion8(newQuestion);
    generateAnswer8WithQuestion(e, newQuestion);
  }

  async function generateAnswer9(e) {
    e.preventDefault();

    // ******* START PROGRESS BAR IF NOT ALREADY RUNNING *******
    if (!showDrawingsProgress) {
      startDrawingsProgress();
    }

    const pdfContent = projectData.pdf_text;

    // Extract flowchart description from Brief Description
    const flowchartDescription = extractFlowchartDescription(answer5);
    // console.log(
    //   "Generating Flow Chart with description:",
    //   flowchartDescription
    // );

    // Create the question with the extracted description
    const questionContent = document.getElementById("ninthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}\nUse this specific description from the Brief Description of Drawings: ${flowchartDescription}`;

    setQuestion9(newQuestion);
    await generateAnswer9WithQuestion(e, newQuestion);
    console.log("Flow chart generation complete");
    setRefreshKey((prevKey) => prevKey + 1);
  }

  async function generateAnswer10(e) {
    e.preventDefault(); // Make sure this is called
    // Robustness Check Start
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer10: projectData or pdf_text is missing.");
      setAnswer10(
        "<h1>Alternative Embodiment</h1><p>Failed to generate: Project data not available.</p>"
      );
      setJustGenerated10(true);
      return;
    }
    const questionContentElement = document.getElementById("tenthQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer10: Question element 'tenthQuestion' not found."
      );
      setAnswer10(
        "<h1>Alternative Embodiment</h1><p>Failed to generate: Internal configuration error.</p>"
      );
      setJustGenerated10(true);
      return;
    }
    // Robustness Check End

    const pdfContent = projectData.pdf_text;
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion10(newQuestion);
    await generateAnswer10WithQuestion(e, newQuestion); // Ensure 'await' is here
  }

  // Apply similar structure (preventDefault, checks, await) to generateAnswer11, generateAnswer12, generateAnswer13

  async function generateAnswer11(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer11: projectData or pdf_text is missing.");
      setAnswer11(
        "<h1>Sequence Listing</h1><p>Failed to generate: Project data not available.</p>"
      );
      setJustGenerated11(true);
      return;
    }
    const questionContentElement = document.getElementById("eleventhQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer11: Question element 'eleventhQuestion' not found."
      );
      setAnswer11(
        "<h1>Sequence Listing</h1><p>Failed to generate: Internal configuration error.</p>"
      );
      setJustGenerated11(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion11(newQuestion);
    await generateAnswer11WithQuestion(e, newQuestion); // await added
  }

  async function generateAnswer12(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer12: projectData or pdf_text is missing.");
      setAnswer12(
        "<h1>Industrial Applicability</h1><p>Failed to generate: Project data not available.</p>"
      );
      setJustGenerated12(true);
      return;
    }
    const questionContentElement = document.getElementById("twelthQuestion"); // Corrected ID
    if (!questionContentElement) {
      console.warn(
        "generateAnswer12: Question element 'twelthQuestion' not found."
      );
      setAnswer12(
        "<h1>Industrial Applicability</h1><p>Failed to generate: Internal configuration error.</p>"
      );
      setJustGenerated12(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion12(newQuestion);
    await generateAnswer12WithQuestion(e, newQuestion); // await added
  }

  async function generateAnswer13(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer13: projectData or pdf_text is missing.");
      setAnswer13(
        "<h1>Custom Paragraphs</h1><p>Failed to generate: Project data not available.</p>"
      );
      setJustGenerated13(true);
      return;
    }
    const questionContentElement =
      document.getElementById("thirteenthQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer13: Question element 'thirteenthQuestion' not found."
      );
      setAnswer13(
        "<h1>Custom Paragraphs</h1><p>Failed to generate: Internal configuration error.</p>"
      );
      setJustGenerated13(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion13(newQuestion);
    await generateAnswer13WithQuestion(e, newQuestion); // await added
  }

  async function generateAnswer14(e) {
    e.preventDefault();
    const pdfContent = projectData.pdf_text;
    const questionContent =
      document.getElementById("fourteenthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion14(newQuestion);
    generateAnswer14WithQuestion(e, newQuestion);
    setRefreshKey2((prevKey) => prevKey + 1);
  }

  async function generateAnswer15(e) {
    e.preventDefault();

    // ******* START PROGRESS BAR IF NOT ALREADY RUNNING *******
    if (!showDrawingsProgress) {
      startDrawingsProgress();
    }

    const pdfContent = projectData.pdf_text;

    // Extract block diagram description from Brief Description
    const blockDiagramDescription = extractBlockDiagramDescription(answer5);
    console.log(
      "Generating Block Diagram with description:",
      blockDiagramDescription
    );

    // Create the question with the extracted description
    const questionContent =
      document.getElementById("fifteenthQuestion").innerText;
    const newQuestion = `${pdfContent}\n${questionContent}\nUse this specific description from the Brief Description of Drawings: ${blockDiagramDescription}`;

    setQuestion15(newQuestion);
    await generateAnswer15WithQuestion(e, newQuestion);
    console.log("Block diagram generation complete");
    setRefreshKey3((prevKey) => prevKey + 1);
  }

  // *******************************

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

  // Modified handleChanges functions to set edit flags
  const handleChanges1 = (html) => {
    setAnswer(html);
    if (!generatingAnswer) setEdited(true);
  };

  const handleChanges2 = (html) => {
    setAnswer2(html);
    if (!generatingAnswer2) setEdited2(true);
  };

  const handleChanges3 = (html) => {
    setAnswer3(html);
    if (!generatingAnswer3) setEdited3(true);
  };

  const handleChanges4 = (html) => {
    setAnswer4(html);
    if (!generatingAnswer4) setEdited4(true);
  };

  const handleChanges5 = (html) => {
    setAnswer5(html);
    if (!generatingAnswer5) setEdited5(true);
  };

  const handleChanges6 = (html) => {
    setAnswer6(html);
    if (!generatingAnswer6) setEdited6(true);
  };

  const handleChanges7 = (html) => {
    setAnswer7(html);
    if (!generatingAnswer7) setEdited7(true);
  };

  const handleChanges8 = (html) => {
    setAnswer8(html);
    if (!generatingAnswer8) setEdited8(true);
  };

  // Better handler for flowchart
  const handleChanges9 = (html) => {
    setAnswer9(html);
    console.log("Flowchart content updated, length:", html ? html.length : 0);
    if (!generatingAnswer9) setEdited9(true);
  };

  const handleChanges10 = (html) => {
    setAnswer10(html);
    if (!generatingAnswer10) setEdited10(true);
  };

  const handleChanges11 = (html) => {
    setAnswer11(html);
    if (!generatingAnswer11) setEdited11(true);
  };

  const handleChanges12 = (html) => {
    setAnswer12(html);
    if (!generatingAnswer12) setEdited12(true);
  };

  const handleChanges13 = (html) => {
    setAnswer13(html);
    if (!generatingAnswer13) setEdited13(true);
  };

  const handleChanges14 = useCallback(
    debounce((html) => {
      setAnswer14(html);
    }, 300),
    []
  );

  // Better handler for block diagram
  const handleChanges15 = (html) => {
    setAnswer15(html);
    console.log(
      "Block diagram content updated, length:",
      html ? html.length : 0
    );
    if (!generatingAnswer15) setEdited15(true);
  };

  const handleButtonClick = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("firstQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick2 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("secondQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion2(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick3 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("thirdQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion3(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick4 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("fourthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion4(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick5 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("fifthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion5(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick6 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("sixthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion6(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick7 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("seventhQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion7(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick8 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("eighthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion8(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick9 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("ninthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion9(`${projectData.pdf_text}\n${questionContent}`);

    // Increment the refresh key to re-render Mermaid charts
    setRefreshKey((prevKey) => prevKey + 1); // Update the key
  };

  const handleButtonClick10 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("tenthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion10(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick11 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("eleventhQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion11(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick12 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("twelthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion12(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick13 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("thirteenthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion13(`${projectData.pdf_text}\n${questionContent}`);
  };

  const handleButtonClick14 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("fourteenthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion14(`${projectData.pdf_text}\n${questionContent}`);

    // Increment the refresh key to re-render Mermaid charts
    setRefreshKey2((prevKey) => prevKey + 1); // Update the key
  };

  const handleButtonClick15 = () => {
    // const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("fifteenthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion15(`${projectData.pdf_text}\n${questionContent}`);

    // Increment the refresh key to re-render Mermaid charts
    setRefreshKey3((prevKey) => prevKey + 1); // Update the key
  };

  async function handleAllButtonClick(e) {
    e.preventDefault();
    setGenerateButtonClicked(true);
    localStorage.setItem("generateButtonClicked_draft", "true");

    // For title - check if this is the first generation
    if (isFirstGeneration && projectData && projectData.project_title) {
      // Use existing project title instead of generating a new one
      const formattedTitle = `<h1>Title of Invention</h1><p>${projectData.project_title}</p>`;
      setAnswer(formattedTitle);
      setJustGenerated(true); // This will trigger auto-save
    } else {
      // Normal title generation via API
      const questionContent1 =
        document.getElementById("firstQuestion").innerText;
      const newQuestion1 = `${projectData.pdf_text}\n${questionContent1}`;
      setQuestion(newQuestion1);
      generateAnswerWithQuestion(e, newQuestion1);
    }

    // Generate all other sections in parallel (except diagrams)

    // Second section - Background
    const questionContent2 =
      document.getElementById("secondQuestion").innerText;
    const newQuestion2 = `${projectData.pdf_text}\n${questionContent2}`;
    setQuestion2(newQuestion2);
    generateAnswer2WithQuestion(e, newQuestion2);

    // Third section - Summary
    const questionContent3 = document.getElementById("thirdQuestion").innerText;
    const newQuestion3 = `${projectData.pdf_text}\n${questionContent3}`;
    setQuestion3(newQuestion3);
    generateAnswer3WithQuestion(e, newQuestion3);

    // Fourth section - Fields
    const questionContent4 =
      document.getElementById("fourthQuestion").innerText;
    const newQuestion4 = `${projectData.pdf_text}\n${questionContent4}`;
    setQuestion4(newQuestion4);
    generateAnswer4WithQuestion(e, newQuestion4);

    // Seventh section - Claims (moved up in order)
    const questionContent7 =
      document.getElementById("seventhQuestion").innerText;
    const newQuestion7 = `${projectData.pdf_text}\n${questionContent7}`;
    setQuestion7(newQuestion7);
    generateAnswer7WithQuestion(e, newQuestion7);

    // Generate Brief Description first - we need this for diagrams
    const questionContent5 = document.getElementById("fifthQuestion").innerText;
    const newQuestion5 = `${projectData.pdf_text}\n${questionContent5}`;
    setQuestion5(newQuestion5);

    try {
      // We need to await this explicitly because we need its output for the diagrams
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: newQuestion5 }] }],
        },
      });

      const briefDescriptionAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer5(formatForQuill(briefDescriptionAnswer));
      setBriefDescriptionGenerated(true);
      setJustGenerated5(true);

      // In handleAllButtonClick function - after getting brief description
      setTimeout(() => {
        // ******* START DRAWINGS PROGRESS BAR *******
        startDrawingsProgress();

        // Generate flow chart using the extracted description
        const flowchartDesc = extractFlowchartDescription(
          briefDescriptionAnswer
        );
        // console.log("Extracted flowchart description:", flowchartDesc);
        const questionContent9 =
          document.getElementById("ninthQuestion").innerText;
        const newQuestion9 = `${projectData.pdf_text}\n${questionContent9}\nUse this specific description from the Brief Description of Drawings: ${flowchartDesc}`;
        setQuestion9(newQuestion9);
        generateAnswer9WithQuestion(e, newQuestion9);
        setRefreshKey((prevKey) => prevKey + 1);

        // Generate block diagram using the extracted description
        const blockDiagramDesc = extractBlockDiagramDescription(
          briefDescriptionAnswer
        );
        console.log("Extracted block diagram description:", blockDiagramDesc);
        const questionContent15 =
          document.getElementById("fifteenthQuestion").innerText;
        const newQuestion15 = `${projectData.pdf_text}\n${questionContent15}\nUse this specific description from the Brief Description of Drawings: ${blockDiagramDesc}`;
        setQuestion15(newQuestion15);
        generateAnswer15WithQuestion(e, newQuestion15);
        setRefreshKey3((prevKey) => prevKey + 1);

        // Generate detailed description with brief description included
        const questionContent6 =
          document.getElementById("sixthQuestion").innerText;
        const newQuestion6 = `${projectData.pdf_text}\n${questionContent6}\n\nHere is the Brief Description of Drawings to reference:\n${briefDescriptionAnswer}`;
        setQuestion6(newQuestion6);
        generateAnswer6WithQuestion(e, newQuestion6);
      }, 500); // Short delay to ensure state update
    } catch (error) {
      console.error("Error generating Brief Description:", error);
      setAnswer5("Failed to generate Brief Description. Please try again.");
    }

    // Eighth section - Abstract
    const questionContent8 =
      document.getElementById("eighthQuestion").innerText;
    const newQuestion8 = `${projectData.pdf_text}\n${questionContent8}`;
    setQuestion8(newQuestion8);
    generateAnswer8WithQuestion(e, newQuestion8);

    // Only generate optional sections if they are visible
    // Tenth section (Alternative Embodiment)
    if (isButton10Visible) {
      const questionContent10 =
        document.getElementById("tenthQuestion").innerText;
      const newQuestion10 = `${projectData.pdf_text}\n${questionContent10}`;
      setQuestion10(newQuestion10);
      generateAnswer10WithQuestion(e, newQuestion10);
    }

    // Eleventh section (Sequence Listing)
    if (isButton11Visible) {
      const questionContent11 =
        document.getElementById("eleventhQuestion").innerText;
      const newQuestion11 = `${projectData.pdf_text}\n${questionContent11}`;
      setQuestion11(newQuestion11);
      generateAnswer11WithQuestion(e, newQuestion11);
    }

    // Twelfth section (Industrial Applicability)
    if (isButton12Visible) {
      const questionContent12 =
        document.getElementById("twelthQuestion").innerText;
      const newQuestion12 = `${projectData.pdf_text}\n${questionContent12}`;
      setQuestion12(newQuestion12);
      generateAnswer12WithQuestion(e, newQuestion12);
    }

    // Thirteenth section (Custom Paragraphs)
    if (isButton13Visible) {
      const questionContent13 =
        document.getElementById("thirteenthQuestion").innerText;
      const newQuestion13 = `${projectData.pdf_text}\n${questionContent13}`;
      setQuestion13(newQuestion13);
      generateAnswer13WithQuestion(e, newQuestion13);
    }

    // Mark that we've generated content once
    setIsFirstGeneration(false);
  }

  useEffect(() => {
    const fetchDraftMaster = async () => {
      const userData = localStorage.getItem("user");
      const projectId = localStorage.getItem("project_id");
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        console.log("Please Login");
        navigate("/");
        return;
      }
      if (!projectId) {
        setError("Project ID not found in localStorage");
        setIsLoading(false);
        return;
      }

      const u_id = user.id;
      setIsLoading(true);

      try {
        // Fetch Project Data first
        const projectResponse = await axios.get("/getProjectData", {
          params: { u_id, project_id: projectId },
        });
        setProjectData(projectResponse.data);
        console.log("Project Data Response:", projectResponse.data);

        // Fetch Draft Master Data using the confirmed project_id
        const confirmedProjectId = String(projectResponse.data.project_id);
        if (confirmedProjectId !== String(projectId)) {
          throw new Error(
            `Project ID mismatch: Expected ${projectId}, got ${confirmedProjectId}`
          );
        }

        const draftMasterResponse = await axios.get("/api/getDraftMaster", {
          params: { project_id: confirmedProjectId },
        });

        if (draftMasterResponse.data) {
          const existingDraftMaster = draftMasterResponse.data;
          setDraftData(existingDraftMaster); // Keep draft data
          setDraftExists(true);

          // Set mandatory answers
          setAnswer(existingDraftMaster.title_of_invention || "");
          setAnswer2(existingDraftMaster.background_of_invention || "");
          setAnswer3(existingDraftMaster.summary_of_invention || "");
          setAnswer4(existingDraftMaster.fields_of_invention || "");
          setAnswer5(existingDraftMaster.brief_description || "");
          setAnswer6(existingDraftMaster.detailed_description || "");
          setAnswer7(existingDraftMaster.claims || "");
          setAnswer8(existingDraftMaster.abstract || "");
          setAnswer9(existingDraftMaster.drawings || ""); // Flowcharts
          setAnswer14(existingDraftMaster.sequence_diagram || ""); // Sequence
          setAnswer15(existingDraftMaster.block_diagram || ""); // Block (Assuming backend field name)

          // Check if brief description exists and mark it as generated
          if (
            existingDraftMaster.brief_description &&
            existingDraftMaster.brief_description.trim() !== ""
          ) {
            setBriefDescriptionGenerated(true);
          }

          // --- Set Optional Answers ---
          const currentAnswer10 = existingDraftMaster.ambodiments || ""; // Alternative Embodiment
          const currentAnswer11 = existingDraftMaster.sequence_listing || "";
          const currentAnswer12 =
            existingDraftMaster.industrial_applicability || "";
          const currentAnswer13 = existingDraftMaster.custom_paragraphs || "";

          setAnswer10(currentAnswer10);
          setAnswer11(currentAnswer11);
          setAnswer12(currentAnswer12);
          setAnswer13(currentAnswer13);

          // --- Initialize Visibility ---
          const visibilityKey =
            getLocalStorageKeyForDraftVisibility(confirmedProjectId);
          const savedVisibility = localStorage.getItem(visibilityKey);

          if (savedVisibility) {
            try {
              const parsedVisibility = JSON.parse(savedVisibility);
              setIsButton10Visible(parsedVisibility.isButton10Visible ?? false); // Use nullish coalescing
              setIsButton11Visible(parsedVisibility.isButton11Visible ?? false);
              setIsButton12Visible(parsedVisibility.isButton12Visible ?? false);
              setIsButton13Visible(parsedVisibility.isButton13Visible ?? false);
              console.log(
                "Loaded visibility from localStorage",
                parsedVisibility
              );
            } catch (e) {
              console.error(
                "Error parsing visibility from localStorage, falling back to content check",
                e
              );
              // Fallback if parsing fails
              setIsButton10Visible(
                !!currentAnswer10 &&
                  currentAnswer10.trim() !== "" &&
                  !(
                    currentAnswer10.includes("<p><br></p>") &&
                    currentAnswer10.length < 20
                  )
              );
              setIsButton11Visible(
                !!currentAnswer11 &&
                  currentAnswer11.trim() !== "" &&
                  !(
                    currentAnswer11.includes("<p><br></p>") &&
                    currentAnswer11.length < 20
                  )
              );
              setIsButton12Visible(
                !!currentAnswer12 &&
                  currentAnswer12.trim() !== "" &&
                  !(
                    currentAnswer12.includes("<p><br></p>") &&
                    currentAnswer12.length < 20
                  )
              );
              setIsButton13Visible(
                !!currentAnswer13 &&
                  currentAnswer13.trim() !== "" &&
                  !(
                    currentAnswer13.includes("<p><br></p>") &&
                    currentAnswer13.length < 20
                  )
              );
            }
          } else {
            // Fallback: if not in local storage, determine visibility based on content
            console.log("No visibility in localStorage, deriving from content");
            setIsButton10Visible(
              !!currentAnswer10 &&
                currentAnswer10.trim() !== "" &&
                !(
                  currentAnswer10.includes("<p><br></p>") &&
                  currentAnswer10.length < 20
                )
            );
            setIsButton11Visible(
              !!currentAnswer11 &&
                currentAnswer11.trim() !== "" &&
                !(
                  currentAnswer11.includes("<p><br></p>") &&
                  currentAnswer11.length < 20
                )
            );
            setIsButton12Visible(
              !!currentAnswer12 &&
                currentAnswer12.trim() !== "" &&
                !(
                  currentAnswer12.includes("<p><br></p>") &&
                  currentAnswer12.length < 20
                )
            );
            setIsButton13Visible(
              !!currentAnswer13 &&
                currentAnswer13.trim() !== "" &&
                !(
                  currentAnswer13.includes("<p><br></p>") &&
                  currentAnswer13.length < 20
                )
            );
          }
        } else {
          console.log("No Draft Master found, ready to create a new one.");
          setDraftExists(false);
          setIsButton10Visible(false);
          setIsButton11Visible(false);
          setIsButton12Visible(false);
          setIsButton13Visible(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          error.response.status === 404 &&
          error.config.url.includes("/api/getDraftMaster")
        ) {
          console.log(
            "No Draft Master found (404), ready to create a new one."
          );

          setDraftExists(false);
          setIsButton10Visible(false);
          setIsButton11Visible(false);
          setIsButton12Visible(false);
          setIsButton13Visible(false);
        } else {
          setError("Failed to fetch data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraftMaster();
  }, [navigate]);

  // ************************

  const handleSubmit = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const projectId = localStorage.getItem("project_id");
    const selectedProject = localStorage.getItem("selectedProject");
    const u_id = userData ? userData.id : null;

    if (!u_id) {
      console.error("User ID is missing.");
      return;
    }

    if (!projectId && !selectedProject) {
      console.error("Project ID is missing.");
      return;
    }

    setIsSaving(true);

    try {
      let formattedSequenceDiagram = answer14 || "";
      if (formattedSequenceDiagram.includes("sequenceDiagram")) {
        const matches =
          formattedSequenceDiagram.match(
            /sequenceDiagram[\s\S]+?(?=\s*sequenceDiagram|$)/g
          ) || [];
        formattedSequenceDiagram = matches.join("\n\n");
      }

      const dataToSend = {
        title_of_invention: answer || "",
        background_of_invention: answer2 || "",
        summary_of_invention: answer3 || "",
        fields_of_invention: answer4 || "",
        brief_description: answer5 || "",
        detailed_description: answer6 || "",
        claims: answer7 || "",
        abstract: answer8 || "",
        drawings: answer9 || "",
        sequence_diagram: formattedSequenceDiagram,
        block_diagram: answer15 || "",
        ambodiments: answer10 || "",
        sequence_listing: answer11 || "",
        industrial_applicability: answer12 || "",
        custom_paragraphs: answer13 || "",
        project_id: projectData?.project_id || projectId || selectedProject,
        u_id,
      };

      const response = await axios.get("/api/getDraftMaster", {
        params: {
          project_id: projectData?.project_id || projectId || selectedProject,
        },
      });

      if (response.data && Object.keys(response.data).length > 0) {
        await axios.post("/api/saveDraftMaster", {
          ...dataToSend,
          _id: response.data._id,
        });
      } else {
        await axios.post("/api/saveDraftMaster", dataToSend);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseConsultModal = () => setShowConsultModal(false);

  return (
    <div className="container-fluid new-padd">
      {isLoading && <div></div>} {/* Loading state */}
      {error && <div style={{ color: "red" }}>{error}</div>}{" "}
      {/* Error message */}
      {projectData && (
        <>
          <h5 className="dash-head" style={{ color: "rgb(0 140 191)" }}>
            Project ID : {projectData.project_id}
          </h5>

          <p style={{ fontSize: "16px" }}>
            <b>DraftMaster</b> Generate a detailed non-provisional patent
            application. with description and claims
          </p>
          <div className="row">
            <div className="col-lg-7 col-md-7 col-sm-12 mar-bott-res ">
              <div
                className="main-content"
                style={{
                  background: "rgb(231, 239, 250)",
                  padding: "15px 5px 30px",
                  borderRadius: "20px",
                  overflowY: "scroll",
                  height: "650px",
                }}
              >
                {/* ****************** */}
                <div>
                  <div
                    className="pdf-text-container"
                    style={{ display: "none" }}
                  >
                    <h2 className="text-xl font-bold">PDF Text Content:</h2>
                    <p id="pdfText" value={pdfText} onChange={handleChange}>
                      {pdfText}
                    </p>
                  </div>

                  <div>
                    <button
                      className="btn-stl-4 w-auto"
                      onClick={() => navigate("/innoCheck?q=draftmaster")}
                      style={{
                        color: "#504f4f",
                      }}
                    >
                      <b style={{ fontSize: "13px", fontWeight: "700" }}>
                        Go to Input
                      </b>
                    </button>
                    {!draftExists && !generateButtonClicked && (
                      <button
                        className="btn-stl-4 w-auto"
                        onClick={handleAllButtonClick}
                        style={{
                          color: "#504f4f",
                        }}
                      >
                        <b style={{ fontSize: "13px", fontWeight: "700" }}>
                          Generate All Fields
                        </b>
                      </button>
                    )}
                  </div>

                  <div
                    className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                    style={{ marginTop: "20px" }}
                  >
                    <h3 style={{ color: "#36718b" }}>Title of the Invention</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      What is the tentative title for your invention?
                    </p> */}
                    <p id="firstQuestion" style={{ display: "none" }}>
                      Provide me the title of the invention of the above
                      provided content. Provided content should only contain the
                      Title of the invention and nothing else.
                      <br />
                      Don't use html word in the answer.
                      <br />
                      Provide me one title of the invention from above provided
                      content & no extra content other that the title is
                      required. Start with a heading of "Title of Invention" in
                      the first line & inside a single pair of h1 tags and the
                      actual title should be in a single pair of p tags.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags & not even single word is written
                      without tag.
                    </p>

                    <div
                      id="firstAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer}
                        onChange={handleChanges1}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for eighth question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>Abstract Of Invention</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      What are the key elements or features of the invention for which legal protection is being sought? Define the scope of protection through clear and specific claims.
                    </p> */}
                    <p id="eighthQuestion" style={{ display: "none" }}>
                      As a legal assistant, draft an 'Abstract' focusing mostly
                      on claim 1. Do not mention any claim numbers or highlight
                      claims directly. Your final output should: - Be max 100
                      words. - Start with: "Concepts and technologies disclosed
                      herein are..."
                      <br />
                      Answer must start with a heading of "Abstract" in h1 tag.
                      <br />
                      Don't use Tables and images in the answer.
                      <br />
                      Don't use html word.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags & not even single word is written
                      without tag. And also give the content with proper heading
                      and ordered list with proper alignment so that it looks
                      good. And the provided content must be left aligned.
                    </p>

                    <div
                      id="eighthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer8}
                        onChange={handleChanges8}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for second question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>
                      Background of the Invention
                    </h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      Please indicate the occasion for making this invention. Describe the
                      general problem statement and which prior art, already known to you
                      that forms the starting of your invention?
                    </p> */}
                    <p id="secondQuestion" style={{ display: "none" }}>
                      As a legal assistant, your task is to draft a 'Background'
                      section for a patent. Your final output should: - Include
                      a 'Background' heading at the top. - The background should
                      be divided into 3-4 paragraphs (no additional headings). -
                      The background should talk about the technology field of
                      the invention and the prior art issues addressed. - Do not
                      disclose the invention's key features. - Limit the final
                      output to a maximum of 350 words.
                      <br />
                      Ensure to give the top heading enclosed within a pair of
                      h1 tags. The following content below that should be
                      enclosed within p tags (one or multiple, as required) and
                      if some other heading or sub-heading has to be there, that
                      should be enclosed within h2 tags. Ensure to not use any
                      other tags in the output.
                    </p>

                    <div
                      id="secondAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer2}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer2}
                        onChange={handleChanges2}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for third question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>Summary Of Invention</h3>
                    {/* <p style={{ fontSize: "18px", display: "none" }}>
                      Summarize the key aspects of the invention. What is its purpose, and
                      how does it solve the problem identified in the background? Highlight
                      the novel features.
                    </p> */}
                    <p id="thirdQuestion" style={{ display: "none" }}>
                      As a legal assistant, your task is to draft a 'Summary'
                      for a patent. Your final output should: - Be a maximum of
                      150 words. Start with a small paragraph of around 50 words
                      that captures the essence followed by several one-liner
                      sentences starting with "Optionally, ...", as used in
                      patents.
                      <br />
                      Don't use html tag or word in the answer.
                      <br />
                      Make sure to use 1 or 2 paragraphs for the summary and no
                      numbered line or anything to be there.
                      <br />
                      Ensure to give the top heading enclosed within a pair of
                      h1 tags. The following content below that should be
                      enclosed within p tags (one or multiple, as required) and
                      if some other heading or sub-heading has to be there, that
                      should be enclosed within h2 tags. Ensure to not use any
                      other tags in the output.
                    </p>

                    <div
                      id="thirdAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      <ReactQuill
                        value={answer3}
                        onChange={handleChanges3}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for fourth question */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>Field of the Invention</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      What is the novel aspect of your invention and how is it solving the
                      drawbacks found in existing prior art?
                    </p> */}
                    <p id="fourthQuestion" style={{ display: "none" }}>
                      As a legal assistant, your task is to draft a "Field of
                      the Invention" section for a patent. Your final output
                      should: - Include a "Field Of The Invention" heading at
                      the top. - Below the heading, there should be a single
                      paragraph (no additional headings) where the technical
                      field or the domain that the invention belongs to is
                      written using multiple lines within the single paragraph
                      only. The paragraph should start like "The invention
                      belongs to...". Limit the final output to a maximum of 80
                      words.
                      <br />
                      Ensure to give the top heading enclosed within a pair of
                      h1 tags. The following content below that should be
                      enclosed within p tags (one or multiple, as required).
                      Ensure to not use any other tags in the output.
                    </p>

                    <div
                      id="fourthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer4}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer4}
                        onChange={handleChanges4}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for seventh question - Claims (moved up in order) */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>Claims Of Invention</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      What are the key elements or features of the invention for which legal protection is being sought? Define the scope of protection through clear and specific claims.
                    </p> */}
                    <p id="seventhQuestion" style={{ display: "none" }}>
                      You are a patent attorney. Your aim is to generate a set
                      of around 8 patent claims for a given invention, including
                      at least one system or method claim (choose whichever is
                      most appropriate).Your final output should have a top
                      heading "Claims" within a pair of h1 tag and post that, 8
                      claims should be there, each within a separate pair of p
                      tag. Also as you know, the independent claims usually have
                      a colon, so that should each be included within a pair of
                      span tag within that particular p tag itself. Some
                      guidelines for patent claim drafting: - Independent claims
                      do not refer to other claims; dependent claims do. - Draft
                      claims that are specific, clear, and concise. - Use
                      'comprises' to maintain inclusivity. - For system claims,
                      define separable elements without mixing them. - Method
                      claims should specify steps capturing the invention's
                      functionality. Limit the total word count to ~300-350
                      words.
                      <br />
                      Don't mention/include any image as you know claims are
                      text-only.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags (h1, p, span) & not even single
                      word is written without tag.
                    </p>

                    <div
                      id="seventhAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer7}
                        onChange={handleChanges7}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for fifth question - Brief Description */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>
                      Brief Description of the Drawings
                    </h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      List and briefly describe each drawing or figure included in the patent application. What does each figure show and how does it relate to the invention?
                    </p> */}
                    <p id="fifthQuestion" style={{ display: "none" }}>
                      As a legal assistant, your task is to draft concise
                      descriptions of patent figures with respective figure
                      numbers, basis the provided invention details. Do any
                      necessary reasoning or brainstorming to understand how the
                      claimed functionality might be illustrated, but do not
                      include this reasoning in your final output. Final output
                      should: Have a heading "Brief Description of the Drawings"
                      in h1 tag pair at the bottom and then the actual figure
                      descriptions. There should be 8-10 figure descriptions, each starting with "Figure X:" and followed by a brief description. - Include reference numerals in parentheses to label key components. For Figure 1 (block diagram), use numerals like (110), (120), (130), etc. For Figure 2 (flow chart), use numerals like (210), (220), (230), etc. For subsequent figures, continue with appropriate numbering (e.g., Figure 3: 310, 320...). - Keep each
                      figure description around 30-40 words. Make sure no
                      component is defined within another component since that's
                      not valid plantuml syntax. Also note that the first figure
                      is to be a block diagram and second to be a flow chart and
                      after that, you can decide. The first two figure
                      descriptions should also be a bit more detailed than
                      others coming later. - Do not mention any claim numbers
                      directly. - Enclose each of the figure descriptions in a
                      separate p tag pair.
                      <br />
                      Ensure to give the top heading enclosed within a pair of
                      h1 tags . The following figure descriptions below should
                      each be enclosed within multiple separate pairs of p tags.
                      Ensure to not use any other tags in the output.
                    </p>

                    <div
                      id="fifthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer5}
                        onChange={handleChanges5}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Adaptive Drawings Progress Bar */}
                  {showDrawingsProgress && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 mt-4">
                      <h3 style={{ color: "#36718b", marginBottom: "15px" }}>
                        Drawings
                      </h3>
                      <div className="loading-container">
                        <div style={{ marginBottom: "10px" }}>
                          {drawingsProgressMessage}
                          <span className="blinking-dots">...</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "20px",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "10px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              width: `${drawingsProgress}%`,
                              height: "100%",
                              backgroundColor:
                                drawingsProgress === 100
                                  ? "#2ecc71"
                                  : "#36718b",
                              borderRadius: "10px",
                              transition: "all 0.5s ease-in-out",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "2px",
                              fontSize: "12px",
                              color: "#666",
                              fontWeight: "bold",
                            }}
                          >
                            {Math.round(drawingsProgress)}%
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: "15px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "25px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "0.95em",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                color: drawingsGenerationStatus.flowchart
                                  ? "#2ecc71"
                                  : "#999",
                                marginRight: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                              }}
                            >
                              {drawingsGenerationStatus.flowchart ? "✓" : "○"}
                            </span>
                            <span
                              style={{
                                color: drawingsGenerationStatus.flowchart
                                  ? "#2ecc71"
                                  : "#666",
                              }}
                            >
                              Flow Chart
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "0.95em",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                color: drawingsGenerationStatus.blockDiagram
                                  ? "#2ecc71"
                                  : "#999",
                                marginRight: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                              }}
                            >
                              {drawingsGenerationStatus.blockDiagram
                                ? "✓"
                                : "○"}
                            </span>
                            <span
                              style={{
                                color: drawingsGenerationStatus.blockDiagram
                                  ? "#2ecc71"
                                  : "#666",
                              }}
                            >
                              Block Diagram
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Diagrams Gallery - Show when progress is complete */}
                  {!showDrawingsProgress && extractedDiagrams.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 mt-4">
                      <DiagramGallery
                        diagrams={extractedDiagrams}
                        title="Drawings"
                      />
                    </div>
                  )}

                  {/* Add a fallback message if no diagrams exist */}
                  {extractedDiagrams.length === 0 &&
                    flowchartUml &&
                    blockDiagramUml && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 mt-4">
                        <h3 style={{ color: "#36718b" }}>Diagrams</h3>
                        <p>
                          Diagrams were processed but could not be rendered.
                          Please check console logs.
                        </p>
                      </div>
                    )}

                  {/* Keep the fallback slider in case something goes wrong */}
                  {!(flowchartUml || blockDiagramUml) && (
                    <Slider {...settings}></Slider>
                  )}

                  {/* Example structure for sixth question - Detailed Description (moved to the end) */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                    <h3 style={{ color: "#36718b" }}>
                      Detailed Description of the Invention
                    </h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      Provide a comprehensive description of the invention. What are the components or steps involved? How does each part work? Use references to any relevant drawings to explain the invention in detail
                    </p> */}
                    <p id="sixthQuestion" style={{ display: "none" }}>
                      As a legal assistant, create a 'Detailed Description' to
                      support the given claims and the invention. Do any
                      necessary reasoning or brainstorming but exclude it from
                      the final output. Your final output should: - Provide a
                      thorough explanation in at least 800 words, focusing on
                      quality. - Start with 'Detailed Description' (no
                      additional headings). - Explain the invention in 7-8 paragraphs wherein you refer to the 2 figures as well one by one explaining the components and/or steps of the figures to explain the invention like a patent draft does. Use the exact reference numerals from the Brief Description (e.g., components 110, 120, 130 for Figure 1; steps 210, 220, 230 for Figure 2)
                      and also elaborate on the invention embodiments. Make sure
                      to be highly accurate. - Do not reference claim numbers
                      directly.
                      <br />
                      Answer must start with a heading of "Detailed Description"
                      in h1 tag.
                      <br />
                      Don't use Tables and images in the answer.
                      <br />
                      Don't use html word.
                      <br />
                      Provide a comprehensive description of the invention. How
                      does it work? What are its components or steps? Refer to
                      any drawings where necessary, explaining each part in
                      detail.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags & not even single word is written
                      without tag. And also give the content with proper heading
                      and ordered list with proper alignment so that it looks
                      good. And the provided content must be left aligned.
                    </p>

                    <div
                      id="sixthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer6}
                        onChange={handleChanges6}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Hidden elements that provide data but aren't visually displayed */}
                  <div style={{ display: "none" }}>
                    {/* Example structure for ninth question - Flowchart */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                      <h3 style={{ color: "#36718b" }}>Drawings</h3>
                      <p id="ninthQuestion" style={{ display: "none" }}>
                        Create a PlantUML activity diagram syntax based on the
                        invention description and required flow description.
                        Your diagram MUST begin with @startuml on its own line
                        and end with @enduml on its own line. DO NOT include any
                        other text, HTML tags, or code blocks (like
                        ```plantuml). Do not include any formatting - just the
                        raw PlantUML code. The diagram should clearly illustrate
                        the inventive process in a sequential, step-by-step
                        manner with 5–7 activity nodes. Each activity node
                        should start with : and end with ;, containing precisely
                        around 3 words, succinctly describing each invention
                        step. Each activity node must be labeled as :Step 210: [action];, :Step 220: [action];, :Step 230: [action]; and continue similarly, matching the reference numerals from the brief description. Always
                        begin the activity diagram explicitly using the keyword
                        start on its own line and end using the keyword stop on
                        its own line. If conditional logic is needed based on
                        invention description, accurately utilize the PlantUML
                        conditional keywords like if, then, else, and endif—with
                        short, precise labels in parentheses. If repetitive or
                        iterative steps are described, use PlantUML's concise
                        loop structures (repeat, repeat while, while, endwhile)
                        strictly following syntax conventions. One PlantUML
                        statement per physical line. Do not use inline comments
                        (' text …) or directional arrow shortcuts. • Each
                        PlantUML keyword (if, then, else, endif) must be on its
                        own line. Output ONLY the raw PlantUML syntax including
                        the @startuml and @enduml tags without any explanations,
                        markdown formatting, HTML tags or additional text.
                      </p>
                      <div id="ninthAnswer" style={{ display: "none" }}>
                        <ReactQuill
                          value={answer9}
                          onChange={handleChanges9}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for fifteenth question - Block Diagram */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                      <h3 style={{ color: "#36718b" }}>Block Diagrams</h3>
                      <p id="fifteenthQuestion" style={{ display: "none" }}>
                        Generate a PlantUML Component Diagram based on the
                        invention description and block diagram description.
                        Your diagram MUST begin with @startuml on its own line
                        and end with @enduml on its own line. DO NOT include any
                        other text, HTML tags, or code blocks (like
                        ```plantuml). Do not include any formatting - just the
                        raw PlantUML code. Include 5–7 components (or as needed)
                        showing only the inventive system, not prior art. Use
                        proper PlantUML syntax with [ComponentName] or component
                        keyword. Number components as [Component 110], [Component 120], [Component 130], etc., matching the reference numerals from the brief description. Connect
                        components using arrows to show relationships or
                        interactions. Use simple alphanumeric labels without
                        special characters or extra punctuation. If interfaces
                        are needed, use () or interface. One PlantUML statement
                        per physical line. Do not use inline comments (' text …)
                        or directional arrow shortcuts. Finish each component
                        declaration on the same line (close ] before newline).
                        Never put two component declarations on one line. Do not
                        add inline comments beginning with ' . Keep the layout
                        clean and top-down or left-to-right as suitable.
                        Optional grouping using package, node, or cloud is
                        allowed if relevant. Output ONLY the raw PlantUML code
                        including the @startuml and @enduml tags, with no
                        explanations or additional text.
                      </p>
                      <div id="fifteenthAnswer" style={{ display: "none" }}>
                        <ReactQuill
                          value={answer15}
                          onChange={handleChanges15}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Sequence diagram remains hidden and unused */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                      <h3 style={{ color: "#36718b" }}>Sequence Drawings</h3>
                      <p id="fourteenthQuestion" style={{ display: "none" }}>
                        Create two Mermaid sequence diagrams to illustrate
                        distinct interaction scenarios from the given invention
                        disclosure. Each sequence diagram must start with
                        'sequenceDiagram' followed by participant declarations
                        and interaction messages using correct Mermaid syntax
                        (e.g., 'participant A' and 'A-&gt;&gt;B: "Message"').
                        The diagrams should clearly depict the inventive process
                        interactions, excluding prior art. Use simple,
                        alphanumeric participant names without special
                        characters (e.g., 'SnCl2_2H2O' instead of 'SnCl2.2H2O')
                        to ensure clean syntax. Enclose messages with spaces in
                        double quotes (e.g., 'A-&gt;&gt;B: "Do something"'). Try
                        to make small and essential sequence diagrams, no
                        unnecessary steps and keep only the inventive main
                        steps.
                        <br />
                        The output must be pure Mermaid code—starting directly
                        with 'sequenceDiagram' for each diagram—with no
                        introductory text, explanations, headings, triple
                        backticks, or the word 'mermaid'. Try to make small
                        sequence diagrams. Separate the two diagrams with a
                        single blank line.
                      </p>
                      <div id="fourteenthAnswer" style={{ display: "none" }}>
                        <ReactQuill
                          value={answer14}
                          onChange={handleChanges14}
                          modules={modules}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Example structure for tenth question */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                    style={{ display: isButton10Visible ? "block" : "none" }}
                  >
                    <h3 style={{ color: "#36718b" }}>Alternative Embodiment</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                      What is the Alternative Embodiment for your invention?
                    </p> */}
                    <p id="tenthQuestion" style={{ display: "none" }}>
                      Provide me the Alternative Embodiment of the above
                      provided content. Provided content should only contain the
                      Alternative Embodiment and nothing else.
                      <br />
                      Don't use html word in the answer.
                      <br />
                      Provide me Alternative Embodiment from above provided
                      content & no extra content other that the Alternative
                      Embodiment is required. Start with a heading of
                      "Alternative Embodiment" in the first line & inside h1
                      tag.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags & not even single word is written
                      without tag. And also give the content with proper heading
                      and ordered list with proper alignment so that it looks
                      good. And provided text must align to the left side. And
                      the provided content must be left aligned.
                    </p>

                    <div
                      id="tenthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer10}
                        onChange={handleChanges10}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for eleventh question */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                    style={{ display: isButton11Visible ? "block" : "none" }}
                  >
                    <h3 style={{ color: "#36718b" }}>Sequence Listing</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                  What is the Sequence Listing for your invention?
                </p> */}
                    <p id="eleventhQuestion" style={{ display: "none" }}>
                      Just Provide me heading of "Sequence Listing" in the first
                      line & inside h1 tag. And not even a single word other
                      that this is required.
                    </p>

                    <div
                      id="eleventhAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer11}
                        onChange={handleChanges11}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for twelth question */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                    style={{ display: isButton12Visible ? "block" : "none" }}
                  >
                    <h3 style={{ color: "#36718b" }}>
                      Industrial Applicability
                    </h3>
                    {/* <p style={{ fontSize: "18px" }}>
                  What is the Industrial Applicability for your invention?
                </p> */}
                    <p id="twelthQuestion" style={{ display: "none" }}>
                      Provide me the Industrial Applicability of the above
                      provided content. Provided content should only contain the
                      Industrial Applicability and nothing else.
                      <br />
                      Don't use html word in the answer.
                      <br />
                      Provide me Industrial Applicability from above provided
                      content & no extra content other that the Industrial
                      Applicability is required. Start with a heading of
                      "Industrial Applicability" in the first line & inside h1
                      tag.
                      <br />
                      And provided content should only give complete answer
                      using proper html tags & not even single word is written
                      without tag. And also give the content with proper heading
                      and ordered list with proper alignment so that it looks
                      good. And provided text must align to the left side. And
                      the provided content must be left aligned.
                    </p>

                    <div
                      id="twelthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer12}
                        onChange={handleChanges12}
                        modules={modules}
                      />
                    </div>
                  </div>

                  {/* Example structure for thirteenth question */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                    style={{ display: isButton13Visible ? "block" : "none" }}
                  >
                    <h3 style={{ color: "#36718b" }}>Custom Paragraphs</h3>
                    {/* <p style={{ fontSize: "18px" }}>
                  What is the Industrial Applicability for your invention?
                </p> */}
                    <p id="thirteenthQuestion" style={{ display: "none" }}>
                      Just Provide me heading of "Custom Paragraphs" in the
                      first line & inside h1 tag. And not even a single word
                      other that this is required.
                    </p>

                    <div
                      id="thirteenthAnswer"
                      style={{ borderRadius: "15px" }}
                      className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                    >
                      {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                      <ReactQuill
                        value={answer13}
                        onChange={handleChanges13}
                        modules={modules}
                      />
                    </div>
                  </div>
                </div>
                {/* ************************ */}
                <div id="PatentDrafting">
                  <ReactQuill
                    ref={quillRef}
                    value={editorContent}
                    onChange={handleChangeNew}
                    modules={modules}
                    style={{ display: "none" }}
                  />
                  {/* <button
                className="btn btn-success"
                onClick={handleDownload4}
                style={{
                  margin: "10px",
                  padding: "5px",
                  width: "200px",
                }}
              >
                Download as DOCX
              </button>  */}
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-5 col-sm-12">
              <div>
                <h6 style={{ color: "#008CBF" }}>
                  1 - Options to refine the Non-Provisional Draft
                </h6>
                <div className="d-flex align-items-center justify-content-start flex-wrap">
                  <form onSubmit={generateAnswer} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button1"
                      onClick={handleButtonClick}
                      type="submit"
                      className="btn-stl-3 w-auto h-auto"
                      disabled={generatingAnswer}
                    >
                      <b>Regenerate - </b>Title Of Invention
                    </button>
                  </form>

                  <form onSubmit={generateAnswer8} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question8}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button8"
                      onClick={handleButtonClick8}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer8}
                    >
                      <b>Regenerate - </b>Abstract
                    </button>
                  </form>

                  <form onSubmit={generateAnswer2} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question2}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button2"
                      onClick={handleButtonClick2}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer2}
                    >
                      <b>Regenerate - </b>Background of Invention
                    </button>
                  </form>

                  <form onSubmit={generateAnswer3} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question3}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button3"
                      onClick={handleButtonClick3}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer3}
                    >
                      <b>Regenerate - </b>Summary of Invention
                    </button>
                  </form>

                  <form onSubmit={generateAnswer4} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question4}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button4"
                      onClick={handleButtonClick4}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer4}
                    >
                      <b>Regenerate - </b>Fields of the Invention
                    </button>
                  </form>

                  <form onSubmit={generateAnswer7} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question7}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button7"
                      onClick={handleButtonClick7}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer7}
                    >
                      <b>Regenerate - </b>Claims
                    </button>
                  </form>

                  <form onSubmit={generateAnswer5} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question5}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button5"
                      onClick={handleButtonClick5}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer5 || briefDescriptionGenerated}
                      title={
                        briefDescriptionGenerated
                          ? "Brief Description can only be generated once"
                          : ""
                      }
                      style={{
                        opacity: briefDescriptionGenerated ? 0.5 : 1,
                        cursor: briefDescriptionGenerated
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      <b>Regenerate - </b>Brief Description
                      {briefDescriptionGenerated && " ⓘ"}
                    </button>
                  </form>

                  <form onSubmit={generateAnswer9} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question9}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button9"
                      onClick={handleButtonClick9}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer9}
                    >
                      <b>Regenerate - </b>FlowCharts
                    </button>
                  </form>

                  <form
                    onSubmit={generateAnswer15}
                    style={{ display: "block" }}
                  >
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question15}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button15"
                      onClick={handleButtonClick15}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer15}
                    >
                      <b>Regenerate - </b>Block Diagram
                    </button>
                  </form>

                  <form onSubmit={generateAnswer6} style={{ display: "block" }}>
                    <textarea
                      id="passQuery"
                      required
                      className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
                      value={question6}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything"
                      style={{ display: "none" }}
                    ></textarea>
                    <button
                      id="button6"
                      onClick={handleButtonClick6}
                      type="submit"
                      className="btn-stl-3 w-auto"
                      disabled={generatingAnswer6}
                    >
                      <b>Regenerate - </b>Detailed Description
                    </button>
                  </form>

                  {isButton10Visible && (
                    <form
                      onSubmit={generateAnswer10}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* hidden */ style={{ display: "none" }}
                      ></textarea>
                      <button
                        id="button10"
                        onClick={(e) => {
                          e.preventDefault();
                          generateAnswer10(e);
                        }} // Simplified onClick if form handles submit
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer10}
                      >
                        <b>Regenerate - </b>Embodiment
                      </button>
                    </form>
                  )}
                  {isButton11Visible && (
                    <form
                      onSubmit={generateAnswer11}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* hidden */ style={{ display: "none" }}
                      ></textarea>
                      <button
                        id="button11"
                        onClick={(e) => {
                          e.preventDefault();
                          generateAnswer11(e);
                        }}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer11}
                      >
                        <b>Regenerate - </b>Sequence Listing
                      </button>
                    </form>
                  )}
                  {isButton12Visible && (
                    <form
                      onSubmit={generateAnswer12}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* hidden */ style={{ display: "none" }}
                      ></textarea>
                      <button
                        id="button12"
                        onClick={(e) => {
                          e.preventDefault();
                          generateAnswer12(e);
                        }}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer12}
                      >
                        <b>Regenerate - </b>Industrial Applicability
                      </button>
                    </form>
                  )}
                  {isButton13Visible && (
                    <form
                      onSubmit={generateAnswer13}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* hidden */ style={{ display: "none" }}
                      ></textarea>
                      <button
                        id="button13"
                        onClick={(e) => {
                          e.preventDefault();
                          generateAnswer13(e);
                        }}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer13}
                      >
                        <b>Regenerate - </b>Custom Paragraphs
                      </button>
                    </form>
                  )}
                </div>

                <h6 className="mt-5" style={{ color: "#008CBF" }}>
                  2- Options to add new sections
                </h6>
                <div className="d-flex align-items-center justify-content-start flex-wrap">
                  <button
                    id="add-btn-10" // Changed ID for clarity
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick10(e)} // Use correct handler
                    style={{
                      background: isButton10Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)" // Reddish gradient for Remove
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)", // Original for Add
                    }}
                  >
                    <b>{isButton10Visible ? "Remove - " : "Add - "}</b>
                    Alternative Embodiments
                  </button>

                  <button
                    id="add-btn-11" // Changed ID
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick11(e)} // Use correct handler
                    style={{
                      background: isButton11Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton11Visible ? "Remove - " : "Add - "}</b>Sequence
                    Listing
                  </button>
                  <button
                    id="add-btn-12" // Changed ID
                    className="btn-stl-3 w-auto"
                    onClick={(e) => handleToggleButtonClick12(e)} // Use correct handler
                    style={{
                      background: isButton12Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton12Visible ? "Remove - " : "Add - "}</b>
                    Industrial Applicability
                  </button>
                  <button
                    id="add-btn-13" // Changed ID
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick13(e)} // Use correct handler
                    style={{
                      background: isButton13Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton13Visible ? "Remove - " : "Add - "}</b>Custom
                    Paragraphs
                  </button>
                </div>

                <h6 className="mt-5" style={{ color: "#008CBF" }}>
                  3- Select your next action
                </h6>
                <div className="d-flex align-items-center justify-content-start flex-wrap">
                  <button onClick={handlePrint6} className="btn-stl-4 w-auto">
                    View Non-Provisio Draft
                  </button>

                  <div className="relative">
                    <button
                      ref={triggerRef}
                      className="btn-stl-4 w-auto"
                      onClick={() =>
                        setShowDownloadOptions(!showDownloadOptions)
                      }
                    >
                      <span>Download Non-Provisional Draft</span>
                      <span className="ms-1">▼</span>
                    </button>

                    {showDownloadOptions && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: "absolute",
                          zIndex: 50,
                          backgroundColor: "white",
                          borderRadius: "8px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e2e8f0",
                          marginTop: "2px",
                          width: "70px", // Compact width for icon-only menu
                        }}
                      >
                        <ul
                          style={{ paddingLeft: "0rem", marginBottom: "0rem" }}
                        >
                          <li
                            onClick={() => {
                              handlePrint4();
                              setShowDownloadOptions(false);
                            }}
                            style={{
                              padding: "12px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderBottom: "1px solid #edf2f7",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f7fafc")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="Download as PDF"
                          >
                            <FaFilePdf
                              style={{ color: "#e53e3e", fontSize: "20px" }}
                            />
                          </li>
                          <li
                            onClick={() => {
                              handleDownload4();
                              setShowDownloadOptions(false);
                            }}
                            style={{
                              padding: "12px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f7fafc")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="Download as DOCX"
                          >
                            <FaFileWord
                              style={{ color: "#2b6cb0", fontSize: "20px" }}
                            />
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* <button className="btn-stl-4 w-auto">
                    GENERATE NON-PROVISIONAL DRAFT
                  </button> */}

                  {/* --- NEW BUTTON --- */}
                  <button
                    className="btn-stl-4 w-auto"
                    onClick={() => setShowConsultModal(true)} // <--- Open modal on click
                  >
                    Collab with anovIP
                  </button>
                  {/* --- END NEW BUTTON --- */}
                </div>
              </div>
            </div>
          </div>
          {/* --- Render Modal --- */}
          <Consult
            show={showConsultModal}
            handleClose={handleCloseConsultModal}
          />
          {/* --- End Render Modal --- */}
        </>
      )}
    </div>
  );
};

export default ContentDraft;
