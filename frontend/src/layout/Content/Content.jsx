import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Content.css";
import { useNavigate, useBlocker } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import Consult from "../../components/shared/Consult";
import { useToast } from "../../context/ToastContext";

// **********************
// Import the utility function at the top of your file
import { formatForQuill } from "../../utils/formatUtils";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { FaFilePdf, FaFileWord, FaDownload } from "react-icons/fa";

// ********************

const Content = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [generateButtonClicked, setGenerateButtonClicked] = useState(false);
  const [response, setResponse] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
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

  // Block Navigation starts
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
      generatingAnswer11;
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

  // Block Navigation ends

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

  const [pdfText, setPdfText] = useState("");
  const [draftData, setDraftData] = useState(null);
  const [draftExists, setDraftExists] = useState(false); // New state
  const [error, setError] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = React.createRef();
  const [projectData, setProjectData] = useState(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  // ******************
  const [isButton7Visible, setIsButton7Visible] = useState(false);
  const [isButton8Visible, setIsButton8Visible] = useState(false);
  const [isButton9Visible, setIsButton9Visible] = useState(false);
  const [isButton10Visible, setIsButton10Visible] = useState(false);
  const [isButton11Visible, setIsButton11Visible] = useState(false);

  // *******************************
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

  // ****************************

  // *******************
  const getLocalStorageKeyForVisibility = (projectId) => {
    return `provisioDraft_sectionVisibility_${projectId}`;
  };

  // EFFECT: Load section visibility from localStorage on projectData load
  useEffect(() => {
    if (projectData && projectData.project_id) {
      const visibilityKey = getLocalStorageKeyForVisibility(
        projectData.project_id
      );
      const savedVisibility = localStorage.getItem(visibilityKey);
      if (savedVisibility) {
        try {
          const parsedVisibility = JSON.parse(savedVisibility);
          setIsButton7Visible(parsedVisibility.isButton7Visible || false);
          setIsButton8Visible(parsedVisibility.isButton8Visible || false);
          setIsButton9Visible(parsedVisibility.isButton9Visible || false);
          setIsButton10Visible(parsedVisibility.isButton10Visible || false);
          setIsButton11Visible(parsedVisibility.isButton11Visible || false);
          console.log(
            "Loaded section visibility from localStorage:",
            parsedVisibility
          );
        } catch (err) {
          console.error(
            "Failed to parse section visibility from localStorage",
            err
          );
        }
      } else {
        // If not in localStorage, derive initial visibility from fetched draft content
        // This part is now handled within fetchProvisionDraft after setting draftData
        console.log(
          "No section visibility in localStorage, will derive from draft content."
        );
      }
    }
  }, [projectData]);

  // EFFECT: Save section visibility to localStorage when they change
  useEffect(() => {
    if (projectData && projectData.project_id) {
      const visibilityKey = getLocalStorageKeyForVisibility(
        projectData.project_id
      );
      const visibilityState = {
        isButton7Visible,
        isButton8Visible,
        isButton9Visible,
        isButton10Visible,
        isButton11Visible,
      };
      localStorage.setItem(visibilityKey, JSON.stringify(visibilityState));
      // console.log("Saved section visibility to localStorage:", visibilityState);
    }
  }, [
    isButton7Visible,
    isButton8Visible,
    isButton9Visible,
    isButton10Visible,
    isButton11Visible,
    projectData, // Add projectData dependency
  ]);

  // **********************

  const ensurePrerequisitesAndGenerate = async (
    answerNum,
    setAnswerFunc,
    setJustGeneratedFunc,
    questionId,
    generateFunc,
    sectionName,
    event
  ) => {
    if (!projectData || !projectData.pdf_text) {
      console.warn(
        `generateAnswer${answerNum}: projectData or pdf_text is missing for ${sectionName}.`
      );
      setAnswerFunc(
        `<h1>${sectionName}</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>`
      );
      setJustGeneratedFunc(true);
      return false;
    }
    const questionContentElement = document.getElementById(questionId);
    if (!questionContentElement) {
      console.warn(
        `generateAnswer${answerNum}: Question element '${questionId}' not found for ${sectionName}.`
      );
      setAnswerFunc(
        `<h1>${sectionName}</h1><p>Failed to generate: Internal configuration error (missing question element for ${sectionName}).</p>`
      );
      setJustGeneratedFunc(true);
      return false;
    }
    await generateFunc(event); // Call the original generateAnswerX function
    return true;
  };

  // **************************

  const handleToggleButtonClick7 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton7Visible;
    setIsButton7Visible(!currentlyVisible);

    if (!currentlyVisible) {
      // If it was NOT visible, and now we're making it visible (Add action)
      console.log("Add - Embodiments clicked.");
      if (
        !answer7 ||
        answer7.trim() === "" ||
        (answer7.includes("<p><br></p>") && answer7.length < 20)
      ) {
        // Check if content is effectively empty
        console.log("Auto-generating Embodiments...");
        await generateAnswer7(e);
      } else {
        console.log("Embodiments already has content, just showing.");
      }
    } else {
      // If it WAS visible, and now we're hiding it (Remove action)
      console.log("Remove - Embodiments clicked.");
      // Content removal from editor is handled by the main editorContent useEffect
    }
  };

  const handleToggleButtonClick8 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton8Visible;
    setIsButton8Visible(!currentlyVisible);

    if (!currentlyVisible) {
      console.log("Add - Few Claims clicked.");
      if (
        !answer8 ||
        answer8.trim() === "" ||
        (answer8.includes("<p><br></p>") && answer8.length < 20)
      ) {
        console.log("Auto-generating Few Claims...");
        await generateAnswer8(e);
      } else {
        console.log("Few Claims already has content, just showing.");
      }
    } else {
      console.log("Remove - Few Claims clicked.");
    }
  };

  const handleToggleButtonClick9 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton9Visible;
    setIsButton9Visible(!currentlyVisible);

    if (!currentlyVisible) {
      console.log("Add - Key Features clicked.");
      if (
        !answer9 ||
        answer9.trim() === "" ||
        (answer9.includes("<p><br></p>") && answer9.length < 20)
      ) {
        console.log("Auto-generating Key Features...");
        await generateAnswer9(e);
      } else {
        console.log("Key Features already has content, just showing.");
      }
    } else {
      console.log("Remove - Key Features clicked.");
    }
  };

  const handleToggleButtonClick10 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton10Visible;
    setIsButton10Visible(!currentlyVisible);

    if (!currentlyVisible) {
      console.log("Add - Abstract clicked.");
      if (
        !answer10 ||
        answer10.trim() === "" ||
        (answer10.includes("<p><br></p>") && answer10.length < 20)
      ) {
        console.log("Auto-generating Abstract...");
        await generateAnswer10(e);
      } else {
        console.log("Abstract already has content, just showing.");
      }
    } else {
      console.log("Remove - Abstract clicked.");
    }
  };

  const handleToggleButtonClick11 = async (e) => {
    e.preventDefault();
    const currentlyVisible = isButton11Visible;
    setIsButton11Visible(!currentlyVisible);

    if (!currentlyVisible) {
      console.log("Add - Custom Paragraph clicked.");
      if (
        !answer11 ||
        answer11.trim() === "" ||
        (answer11.includes("<p><br></p>") && answer11.length < 20)
      ) {
        console.log("Auto-generating Custom Paragraph...");
        await generateAnswer11(e);
      } else {
        console.log("Custom Paragraph already has content, just showing.");
      }
    } else {
      console.log("Remove - Custom Paragraph clicked.");
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // **********************

  // *********************New Code start************

  useEffect(() => {
    if (answer || answer2 || answer3 || answer4 || answer5 || answer6) {
      setEditorContent(
        `${answer}\n\n${answer2}\n\n${answer3}\n\n${answer4}\n\n${answer5}\n\n${answer6}` +
          `${isButton7Visible && answer7 ? "\n\n" + answer7 : ""}` +
          `${isButton8Visible && answer8 ? "\n\n" + answer8 : ""}` +
          `${isButton9Visible && answer9 ? "\n\n" + answer9 : ""}` +
          `${isButton10Visible && answer10 ? "\n\n" + answer10 : ""}` +
          `${isButton11Visible && answer11 ? "\n\n" + answer11 : ""}`
      );
    }
  }, [
    answer,
    answer2,
    answer3,
    answer4,
    answer5,
    answer6,
    answer7,
    answer8,
    answer9,
    answer10,
    answer11,
    isButton7Visible,
    isButton8Visible,
    isButton9Visible,
    isButton10Visible,
    isButton11Visible,
  ]);

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
    const buttonClickedStatus = localStorage.getItem(
      "generateButtonClicked_provisio"
    );
    if (buttonClickedStatus === "true") {
      setGenerateButtonClicked(true);
    }
  }, []);

  useEffect(() => {
    if (justGenerated11) {
      handleSubmit();
      setJustGenerated11(false);
    }
  }, [justGenerated11]);

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
    const interval = setInterval(() => {
      setReloadFlag((prev) => !prev); // Toggle the flag to trigger re-render
    }, 2000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const handleChangeNew = (html) => {
    setEditorContent(html);
  };

  // ***********************
  const handleDownloadDocx = () => {
    try {
      const quill = quillRef.current.getEditor();
      const textContent = quill.getText();

      // Split content by newlines and filter out empty lines
      const lines = textContent
        .split("\n")
        .filter((line) => line.trim() !== "");

      // Array to store all document paragraphs
      const paragraphs = [];

      // Process each line to identify headings and apply proper formatting
      lines.forEach((line) => {
        // Check if line is a heading
        const isHeading =
          /^(Title of Invention|Background|Summary|Field|Detailed Description|Advantages|Claims|Abstract|Embodiments|Key Features|Custom Paragraph)/i.test(
            line
          );

        // Create paragraph with appropriate styling
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: isHeading,
                size: isHeading ? 32 : 24, // Make headings larger
                color: "000000", // Ensure black color for all text including headings
              }),
            ],
            spacing: {
              before: isHeading ? 400 : 200, // More space before headings
              after: isHeading ? 200 : 100, // Space after paragraphs
            },
            // Remove heading: 'Heading1' to avoid default Word styling
          })
        );

        // If it's a heading, add an empty paragraph after it for better spacing
        if (isHeading) {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 200 },
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      // Pack the document and trigger download
      Packer.toBlob(doc)
        .then((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `provisionalDraft-${projectData.project_id}.docx`;
          link.click();
          setShowDownloadOptions(false); // Close dropdown after download
        })
        .catch((error) => {
          console.error("Error creating DOCX file:", error);
          console.log(
            "There was an error creating the DOCX file. Please try again."
          );
        });
    } catch (error) {
      console.error("Error in handleDownloadDocx:", error);
      console.log("There was an error during download. Please try again.");
    }
  };

  const handlePrintPdf = () => {
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
    setShowDownloadOptions(false); // Close dropdown after initiating download
  };
  // **********************

  // const handlePrint4 = () => {
  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.write(`
  //               <html>
  //                   <head>
  //                       <title>Patent Draft</title>
  //                       <style>
  //                           body { font-family: Arial, sans-serif; }
  //                       </style>
  //                   </head>
  //                   <body>${editorContent}</body>
  //               </html>
  //           `);
  //   printWindow.document.close();
  //   setTimeout(() => {
  //     printWindow.print();
  //   }, 2000);
  // };

  const handlePrint5 = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
                <html>
                    <head>
                        <title>Patent Draft</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px 40px; background-color: #f6f6ff; }
                        </style>
                    </head>
                    <body>${editorContent}</body>
                </html>
            `);
    printWindow.document.close();
  };

  // Example function to update pdfText
  const handleChange = (event) => {
    setPdfText(event.target.value);
  };

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
  // *************

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
      setJustGenerated(true); // Trigger auto-save
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
      setJustGenerated2(true); // Trigger auto-save
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
      setJustGenerated3(true); // Trigger auto-save
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
      setJustGenerated4(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setAnswer4("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer4(false);
  }

  async function generateAnswer5WithQuestion(e, questionText) {
    setGeneratingAnswer5(true);
    e.preventDefault();
    setAnswer5("Generating Answer... Wait for a while...");
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
      setAnswer5(formatForQuill(generatedAnswer));
      setJustGenerated5(true); // Trigger auto-save
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
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer6(formatForQuill(generatedAnswer));
      setJustGenerated6(true); // Trigger auto-save
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
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer7(formatForQuill(generatedAnswer));
      setJustGenerated7(true); // Trigger auto-save
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
      setJustGenerated8(true); // Trigger auto-save
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
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionText }] }],
        },
      });

      const generatedAnswer =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer9(formatForQuill(generatedAnswer));
      setJustGenerated9(true); // Trigger auto-save
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
      setJustGenerated10(true); // Trigger auto-save
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
      setJustGenerated11(true); // Trigger auto-save
    } catch (error) {
      console.log(error);
      setAnswer11("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer11(false);
  }

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
    e.preventDefault(); // Prevent default for the event that triggered this
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer7: projectData or pdf_text is missing.");
      setAnswer7(
        "<h1>Embodiments</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>"
      );
      setJustGenerated7(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContentElement = document.getElementById("seventhQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer7: Question element 'seventhQuestion' not found."
      );
      setAnswer7(
        "<h1>Embodiments</h1><p>Failed to generate: Internal configuration error (missing question element).</p>"
      );
      setJustGenerated7(true);
      return;
    }
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion7(newQuestion);
    await generateAnswer7WithQuestion(e, newQuestion);
  }

  async function generateAnswer8(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer8: projectData or pdf_text is missing.");
      setAnswer8(
        "<h1>Few Claims</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>"
      );
      setJustGenerated8(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContentElement = document.getElementById("eighthQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer8: Question element 'eighthQuestion' not found."
      );
      setAnswer8(
        "<h1>Few Claims</h1><p>Failed to generate: Internal configuration error (missing question element).</p>"
      );
      setJustGenerated8(true);
      return;
    }
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion8(newQuestion);
    await generateAnswer8WithQuestion(e, newQuestion);
  }

  async function generateAnswer9(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer9: projectData or pdf_text is missing.");
      setAnswer9(
        "<h1>Key Features</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>"
      );
      setJustGenerated9(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContentElement = document.getElementById("ninthQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer9: Question element 'ninthQuestion' not found."
      );
      setAnswer9(
        "<h1>Key Features</h1><p>Failed to generate: Internal configuration error (missing question element).</p>"
      );
      setJustGenerated9(true);
      return;
    }
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion9(newQuestion);
    await generateAnswer9WithQuestion(e, newQuestion);
  }

  async function generateAnswer10(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer10: projectData or pdf_text is missing.");
      setAnswer10(
        "<h1>Abstract</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>"
      );
      setJustGenerated10(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContentElement = document.getElementById("tenthQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer10: Question element 'tenthQuestion' not found."
      );
      setAnswer10(
        "<h1>Abstract</h1><p>Failed to generate: Internal configuration error (missing question element).</p>"
      );
      setJustGenerated10(true);
      return;
    }
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion10(newQuestion);
    await generateAnswer10WithQuestion(e, newQuestion);
  }

  async function generateAnswer11(e) {
    e.preventDefault();
    if (!projectData || !projectData.pdf_text) {
      console.warn("generateAnswer11: projectData or pdf_text is missing.");
      setAnswer11(
        "<h1>Custom Paragraph</h1><p>Failed to generate: Project data not available. Please ensure the base document is loaded.</p>"
      );
      setJustGenerated11(true);
      return;
    }
    const pdfContent = projectData.pdf_text;
    const questionContentElement = document.getElementById("eleventhQuestion");
    if (!questionContentElement) {
      console.warn(
        "generateAnswer11: Question element 'eleventhQuestion' not found."
      );
      setAnswer11(
        "<h1>Custom Paragraph</h1><p>Failed to generate: Internal configuration error (missing question element).</p>"
      );
      setJustGenerated11(true);
      return;
    }
    const questionContent = questionContentElement.innerText;
    const newQuestion = `${pdfContent}\n${questionContent}`;
    setQuestion11(newQuestion);
    await generateAnswer11WithQuestion(e, newQuestion);
  }

  // *************

  // *************

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
  // *****************
  const handleChanges7 = (html) => {
    setAnswer7(html);
    if (!generatingAnswer7) setEdited7(true);
  };

  const handleChanges8 = (html) => {
    setAnswer8(html);
    if (!generatingAnswer8) setEdited8(true);
  };

  const handleChanges9 = (html) => {
    setAnswer9(html);
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

  // *****************

  const handleButtonClick = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("firstQuestion").innerText;
    setQuestion(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer(e);
    handleChanges1();
  };

  const handleButtonClick2 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("secondQuestion").innerText;
    setQuestion2(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer2(e);
    handleChanges2();
  };

  const handleButtonClick3 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("thirdQuestion").innerText;
    setQuestion3(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer3(e);
    handleChanges3();
  };

  const handleButtonClick4 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("fourthQuestion").innerText;
    setQuestion4(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer4(e);
    handleChanges4();
  };

  const handleButtonClick5 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("fifthQuestion").innerText;
    setQuestion5(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer5(e);
    handleChanges5();
  };

  const handleButtonClick6 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("sixthQuestion").innerText;
    setQuestion6(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer6(e);
    handleChanges6();
  };

  // ****************

  const handleButtonClick7 = (e) => {
    e.preventDefault();
    const questionContent =
      document.getElementById("seventhQuestion").innerText;
    setQuestion7(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer7(e);
    handleChanges7();
  };

  const handleButtonClick8 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("eighthQuestion").innerText;
    setQuestion8(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer8(e);
    handleChanges8();
  };

  const handleButtonClick9 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("ninthQuestion").innerText;
    setQuestion9(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer9(e);
    handleChanges9();
  };
  const handleButtonClick10 = (e) => {
    e.preventDefault();
    const questionContent = document.getElementById("tenthQuestion").innerText;
    setQuestion10(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer10(e);
    handleChanges10();
  };
  const handleButtonClick11 = (e) => {
    e.preventDefault();
    const questionContent =
      document.getElementById("eleventhQuestion").innerText;
    setQuestion11(`${projectData.pdf_text}\n${questionContent}`);
    generateAnswer11(e);
    handleChanges11();
  };

  // ****************

  const handleAllButtonClick = async (e) => {
    e.preventDefault();
    setGenerateButtonClicked(true);
    localStorage.setItem("generateButtonClicked_provisio", "true");
    const generationPromises = [];

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
      generationPromises.push(generateAnswerWithQuestion(e, newQuestion1));
    }

    // Remaining sections - continue to generate normally
    const questionContent2 =
      document.getElementById("secondQuestion").innerText;
    const newQuestion2 = `${projectData.pdf_text}\n${questionContent2}`;
    setQuestion2(newQuestion2);
    generationPromises.push(generateAnswer2WithQuestion(e, newQuestion2));

    // Repeat for sections 3-6
    const questionContent3 = document.getElementById("thirdQuestion").innerText;
    const newQuestion3 = `${projectData.pdf_text}\n${questionContent3}`;
    setQuestion3(newQuestion3);
    generationPromises.push(generateAnswer3WithQuestion(e, newQuestion3));

    const questionContent4 =
      document.getElementById("fourthQuestion").innerText;
    const newQuestion4 = `${projectData.pdf_text}\n${questionContent4}`;
    setQuestion4(newQuestion4);
    generationPromises.push(generateAnswer4WithQuestion(e, newQuestion4));

    const questionContent5 = document.getElementById("fifthQuestion").innerText;
    const newQuestion5 = `${projectData.pdf_text}\n${questionContent5}`;
    setQuestion5(newQuestion5);
    generationPromises.push(generateAnswer5WithQuestion(e, newQuestion5));

    const questionContent6 = document.getElementById("sixthQuestion").innerText;
    const newQuestion6 = `${projectData.pdf_text}\n${questionContent6}`;
    setQuestion6(newQuestion6);
    generationPromises.push(generateAnswer6WithQuestion(e, newQuestion6));

    // Optional sections
    if (isButton7Visible) {
      const questionContent7 =
        document.getElementById("seventhQuestion").innerText;
      const newQuestion7 = `${projectData.pdf_text}\n${questionContent7}`;
      setQuestion7(newQuestion7);
      generationPromises.push(generateAnswer7WithQuestion(e, newQuestion7));
    }
    if (isButton8Visible) {
      const questionContent8 =
        document.getElementById("eighthQuestion").innerText;
      const newQuestion8 = `${projectData.pdf_text}\n${questionContent8}`;
      setQuestion8(newQuestion8);
      generationPromises.push(generateAnswer8WithQuestion(e, newQuestion8));
    }
    if (isButton9Visible) {
      const questionContent9 =
        document.getElementById("ninthQuestion").innerText;
      const newQuestion9 = `${projectData.pdf_text}\n${questionContent9}`;
      setQuestion9(newQuestion9);
      generationPromises.push(generateAnswer9WithQuestion(e, newQuestion9));
    }
    if (isButton10Visible) {
      const questionContent10 =
        document.getElementById("tenthQuestion").innerText;
      const newQuestion10 = `${projectData.pdf_text}\n${questionContent10}`;
      setQuestion10(newQuestion10);
      generationPromises.push(generateAnswer10WithQuestion(e, newQuestion10));
    }
    if (isButton11Visible) {
      const questionContent11 =
        document.getElementById("eleventhQuestion").innerText;
      const newQuestion11 = `${projectData.pdf_text}\n${questionContent11}`;
      setQuestion11(newQuestion11);
      generationPromises.push(generateAnswer11WithQuestion(e, newQuestion11));
    }

    try {
      await Promise.all(generationPromises);
      setIsFirstGeneration(false); // Mark that we've generated content once
      await handleSubmit(); // Save once after all generations complete
    } catch (error) {
      console.error("Error generating all answers:", error);
      console.log("Failed to generate all answers.");
    }
  };
  // ********************

  useEffect(() => {
    const fetchProvisionDraft = async () => {
      const userData = localStorage.getItem("user");
      const projectId = localStorage.getItem("project_id");
      // ... (rest of your existing user/project checks) ...
      if (!userData) {
        console.log("Please Login ");
        navigate("/");
        return;
      }

      if (projectId) {
        // Simplified check, assuming project_id is the primary identifier
        const u_id = JSON.parse(userData).id;
        setIsLoading(true);

        try {
          const projectResponse = await axios.get("/getProjectData", {
            params: { u_id, project_id: projectId },
          });
          setProjectData(projectResponse.data);
          console.log("Project Data Response:", projectResponse.data);

          if (
            projectResponse.data &&
            String(projectResponse.data.project_id) === String(projectId)
          ) {
            const provisionResponse = await axios.get(
              "/api/getProvisionDraft",
              {
                params: { project_id: projectResponse.data.project_id },
              }
            );

            if (provisionResponse.data && provisionResponse.data.length > 0) {
              const existingDraft = provisionResponse.data[0];
              setDraftData(existingDraft);
              setDraftExists(true);

              setAnswer(existingDraft.title_of_invention || "");
              setAnswer2(existingDraft.background_of_invention || "");
              setAnswer3(existingDraft.summery_of_invention || "");
              setAnswer4(existingDraft.fields_of_invention || "");
              setAnswer5(existingDraft.detailed_description || "");
              setAnswer6(existingDraft.advantages_of_invention || "");

              const currentAnswer7 = existingDraft.add_embodiments || "";
              const currentAnswer8 = existingDraft.add_few_claims || "";
              const currentAnswer9 = existingDraft.add_key_features || "";
              const currentAnswer10 = existingDraft.add_abstract || "";
              const currentAnswer11 = existingDraft.add_custom_paragraph || "";

              setAnswer7(currentAnswer7);
              setAnswer8(currentAnswer8);
              setAnswer9(currentAnswer9);
              setAnswer10(currentAnswer10);
              setAnswer11(currentAnswer11);

              // Load visibility from localStorage first, then fall back to draft content
              const visibilityKey = getLocalStorageKeyForVisibility(
                projectResponse.data.project_id
              );
              const savedVisibility = localStorage.getItem(visibilityKey);
              if (savedVisibility) {
                try {
                  const parsedVisibility = JSON.parse(savedVisibility);
                  setIsButton7Visible(parsedVisibility.isButton7Visible);
                  setIsButton8Visible(parsedVisibility.isButton8Visible);
                  setIsButton9Visible(parsedVisibility.isButton9Visible);
                  setIsButton10Visible(parsedVisibility.isButton10Visible);
                  setIsButton11Visible(parsedVisibility.isButton11Visible);
                } catch (e) {
                  /* ignore parsing error, fall back to content check */
                }
              } else {
                // Fallback: if not in local storage, determine visibility based on whether content exists
                setIsButton7Visible(
                  !!currentAnswer7 &&
                    currentAnswer7.trim() !== "" &&
                    !(
                      currentAnswer7.includes("<p><br></p>") &&
                      currentAnswer7.length < 20
                    )
                );
                setIsButton8Visible(
                  !!currentAnswer8 &&
                    currentAnswer8.trim() !== "" &&
                    !(
                      currentAnswer8.includes("<p><br></p>") &&
                      currentAnswer8.length < 20
                    )
                );
                setIsButton9Visible(
                  !!currentAnswer9 &&
                    currentAnswer9.trim() !== "" &&
                    !(
                      currentAnswer9.includes("<p><br></p>") &&
                      currentAnswer9.length < 20
                    )
                );
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
              }
            } else {
              setDraftExists(false);
              // If no draft exists, ensure all optional sections are initially hidden
              setIsButton7Visible(false);
              setIsButton8Visible(false);
              setIsButton9Visible(false);
              setIsButton10Visible(false);
              setIsButton11Visible(false);
              console.log(
                "No provision draft found, ready to create a new one."
              );
            }
          } else {
            setError(`Project ID mismatch or data missing.`);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          if (
            error.response &&
            error.response.status === 404 &&
            error.config.url.includes("/api/getProvisionDraft")
          ) {
            setDraftExists(false);
            setIsButton7Visible(false);
            setIsButton8Visible(false);
            setIsButton9Visible(false);
            setIsButton10Visible(false);
            setIsButton11Visible(false);
            console.log(
              "No provision draft found (404), ready to create a new one."
            );
          } else {
            setError("Failed to fetch data.");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Project ID not found in localStorage");
        setIsLoading(false);
      }
    };

    fetchProvisionDraft();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!projectData) {
      console.error("Project data not loaded yet.");
      console.log("Project data is not loaded. Please try again later.");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const projectId = localStorage.getItem("project_id");
    const u_id = userData ? userData.id : null;

    if (!u_id || !projectId) {
      console.log("User ID or Project ID is missing.");
      return;
    }

    if (String(projectData.project_id) !== String(projectId)) {
      console.log(
        `Project ID mismatch. Local ID: ${projectId}, Project Data ID: ${projectData.project_id}`
      );
      return;
    }

    setIsLoading(true);

    const dataToSend = {
      title_of_invention: answer || "",
      background_of_invention: answer2 || "",
      summery_of_invention: answer3 || "", // Note: Backend uses "summery", not "summary"
      fields_of_invention: answer4 || "",
      detailed_description: answer5 || "",
      advantages_of_invention: answer6 || "",
      add_embodiments: answer7 || "",
      add_few_claims: answer8 || "",
      add_key_features: answer9 || "",
      add_abstract: answer10 || "",
      add_custom_paragraph: answer11 || "",
      project_id: projectData.project_id,
      u_id,
    };

    // console.log("Data to send:", dataToSend);

    try {
      const response = await fetch("/api/saveProvisionDraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save/update draft: ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log(result.message || "Draft saved successfully!");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      console.log(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
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
            Project ID - <b>{projectData.project_id}</b>
          </h5>
          <p style={{ fontSize: "16px" }}>
            <b>ProvisioDraft</b> Generate a comprehensive provisional patent
            specification
          </p>
          <div className="row">
            <div className="col-lg-7 col-md-7 col-sm-12 mar-bott-res">
              <div
                className="main-content"
                style={{
                  background: "#E7EFFA",
                  padding: "15px 5px 30px 5px",
                  borderRadius: "20px",
                  height: "620px",
                  overflowY: "scroll",
                }}
              >
                <div className="main-content-holder">
                  <div>
                    <div
                      className="pdf-text-container"
                      style={{ display: "none" }}
                    >
                      <h2 className="text-xl font-bold">PDF Text Content:</h2>
                      <p id="pdfText" value="" onChange={handleChange}></p>
                    </div>

                    <div>
                      <button
                        className="btn-stl-4 w-auto"
                        onClick={() => navigate("/innoCheck?q=provisional")}
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
                      <h3 style={{ color: "#36718b" }}>
                        Title of the Invention
                      </h3>

                      {/* <p style={{ fontSize: "18px" }}>
                            What is the tentative title for your invention?
                          </p> */}
                      <p id="firstQuestion" style={{ display: "none" }}>
                        Provide me the title of the invention of the above
                        provided content. Provided content should only contain
                        the Title of the invention and nothing else.
                        <br />
                        Don't use html word in the answer.
                        <br />
                        Provide me one title of the invention from above
                        provided content & no extra content other that the title
                        is required. Start with a heading of "Title of
                        Invention" in the first line & inside a single pair of
                        h1 tags and the actual title should be in a single pair
                        of p tags.
                        <br />
                        And provided content should only give complete answer
                        using proper html tags & not even single word is written
                        without tag.
                      </p>

                      <div
                        id="firstAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
                      >
                        {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer}
                          onChange={handleChanges1}
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
                        As a legal assistant, your task is to draft a
                        'Background' section for a patent. Your final output
                        should: - Include a 'Background' heading at the top. -
                        The background should be divided into 3-4 paragraphs (no
                        additional headings). - The background should talk about
                        the technology field of the invention and the prior art
                        issues addressed. - Do not disclose the invention's key
                        features. - Limit the final output to a maximum of 350
                        words.
                        <br />
                        Ensure to give the top heading enclosed within a pair of
                        h1 tags. The following content below that should be
                        enclosed within p tags (one or multiple, as required)
                        and if some other heading or sub-heading has to be
                        there, that should be enclosed within h2 tags. Ensure to
                        not use any other tags in the output.
                      </p>

                      <div
                        id="secondAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
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
                        for a patent. Your final output should: - Be a maximum
                        of 150 words. Start with a small paragraph of around 50
                        words that captures the essence followed by several
                        one-liner sentences starting with "Optionally, ...", as
                        used in patents.
                        <br />
                        Make sure to use 1 or 2 paragraphs for the summary and
                        no numbered line or anything to be there.
                        <br />
                        Ensure to give the top heading enclosed within a pair of
                        h1 tags. The following content below that should be
                        enclosed within p tags (one or multiple, as required)
                        and if some other heading or sub-heading has to be
                        there, that should be enclosed within h2 tags. Ensure to
                        not use any other tags in the output.
                      </p>

                      <div
                        id="thirdAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
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
                      <h3 style={{ color: "#36718b" }}>
                        Fields of the Invention
                      </h3>
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
                        belongs to...". Limit the final output to a maximum of
                        80 words.
                        <br />
                        Ensure to give the top heading enclosed within a pair of
                        h1 tags. The following content below that should be
                        enclosed within p tags (one or multiple, as required).
                        Ensure to not use any other tags in the output.
                      </p>

                      <div
                        id="fourthAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
                      >
                        {/* <ReactMarkdown className="p-4">{answer4}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer4}
                          onChange={handleChanges4}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for fifth question */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                      <h3 style={{ color: "#36718b" }}>
                        Detailed Description of the Invention
                      </h3>
                      {/* <p style={{ fontSize: "18px" }}>
                            Provide a comprehensive description of the invention. What are the components or steps involved? How does each part work? Use references to any relevant drawings to explain the invention in detail
                          </p> */}
                      <p id="fifthQuestion" style={{ display: "none" }}>
                        As a legal assistant, create a 'Detailed Description' to
                        support the given claims and the invention. Do any
                        necessary reasoning or brainstorming but exclude it from
                        the final output. Your final output should: - Provide a
                        thorough explanation in at least 800 words, focusing on
                        quality. - Start with 'Detailed Description' (no
                        additional headings). - Explain the invention in 2-3
                        paragraphs, then elaborate on the invention embodiments.
                        - Do not reference claim numbers directly.
                        <br />
                        Answer must start with a heading of "Detailed
                        Description" in h1 tag.
                        <br />
                        Don't use Tables and images in the answer.
                        <br />
                        Don't use html word.
                        <br />
                        Provide a comprehensive description of the invention.
                        How does it work? What are its components or steps?
                        Refer to any drawings where necessary, explaining each
                        part in detail.
                        <br />
                        And provided content should only give complete answer
                        using proper html tags & not even single word is written
                        without tag. And also give the content with proper
                        heading and ordered list with proper alignment so that
                        it looks good. And the provided content must be left
                        aligned.
                      </p>

                      <div
                        id="fifthAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
                      >
                        {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer5}
                          onChange={handleChanges5}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for sixth question */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
                      <h3 style={{ color: "#36718b" }}>
                        Advantages of the Invention
                      </h3>
                      {/* <p style={{ fontSize: "18px" }}>
                            What are the main advantages of your invention compared to existing
                            solutions? How does it improve upon current technology, reduce costs,
                            or increase efficiency?
                          </p> */}
                      <p id="sixthQuestion" style={{ display: "none" }}>
                        You are a researcher. Your task is to read the given
                        invention details and then identify the advantages the
                        invention offers over existing technologies. The
                        advantages can be in terms of improved performance,
                        efficiency, cost, or usability compared to the prior
                        art, whichever is disclosed and we don’t have to include
                        all those advantage parameters I said, just the ones
                        that are there in the invention detail only. While
                        writing, please write the exact advantages written in
                        the invention detail, do not add anything from your
                        side. Try not to include any other details such as
                        patent numbers or problem details or anything else, just
                        the advantages being written in the invention details.
                        Make the format such as a heading which is the advantage
                        and then numbered line(s) below explaining the specific
                        advantage of that and then the next advantage heading
                        and then numbered line(s) below and so on. Also use up
                        to 150 words to answer (more or less depending what’s in
                        the invention details form, don’t add or remove).
                        <br />
                        Ensure to give the top heading enclosed within a pair of
                        h1 tags. The following content below that should be
                        enclosed within p tags (one or multiple, as required)
                        and if some other heading or sub-heading has to be
                        there, that should be enclosed within h2 tags. Ensure to
                        not use any other tags in the output.
                      </p>

                      <div
                        id="sixthAnswer"
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                        style={{
                          // overflowY: "scroll",
                          borderRadius: "15px",
                          border: "none !important",
                        }}
                      >
                        {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer6}
                          onChange={handleChanges6}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for seventh question */}
                    <div
                      className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                      style={{ display: isButton7Visible ? "block" : "none" }}
                    >
                      <h3 style={{ color: "#36718b" }}>Embodiments</h3>
                      <p id="seventhQuestion" style={{ display: "none" }}>
                        Provide me the Embodiment of the above provided content.
                        Provided content should only contain the Embodiment and
                        nothing else.
                        <br />
                        Don't use html word in the answer.
                        <br />
                        Provide me Embodiment from above provided content & no
                        extra content other that the Alternative Embodiment is
                        required. Start with a heading of "Embodiment" in the
                        first line & inside h1 tag.
                        <br />
                        And provided content should only give complete answer
                        using proper html tags & not even single word is written
                        without tag. And also give the content with proper
                        heading and ordered list with proper alignment so that
                        it looks good. And provided text must align to the left
                        side. And the provided content must be left aligned.
                      </p>

                      <div
                        id="seventhAnswer"
                        style={{ borderRadius: "15px" }}
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                      >
                        {/* <ReactMarkdown className="p-4">{answer7}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer7}
                          onChange={handleChanges7}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for eighth question */}
                    <div
                      className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                      style={{ display: isButton8Visible ? "block" : "none" }}
                    >
                      <h3 style={{ color: "#36718b" }}>Few Claims</h3>
                      <p id="eighthQuestion" style={{ display: "none" }}>
                        You are a patent attorney. Your aim is to generate a set
                        of around 8 patent claims for a given invention,
                        including at least one system or method claim (choose
                        whichever is most appropriate).Your final output should:
                        - Provide the claims, numbered 1. through 8. Some
                        guidelines for patent claim drafting: - Independent
                        claims do not refer to other claims; dependent claims
                        do. - Draft claims that are specific, clear, and
                        concise. - Use 'comprises' to maintain inclusivity. -
                        For system claims, define separable elements without
                        mixing them. - Method claims should specify steps
                        capturing the invention's functionality. Limit the total
                        word count to ~300-350 words.
                        <br />
                        Answer must start with a heading of "Claims" in h1 tag.
                        <br />
                        Don't use Tables and images in the answer.
                        <br />
                        Don't use html word.
                        <br />
                        And provided content should only give complete answer
                        using proper html tags & not even single word is written
                        without tag. And also give the content with proper
                        heading and ordered list with proper alignment so that
                        it looks good. And the provided content must be left
                        aligned.
                      </p>

                      <div
                        id="eighthAnswer"
                        style={{ borderRadius: "15px" }}
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                      >
                        {/* <ReactMarkdown className="p-4">{answer8}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer8}
                          onChange={handleChanges8}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for ninth question */}
                    <div
                      className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                      style={{ display: isButton9Visible ? "block" : "none" }}
                    >
                      <h3 style={{ color: "#36718b" }}>Key Features</h3>
                      <p id="ninthQuestion" style={{ display: "none" }}>
                        You are a patent search analyst tasked at patentability
                        search projects. Understand the invention in detail and
                        then start giving the key features focusing on the novel
                        aspects and the solution of the invention mostly. The
                        key features would have a preamble and then sub-features
                        within it, the key features should further be nested
                        like 1, 1.1, 1.2, 2, 2.1, and so on. The most important
                        thing in key features is to divide them into really
                        atomic units (like each key feature should be atomic,
                        instead of clubbing features, look to divide them well).
                        Note that the key features should describe the
                        invention's solution and not the invention's prior art
                        or application or advantage, should focus on the
                        invention details so we can assist the patent searchers.
                        Also note that the second key feature should refer to
                        (like said X, if X was defined or explained in key
                        feature 1) or kind of be in continuation to what was in
                        the first key feature while being atomic. You can use up
                        to 200 word max in total.
                        <br />
                        I am giving you 2 examples so you can use them for
                        inspiration and writing style without getting affected
                        by those invention data while doing your work.
                        <br />
                        Example 1 has Description: "We are engineering fusion
                        proteins between an RNA-guided RNA- or DNA-targeting
                        molecule (such as deactivated CRISPR-Cas proteins or
                        CRISPR inspired RNA targeting proteins) and a
                        pro-domain-truncated initiator caspase (Caspase-2, -8,
                        -9 or -10 or modified version of these). These will
                        constitute a system that can detect one or multiple
                        specific and programmable RNA or DNA sequences (Target
                        Sequences) in living cells and activate a downstream
                        protease cascade switch only if these Target Sequences
                        are present in the cell. We use 2 guide RNAs (gRNAs) to
                        position 2 of these fusion proteins in close proximity
                        on the Target Sequence, which provides a signal for the
                        truncated Caspase submodules to dimerize and thereby
                        activate their protease activity. In the absence of the
                        Target Sequence, the gRNAs will not bring these fusion
                        proteins into close proximity and dimerisation and
                        Caspase activation will not occur. If the Target
                        Sequence is present in the cell, the subsequent Caspase
                        protease activity will trigger a downstream response,
                        which can be customized: e.g. i) by activating
                        executioner Caspases, such as Caspase 3, triggering
                        apoptosis; ii) by using engineered initiator Caspases
                        with modified specificity, we can uncouple from the
                        Caspase initiated apoptotic pathway and instead activate
                        zymogens (inactive enzymes that can be activated by a
                        protease), transcription factors or other signalling
                        molecules. Overall, our invention can detect a
                        programmable Target Sequence in living cells and
                        initiate a downstream response, such as apoptosis, only
                        if the Target Sequence is present in these cells. Our
                        system will be the first of its kind to use nucleic acid
                        sequence markers in living cells and to allow a response
                        to be activated dependent on the presence of these
                        target sequences. A very new technology was recently
                        published and patented, which has a similar objective
                        but achieves it in a very different way and at this
                        stage its sensitivity and selectivity is low."
                        <br />
                        Example 1 has Key Features: "Primary Features: 1. Method
                        for activating protease cascade switch upon detection of
                        a target sequence (specific nucleic acid sequence) such
                        as DNA or RNA in living cells, wherein; 1.1 Said
                        activation is performed through an engineered system
                        which includes CRISPR RNA guided fusion proteins between
                        either RNA-guided RNA or DNA-targeting molecule (such as
                        deactivated CRISPR-Cas proteins or CRISPR inspired RNA
                        targeting proteins) with a pro-domain-truncated
                        initiator caspase such as Caspase-2, -8, -9 or -10 or
                        type III/E Craspase systems to activate caspase-8/9; 1.2
                        Two of said guide RNAs (gRNAs) used to position two of
                        the fusion proteins in close proximity on the target
                        sequence, wherein; 1.2.1 Said guide RNA provides a
                        signal for the truncated caspase submodules to dimerize
                        and further activates/triggered their protease activity.
                        1.3 A triggered downstream response can be customized in
                        following different manner: 1.3.1 Activating executioner
                        caspases, such as Caspase 3, triggering apoptosis or
                        1.3.2 Using engineered initiator caspases with modified
                        specificity, we can uncouple from the caspase initiated
                        apoptotic pathway and instead activate zymogens
                        (inactive enzymes that can be activated by a protease),
                        transcription factors or other signalling molecules.
                        Secondary Features: 1.4 Said method and engineered
                        system is applicable in following areas: 1.4.1
                        Eliminating cancer cells very specifically and without
                        or with minimal side effects and/or 1.4.2 Distinguishing
                        and selectively eliminating one particular species from
                        closely related species, effectively using it as an
                        exceptionally selective pesticide or eliminating
                        invasive species from endemic species and/or 1.4.3
                        Visualizing target cells (e.g. cancer cells) for
                        surgical applications."
                        <br />
                        Example 2 has description: "Recently, an idea came up
                        making a flow sensor obsolete. An electric pump pumping
                        water (or aqueous liquid) through a tube system. Detect
                        if just air is aspirated because the reservoir is empty
                        or there is a significant leak in the aspiration tubing
                        or an aspiration tube is disconnected. Detect if one of
                        the tubings is clogged or kinked so that the tube is
                        blocked Current solution is to use a flow sensor. A New
                        approach - Monitor the power consumption of the pump
                        (electromotor) If a defined threshold of power
                        consumption is exceeded, it indicates a blockage or
                        clogging. If a defined threshold of power consumption is
                        undershot, air is aspirated. We want just to monitor if
                        liquid flows by pumping. NO quantification of flow
                        required. We want to evaluate if the concept is free to
                        use or if still patents are in force. Does expired
                        patents exist which describe the concept?"
                        <br />
                        Example 2 has key features: "Primary Features: 1. A
                        Power Monitoring Device comprises: 1a. The device
                        monitors the power consumption of the pump
                        (electromotor). 1b. If a defined threshold of power
                        consumption is exceeded, it indicates a blockage or
                        clogging. 1c. If a defined threshold of power
                        consumption is undershot, air is aspirated. Secondary
                        Feature: 2. The pump is an electric pump pumping water
                        (aqueous liquid) through a tube system."
                        <br />
                        I have given you description and key features pair
                        examples. So learn my key feature writing style and
                        generate the required key features in the format I want.
                        Don't get influenced by the examples just use them for
                        inspiration.
                        <br />
                        Ensure to give the top heading enclosed within a pair of
                        h1 tags. The following content below that should be
                        enclosed within p tags (one or multiple, as required)
                        and if some other heading or sub-heading has to be
                        there, that should be enclosed within h2 tags. Ensure to
                        not use any other tags in the output.
                        <br />
                        The invention description you need to work on is:
                      </p>

                      <div
                        id="ninthAnswer"
                        style={{ borderRadius: "15px" }}
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                      >
                        {/* <ReactMarkdown className="p-4">{answer9}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer9}
                          onChange={handleChanges9}
                          modules={modules}
                        />
                      </div>
                    </div>

                    {/* Example structure for tenth question */}
                    <div
                      className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center"
                      style={{ display: isButton10Visible ? "block" : "none" }}
                    >
                      <h3 style={{ color: "#36718b" }}>Abstract</h3>
                      <p id="tenthQuestion" style={{ display: "none" }}>
                        As a legal assistant, draft an 'Abstract' focusing
                        mostly on claim 1. Do not mention any claim numbers or
                        highlight claims directly. Your final output should: -
                        Be max 100 words. - Start with: "Concepts and
                        technologies disclosed herein are..."
                        <br />
                        Answer must start with a heading of "Abstract" in h1
                        tag.
                        <br />
                        Don't use Tables and images in the answer.
                        <br />
                        Don't use html word.
                        <br />
                        And provided content should only give complete answer
                        using proper html tags & not even single word is written
                        without tag. And also give the content with proper
                        heading and ordered list with proper alignment so that
                        it looks good. And the provided content must be left
                        aligned.
                      </p>

                      <div
                        id="tenthAnswer"
                        style={{ borderRadius: "15px" }}
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                      >
                        {/* <ReactMarkdown className="p-4">{answer10}</ReactMarkdown> */}
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
                      <h3 style={{ color: "#36718b" }}>Custom Paragraph</h3>
                      <p id="eleventhQuestion" style={{ display: "none" }}>
                        Just Provide me heading of "Custom Paragraphs" in the
                        first line & inside h1 tag. And not even a single word
                        other that this is required.
                      </p>

                      <div
                        id="eleventhAnswer"
                        style={{ borderRadius: "15px" }}
                        className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                      >
                        {/* <ReactMarkdown className="p-4">{answer11}</ReactMarkdown> */}
                        <ReactQuill
                          value={answer11}
                          onChange={handleChanges11}
                          modules={modules}
                        />
                      </div>
                    </div>
                  </div>
                  {/* ********************Lower Part******** */}
                  <div>
                    <div id="PatentDrafting">
                      <h1
                        className="head-stl"
                        style={{ color: "#36718b", display: "none" }}
                      >
                        Patent Drafting
                      </h1>
                      <ReactQuill
                        ref={quillRef}
                        value={editorContent}
                        onChange={handleChangeNew}
                        modules={modules}
                        style={{ display: "none" }}
                      />

                      {/* <button
                        className="btn-stl-4 w-auto"
                        onClick={handlePrint4}
                        style={{
                          margin: "10px",
                          padding: "13px",
                          height: "43px",
                          marginBottom: "50px",
                          width: "200px",
                          color: "rgb(80, 79, 79)",
                        }}
                      >
                        <b>Download Provisio Draft</b>
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-5 col-sm-12">
              <div>
                <h6 style={{ color: "#008CBF" }}>
                  1 - Options to refine the Provisional Draft
                </h6>
                <div className="d-flex align-items-center justify-content-left flex-wrap">
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
                      className="btn-stl-3 w-auto  h-auto"
                      disabled={generatingAnswer}
                    >
                      <b>Regenerate - </b>Title Of Invention
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
                      className="btn-stl-3 w-auto h-auto"
                      disabled={generatingAnswer2}
                    >
                      <b>Regenerate - </b>Background of the Invention
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
                      className="btn-stl-3 w-auto h-auto"
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
                      className="btn-stl-3 w-auto h-auto"
                      disabled={generatingAnswer4}
                    >
                      <b>Regenerate - </b>Fields of the Invention
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
                      className="btn-stl-3 w-auto h-auto"
                      disabled={generatingAnswer5}
                    >
                      <b>Regenerate - </b>Detailed Description
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
                      <b>Regenerate - </b>Advantages Of The Invention
                    </button>
                  </form>

                  {/* Regenerate Button 7 - Embodiment */}
                  {isButton7Visible && (
                    <form
                      onSubmit={generateAnswer7}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* ... hidden textarea ... */ style={{
                          display: "none",
                        }}
                      ></textarea>
                      <button
                        id="button7"
                        onClick={handleButtonClick7}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer7}
                      >
                        <b>Regenerate - </b>Embodiment
                      </button>
                    </form>
                  )}
                  {/* Regenerate Button 8 - Few Claims */}
                  {isButton8Visible && (
                    <form
                      onSubmit={generateAnswer8}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* ... hidden textarea ... */ style={{
                          display: "none",
                        }}
                      ></textarea>
                      <button
                        id="button8"
                        onClick={handleButtonClick8}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer8}
                      >
                        <b>Regenerate - </b>Few Claims
                      </button>
                    </form>
                  )}
                  {/* Regenerate Button 9 - Key Features */}
                  {isButton9Visible && (
                    <form
                      onSubmit={generateAnswer9}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* ... hidden textarea ... */ style={{
                          display: "none",
                        }}
                      ></textarea>
                      <button
                        id="button9"
                        onClick={handleButtonClick9}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer9}
                      >
                        <b>Regenerate - </b>Key Features
                      </button>
                    </form>
                  )}
                  {/* Regenerate Button 10 - Abstract */}
                  {isButton10Visible && (
                    <form
                      onSubmit={generateAnswer10}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* ... hidden textarea ... */ style={{
                          display: "none",
                        }}
                      ></textarea>
                      <button
                        id="button10"
                        onClick={handleButtonClick10}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer10}
                      >
                        <b>Regenerate - </b>Abstract
                      </button>
                    </form>
                  )}
                  {/* Regenerate Button 11 - Custom Paragraph */}
                  {isButton11Visible && (
                    <form
                      onSubmit={generateAnswer11}
                      style={{ display: "block" }}
                    >
                      <textarea
                        /* ... hidden textarea ... */ style={{
                          display: "none",
                        }}
                      ></textarea>
                      <button
                        id="button11"
                        onClick={handleButtonClick11}
                        type="submit"
                        className="btn-stl-3 w-auto"
                        disabled={generatingAnswer11}
                      >
                        <b>Regenerate - </b>Custom Paragraph
                      </button>
                    </form>
                  )}
                </div>
                <h6 className="mt-5" style={{ color: "#008CBF" }}>
                  2- Options to add new sections
                </h6>
                <div className="d-flex align-items-center justify-content-left flex-wrap">
                  <button
                    id="add-btn-1"
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick7(e)}
                    style={{
                      background: isButton7Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)" // Reddish gradient for Remove
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)", // Original for Add
                    }}
                  >
                    <b>{isButton7Visible ? "Remove - " : "Add - "}</b>
                    Embodiments
                  </button>

                  <button
                    id="add-btn-2"
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick8(e)}
                    style={{
                      background: isButton8Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton8Visible ? "Remove - " : "Add - "}</b>Few Claims
                  </button>
                  <button
                    id="add-btn-3"
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick9(e)}
                    style={{
                      background: isButton9Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton9Visible ? "Remove - " : "Add - "}</b>Key
                    Features
                  </button>
                  <button
                    id="add-btn-4"
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick10(e)}
                    style={{
                      background: isButton10Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton10Visible ? "Remove - " : "Add - "}</b>Abstract
                  </button>
                  <button
                    id="add-btn-5"
                    className="btn-stl-3 w-auto h-auto"
                    onClick={(e) => handleToggleButtonClick11(e)}
                    style={{
                      background: isButton11Visible
                        ? "linear-gradient(90deg, rgba(255, 204, 204, 1) 0%, rgba(255, 220, 220, 1) 35%, rgba(255, 190, 190, 1) 100%)"
                        : "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                    }}
                  >
                    <b>{isButton11Visible ? "Remove - " : "Add - "}</b>Custom
                    Paragraph
                  </button>
                </div>

                <h6 className="mt-5" style={{ color: "#008CBF" }}>
                  3- Select your next action
                </h6>
                <div className="d-flex align-items-center justify-content-left flex-wrap">
                  <button className="btn-stl-4 w-auto" onClick={handlePrint5}>
                    View Provisio Draft
                  </button>

                  {/* <button className="btn-stl-4 w-auto" onClick={handlePrint4}>
                    Download Provisio Draft
                  </button> */}

                  {/* Replace the existing dropdown implementation with this improved version */}
                  <div className="relative">
                    <button
                      ref={triggerRef}
                      className="btn-stl-4 w-auto"
                      onClick={() =>
                        setShowDownloadOptions(!showDownloadOptions)
                      }
                    >
                      <span>Download Provisional Draft</span>
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
                            onClick={handlePrintPdf}
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
                            onClick={handleDownloadDocx}
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
                  <button
                    className="btn-stl-4 w-auto"
                    onClick={() => navigate("/draftMaster")}
                  >
                    Generate Non-Provisional Draft
                  </button>

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

export default Content;
