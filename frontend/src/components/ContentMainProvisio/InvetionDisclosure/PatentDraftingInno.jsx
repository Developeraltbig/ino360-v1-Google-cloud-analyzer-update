import React, { useEffect, useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  Tab,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  HorizontalPositionAlign,
  VerticalPositionAlign,
  ImageRun,
  NumberFormat,
  UnderlineType,
  Shading,
} from "docx";
import "./patentDraftingInno.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFilePdf, FaFileWord, FaDownload } from "react-icons/fa";
import Consult from "../../shared/Consult";

const PatentDraftingInno = () => {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const analyzeInventionDataRef = useRef(null);
  const quillRef = React.createRef();
  const [showConsultModal, setShowConsultModal] = useState(false);
  const handleCloseConsultModal = () => setShowConsultModal(false);
  const [projID, setprojID] = useState("");

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

  useEffect(() => {
    const fetchInnoCheckData = async () => {
      try {
        const projectId =
          localStorage.getItem("project_id") ||
          localStorage.getItem("selectedProject");

        if (projectId) {
          setprojID(projectId);
        }

        console.log(
          "[PatentDraftingInno] Fetching data for project ID:",
          projectId
        );

        if (!projectId) {
          console.error("[PatentDraftingInno] No project ID found");
          loadFromLocalStorage();
          return;
        }

        const response = await axios.get("/api/getInnocheck", {
          params: { project_id: projectId },
        });

        console.log(
          "[PatentDraftingInno] API response received:",
          response.data
        );

        if (response.data && response.data.length > 0) {
          const innoCheckData = response.data[0];
          if (innoCheckData.analyze_invention_data) {
            console.log(
              "[PatentDraftingInno] Found analyze_invention_data:",
              JSON.stringify(innoCheckData.analyze_invention_data).substring(
                0,
                100
              ) + "..."
            );
            analyzeInventionDataRef.current =
              innoCheckData.analyze_invention_data;
            try {
              localStorage.setItem(
                "analyzeInventionData",
                JSON.stringify(innoCheckData.analyze_invention_data)
              );
              console.log(
                "[PatentDraftingInno] Stored analyze_invention_data in localStorage"
              );
            } catch (err) {
              console.warn(
                "[PatentDraftingInno] Failed to store in localStorage:",
                err
              );
            }
          }
          let content = "";
          if (innoCheckData.summary_of_invention)
            content += `${innoCheckData.summary_of_invention}<br><br>`;
          if (innoCheckData.key_features)
            content += `${innoCheckData.key_features}<br><br>`;
          if (innoCheckData.problem_statement)
            content += `${innoCheckData.problem_statement}<br><br>`;
          if (innoCheckData.solution_statement)
            content += `${innoCheckData.solution_statement}<br><br>`;
          if (innoCheckData.novelty_statement)
            content += `${innoCheckData.novelty_statement}<br><br>`;
          if (innoCheckData.advantages_of_invention)
            content += `${innoCheckData.advantages_of_invention}<br><br>`;
          if (innoCheckData.industrial_applicability)
            content += `${innoCheckData.industrial_applicability}<br><br>`;
          if (innoCheckData.innovators_in_the_field)
            content += `${innoCheckData.innovators_in_the_field}<br><br>`;
          setEditorContent(content);
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error(
          "[PatentDraftingInno] Error fetching InnoCheck data:",
          error
        );
        loadFromLocalStorage();
      }
    };

    function loadFromLocalStorage() {
      console.log("[PatentDraftingInno] Loading from localStorage");
      const storedAnswer1 = localStorage.getItem("answerInnoCheck");
      const storedAnswer2 = localStorage.getItem("answerInnoCheck2");
      const storedAnswer4 = localStorage.getItem("answerInnoCheck4");
      const storedAnswer5 = localStorage.getItem("answerInnoCheck5");
      const storedAnswer6 = localStorage.getItem("answerInnoCheck6");
      const storedAnswer9 = localStorage.getItem("answerInnoCheck9");
      const storedAnswer11 = localStorage.getItem("answerInnoCheck11");
      const storedAnswer13 = localStorage.getItem("answerInnoCheck13");

      if (
        storedAnswer1 ||
        storedAnswer2 ||
        storedAnswer4 ||
        storedAnswer5 ||
        storedAnswer6 ||
        storedAnswer9 ||
        storedAnswer11 ||
        storedAnswer13
      ) {
        const content = `${storedAnswer1 || ""}\n\n${storedAnswer2 || ""}\n\n${
          storedAnswer4 || ""
        }\n\n${storedAnswer5 || ""}\n\n${storedAnswer6 || ""}\n\n${
          storedAnswer9 || ""
        }\n\n${storedAnswer11 || ""}\n\n${storedAnswer13 || ""}`;
        setEditorContent(content);
      }

      try {
        const storedAnalyzeData = localStorage.getItem("analyzeInventionData");
        if (storedAnalyzeData) {
          analyzeInventionDataRef.current = JSON.parse(storedAnalyzeData);
          console.log(
            "[PatentDraftingInno] Loaded analyze_invention_data from localStorage"
          );
        }
      } catch (err) {
        console.warn(
          "[PatentDraftingInno] Failed to load from localStorage:",
          err
        );
      }
    }

    fetchInnoCheckData();
  }, [reloadFlag]);

  useEffect(() => {
    const interval = setInterval(() => setReloadFlag((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (html) => setEditorContent(html);

  const fetchCurrentData = async () => {
    try {
      const projectId =
        localStorage.getItem("project_id") ||
        localStorage.getItem("selectedProject");
      if (!projectId) {
        console.error("[fetchCurrentData] No project ID found");
        return null;
      }
      console.log(
        "[fetchCurrentData] Fetching latest data for project ID:",
        projectId
      );
      const response = await axios.get("/api/getInnocheck", {
        params: { project_id: projectId },
      });
      if (response.data && response.data.length > 0) {
        console.log("[fetchCurrentData] Fresh data received");
        return response.data[0];
      }
      console.log("[fetchCurrentData] No data found");
      return null;
    } catch (error) {
      console.error("[fetchCurrentData] Error:", error);
      return null;
    }
  };

  const fetchProjectTitle = async () => {
    try {
      // First check localStorage
      const projectDataStr = localStorage.getItem("projectData");
      if (projectDataStr) {
        try {
          const projectData = JSON.parse(projectDataStr);
          if (projectData && projectData.project_title) {
            console.log(`[fetchProjectTitle] Found title in localStorage: ${projectData.project_title}`);
            return projectData.project_title;
          }
        } catch (err) {
          console.warn("[fetchProjectTitle] Error parsing localStorage data:", err);
        }
      }

      // If not in localStorage, fetch from API
      const projectId = localStorage.getItem("project_id") || localStorage.getItem("selectedProject");
      if (!projectId) {
        console.error("[fetchProjectTitle] No project ID found");
        return null;
      }

      // Get project data from the API
      const response = await axios.get("/getProjectData", {
        params: { project_id: projectId }
      });

      if (response.data && response.data.project_title) {
        console.log(`[fetchProjectTitle] Found title in API response: ${response.data.project_title}`);
        return response.data.project_title;
      }

      console.warn("[fetchProjectTitle] No project title found in response");
      return null;
    } catch (error) {
      console.error("[fetchProjectTitle] Error:", error);
      return null;
    }
  };

  const extractPatentNumber = (patentId) => {
    if (!patentId || typeof patentId !== "string") return "Unknown Patent";
    return patentId.replace(/^patent\//, "").replace(/\/en$/, "");
  };

  const parseMarkdownTable = (text) => {
    if (!text || typeof text !== "string") {
      return { headers: [], rows: [] };
    }
    try {
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      if (lines.length < 2) return { headers: [], rows: [] };
      const headers = lines[0]
        .split(/(?<!\\)\|/)
        .slice(1, -1)
        .map((cell) => cell.replace(/\\\|/g, "|").trim());
      const rows = lines.slice(2).map((row) =>
        row
          .split(/(?<!\\)\|/)
          .slice(1, -1)
          .map((cell) => cell.replace(/\\\|/g, "|").trim())
      );
      return { headers, rows };
    } catch (error) {
      console.error("Error parsing markdown table:", error);
      return { headers: [], rows: [] };
    }
  };

  const generateAnalyzeInventionHTML = (analyzeData) => {
  if (!analyzeData) {
    console.log("[generateAnalyzeInventionHTML] No analyzeData provided");
    return "<p>No analyze invention data available.</p>";
  }

  let html = `
    <div style="border-top: 3px solid #36718b; border-bottom: 1px solid #ddd; margin: 30px 0 20px 0; padding: 10px 0;">
      <h2 style="color: #36718b; margin: 5px 0; font-weight: 600; font-size: 18px;">Novelty Search Analysis</h2>
    </div>
  `;

  // Relevant Search Results - Use comparisons directly (10 patents)
  if (analyzeData.comparisons && Array.isArray(analyzeData.comparisons)) {
    html += `
      <div style="background-color: #f8f9fa; border-left: 5px solid #2196f3; padding: 10px 15px; margin: 20px 0;">
        <h3 style="color: #2196f3; margin: 0 0 10px 0; font-weight: 500; font-size: 16px;">Relevant Search Results (${analyzeData.comparisons.length})</h3>
      </div>
    `;

    analyzeData.comparisons.forEach((comparison, index) => {
      const patentId = comparison.patentId;
      const simplifiedId = extractPatentNumber(patentId);
      const details = comparison.details || {};

      html += `
        <div style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 30px; overflow: hidden;">
          <!-- Patent Header -->
          <div style="background-color: #f5f7f9; padding: 15px; border-bottom: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 14px;">Search Result ID: </strong>
                <a href="https://patents.google.com/patent/${simplifiedId}" target="_blank" style="color: #2196f3; text-decoration: none; font-weight: 500;">${simplifiedId}</a>
              </div>
              ${
                comparison.rank
                  ? `<div style="background-color: #36718b; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">Rank #${comparison.rank}</div>`
                  : ""
              }
            </div>
          </div>
          
          <!-- Patent Content -->
          <div style="padding: 15px 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Title</h4>
            <p style="margin: 0 0 15px; font-size: 13px; color: #444; font-weight: 500;">${
              details.title || "No title available"
            }</p>
            
            <!-- Found & Missing Sections -->
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              ${
                comparison.foundSummary
                  ? `
              <div style="flex: 1; background-color: #e9f7ef; padding: 12px; border-radius: 5px; border-left: 4px solid #2ecc71;">
                <strong style="color: #2ecc71; display: block; margin-bottom: 5px; font-size: 12px;">COVERAGE IDENTIFIED</strong>
                <p style="margin: 0; font-size: 12px; color: #333;">${comparison.foundSummary}</p>
              </div>`
                  : ""
              }
            </div>
            
            <!-- Abstract Section -->
            ${
              details.abstract || details.snippet
                ? `
              <div style="background-color: #f9f9f9; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #eee;">
                <strong style="color: #666; display: block; margin-bottom: 5px; font-size: 12px;">ABSTRACT</strong>
                <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">${details.abstract || details.snippet}</p>
              </div>`
                : ""
            }
            
            <!-- Meta Information -->
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
              <div>
                ${
                  details.filing_date
                    ? `<span style="color: #666;"><strong>Filing Date:</strong> ${details.filing_date}</span>`
                    : ""
                }
              </div>
              <div>
                ${
                  details.assignee
                    ? `<span style="color: #666;"><strong>Assignee:</strong> ${details.assignee}</span>`
                    : ""
                }
              </div>
            </div>
            ${
              details.inventor
                ? `
              <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                <strong>Inventor:</strong> ${details.inventor}
              </div>`
                : ""
            }
          </div>
          
          <!-- Feature Matrix Section -->
          <div style="border-top: 1px solid #eee; padding: 15px 20px; background-color: #fafafa;">
            <h4 style="margin: 0 0 15px 0; color: #36718b; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
              Feature Comparison Matrix
            </h4>
            
            <!-- Matrix Table -->
            <div style="overflow-x: auto;">
      `;

      // Matrix data
      const matrixData = comparison.matrix
        ? parseMarkdownTable(comparison.matrix)
        : { headers: [], rows: [] };
      
      if (matrixData.headers.length > 0) {
        html += `
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 12px;">
            <thead>
              <tr>
                ${matrixData.headers
                  .map(
                    (header) => `
                  <th style="border: 1px solid #ddd; padding: 10px; background-color: #36718b; color: white; text-align: left; font-size: 12px; font-weight: 600;">${header}</th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${matrixData.rows
                .map(
                  (row, rowIndex) => `
                <tr style="background-color: ${rowIndex % 2 === 0 ? '#fff' : '#f9f9f9'}">
                  ${row
                    .map(
                      (cell, cellIndex) => `
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; ${cellIndex === row.length - 1 && (cell.includes('Considerable') ? 'color: #2ecc71; font-weight: bold;' : (cell.includes('Partial') ? 'color: #f39c12; font-weight: bold;' : ''))}">${cell}</td>
                  `
                    )
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
      } else {
        html += `<p style="margin: 10px 0; font-style: italic; color: #999; font-size: 12px;">No matrix data available</p>`;
      }

      html += `
            </div>
            
            <!-- Excerpts Section -->
            <h4 style="margin: 25px 0 15px 0; color: #36718b; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
              Relevant Excerpts
            </h4>
            <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; color: #444; max-height: 200px; overflow-y: auto;">
              ${comparison.excerpts || "No excerpts available"}
            </div>
          </div>
        </div>
      `;
    });
  }

  // Additional Search Results Section (up to 20: 2 scholars + 18 patents)
  if (analyzeData.patentResults && Array.isArray(analyzeData.patentResults)) {
    // Get the patent IDs that are already shown in relevant results
    const shownPatentIds = analyzeData.comparisons ? analyzeData.comparisons.map(c => extractPatentNumber(c.patentId)) : [];
    
    // Filter scholar results (max 2)
    const scholarResults = analyzeData.patentResults
      .filter((result) => result.is_scholar)
      .slice(0, 2);
    
    // Filter additional patents (not shown in relevant, max 18)
    const additionalPatents = analyzeData.patentResults
      .filter((result) => {
        if (result.is_scholar) return false;
        const patentNumber = extractPatentNumber(result.patent_id);
        return !shownPatentIds.includes(patentNumber);
      })
      .slice(0, 18);
    
    const combinedResults = [...scholarResults, ...additionalPatents];
    
    html += `
      <div style="background-color: #f8f9fa; border-left: 5px solid #2196f3; padding: 10px 15px; margin: 30px 0 20px 0;">
        <h3 style="color: #2196f3; margin: 0 0 10px 0; font-weight: 500; font-size: 16px;">Additional Search Results (${combinedResults.length})</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
    `;

    let scholarCounter = 0;
    combinedResults.forEach((result) => {
      const isScholar = result.is_scholar;
      if (isScholar) scholarCounter++;
      
      const simplifiedId = isScholar
        ? `Scholar Res ${scholarCounter}`
        : extractPatentNumber(result.patent_id);
      const link = isScholar
        ? result.scholar_link || "#"
        : `https://patents.google.com/patent/${extractPatentNumber(result.patent_id)}`;

      html += `
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Result Header -->
          <div style="background-color: ${isScholar ? '#f0f4c3' : '#f5f7f9'}; padding: 12px; border-bottom: 1px solid #ddd;">
            <strong style="font-size: 13px;">${
              isScholar ? "Scholar Result: " : "Search Result ID: "
            }</strong>
            <a href="${link}" target="_blank" style="color: #2196f3; text-decoration: none; font-weight: 500;">
              ${simplifiedId}
            </a>
          </div>
          
          <!-- Result Content -->
          <div style="padding: 12px;">
            <h5 style="margin: 0 0 8px 0; color: #333; font-size: 13px;">Title</h5>
            <p style="margin: 0 0 12px; font-size: 12px; color: #444; line-height: 1.4;">
              ${result.title || "No title available"}
            </p>
            
            ${
              result.snippet
                ? `
              <div style="margin-bottom: 12px; font-size: 11px; color: #666; background-color: #f9f9f9; padding: 8px; border-radius: 4px; border-left: 2px solid #ddd;">
                ${result.snippet}
              </div>`
                : ""
            }
            
            <!-- Meta Information -->
            <div style="font-size: 11px; color: #777;">
              ${
                isScholar && result.publication_date
                  ? `<div><strong>Publication Date:</strong> ${result.publication_date}</div>`
                  : ""
              }
              ${
                !isScholar && result.filing_date
                  ? `<div><strong>Filing Date:</strong> ${result.filing_date}</div>`
                  : ""
              }
              ${
                isScholar && result.author
                  ? `<div><strong>Author:</strong> ${result.author}</div>`
                  : ""
              }
              ${
                !isScholar && result.assignee
                  ? `<div><strong>Assignee:</strong> ${result.assignee}</div>`
                  : ""
              }
              ${
                !isScholar && result.inventor
                  ? `<div><strong>Inventor:</strong> ${result.inventor}</div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  }

  // Search Strategy Section - NEW ADDITION
  if (analyzeData.searchQueries && Array.isArray(analyzeData.searchQueries)) {
    html += `
      <div style="background-color: #f8f9fa; border-left: 5px solid #ff9800; padding: 10px 15px; margin: 30px 0 20px 0;">
        <h3 style="color: #ff9800; margin: 0 0 10px 0; font-weight: 500; font-size: 16px;">Search Strategy & Queries Used</h3>
      </div>
      <div style="margin-bottom: 30px;">
    `;
    
    // Group queries by step
    const groupedQueries = analyzeData.searchQueries.reduce((acc, query) => {
      if (!acc[query.step]) {
        acc[query.step] = [];
      }
      acc[query.step].push(query);
      return acc;
    }, {});
    
    Object.entries(groupedQueries).forEach(([step, queries]) => {
      html += `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
          <h4 style="color: #36718b; font-size: 14px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid #dee2e6; padding-bottom: 8px;">
            ${step}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
      `;
      
      queries.forEach((queryItem, index) => {
        const badgeColor = queryItem.type === "Primary Search" ? "#2196f3" : 
                          queryItem.type === "Expanded Search" ? "#4caf50" : 
                          "#ff9800";
        
        html += `
          <div style="display: flex; align-items: flex-start; gap: 10px; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6;">
            <span style="background-color: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; white-space: nowrap; margin-top: 2px;">
              ${queryItem.type}
            </span>
            <code style="flex: 1; font-family: Monaco, Consolas, 'Courier New', monospace; font-size: 11px; color: #333; background-color: #f5f5f5; padding: 6px; border-radius: 4px; word-break: break-word;">
              ${queryItem.query}
            </code>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += `
      <div style="margin-top: 15px; padding: 12px; background-color: #e8f4f8; border-radius: 6px; font-size: 12px; color: #555;">
        <strong>Note:</strong> These queries were automatically generated and executed across multiple patent databases 
        to ensure comprehensive prior art coverage. The system uses advanced query optimization techniques including 
        classification-based refinement and citation network analysis.
      </div>
    </div>
    `;
  }

  return html;
};

  const handlePrintPdf = async () => {
  let analyzeData = null;
  try {
    const freshData = await fetchCurrentData();
    if (freshData && freshData.analyze_invention_data) {
      analyzeData = freshData.analyze_invention_data;
      console.log("[handlePrintPdf] Using fresh analyze data");
    } else if (analyzeInventionDataRef.current) {
      analyzeData = analyzeInventionDataRef.current;
      console.log("[handlePrintPdf] Using ref analyze data");
    } else {
      const storedData = localStorage.getItem("analyzeInventionData");
      if (storedData) {
        analyzeData = JSON.parse(storedData);
        console.log("[handlePrintPdf] Using localStorage analyze data");
      }
    }
  } catch (error) {
    console.error("[handlePrintPdf] Error fetching analyze data:", error);
  }

  const analyzeHTML = generateAnalyzeInventionHTML(analyzeData);
  
  // Simplified and direct logic to fetch the project title
  let projectTitle = "Untitled Project"; // Default value
  try {
    const projectId =
      localStorage.getItem("project_id") ||
      localStorage.getItem("selectedProject");

    if (projectId) {
      // Call the existing endpoint to get project data
      const response = await axios.get("/getProjectData", {
      params: { project_id: projectId },
    });
      
      // If the API call is successful and a title exists, use it
      if (response.data && response.data.project_title) {
        projectTitle = response.data.project_title;
        console.log(`[handlePrintPdf] Successfully fetched project title from Invention model: ${projectTitle}`);
      }
    }
  } catch (error) {
    console.error("[handlePrintPdf] Error fetching project title from Invention model. Using default.", error);
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site and try again.");
    return;
  }

  // Current date for report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>Ino360 Novelty Search Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body { 
            font-family: 'Roboto', Arial, sans-serif; 
            padding: 30px; 
            line-height: 1.5; 
            color: #333; 
            font-size: 12px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            border: 1px solid #eee;
            margin-bottom: 40px;
            page-break-after: always;
          }
          
          .logo {
            font-size: 52px;
            font-weight: 700;
            color: #36718b;
            margin-bottom: 10px;
            border-bottom: 2px solid #36718b;
            padding-bottom: 5px;
          }
          
          .report-title {
            font-size: 28px;
            font-weight: 500;
            color: #36718b;
            margin-bottom: 50px;
          }
          
          .project-info {
            margin: 40px 0;
            border: 1px solid #ddd;
            padding: 30px;
            border-radius: 10px;
            background-color: #f9f9f9;
            width: 60%;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 15px;
          }
          
          .info-label {
            font-weight: 500;
            width: 100px;
            color: #555;
            text-align: right;
            padding-right: 20px;
          }
          
          .info-value {
            flex: 1;
            font-weight: 400;
            color: #333;
            text-align: left;
          }
          
          .confidential {
            margin-top: 80px;
            color: #888;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .copyright {
            color: #888;
            font-size: 11px;
            margin-top: 10px;
          }
          
          .section-divider {
            border-top: 2px solid #36718b;
            margin: 30px 0;
          }
          
          h2 { 
            color: #36718b; 
            margin-top: 30px; 
            margin-bottom: 15px; 
            font-size: 20px; 
            font-weight: 500;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          }
          
          h3 { 
            color: #2196f3; 
            margin-top: 25px; 
            margin-bottom: 15px; 
            font-size: 16px; 
            font-weight: 500;
            background-color: #f5f7fa;
            padding: 8px 15px;
            border-left: 4px solid #2196f3;
          }
          
          h5 { 
            color: #333; 
            margin-top: 15px; 
            font-size: 14px; 
            font-weight: 500;
          }
          
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px; 
          }
          
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
            font-size: 12px; 
          }
          
          th {
            background-color: #36718b;
            color: white;
            font-weight: 500;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          pre { 
            white-space: pre-wrap; 
            background-color: #f5f5f5; 
            padding: 15px; 
            border-radius: 5px; 
            font-size: 12px;
            border: 1px solid #e0e0e0;
            line-height: 1.6;
          }
          
          a { 
            color: #2196f3; 
            text-decoration: none; 
          }
          
          .report-section { 
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          
          .section-heading { 
            border-bottom: 1px solid #eee; 
            padding-bottom: 8px; 
          }
          
          .patent-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 25px;
            overflow: hidden;
            page-break-inside: avoid;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .patent-header {
            background-color: #f5f7f9;
            padding: 15px;
            border-bottom: 1px solid #ddd;
          }
          
          .patent-body {
            padding: 15px;
          }
          
          .found-missing-container {
            display: flex;
            gap: 15px;
            margin: 15px 0;
          }
          
          .found-box {
            flex: 1;
            background-color: #e9f7ef;
            padding: 12px;
            border-radius: 5px;
            border-left: 4px solid #2ecc71;
          }
          
          .missing-box {
            flex: 1;
            background-color: #fef9e7;
            padding: 12px;
            border-radius: 5px;
            border-left: 4px solid #f39c12;
          }
          
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            margin: 10px 0;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
          <div class="logo">INO360</div>
          <div class="report-title">NOVELTY SEARCH REPORT</div>
          
          <div class="project-info">
            <div class="info-row">
              <div class="info-label">Title:</div>
              <div class="info-value">${projectTitle}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Project ID:</div>
              <div class="info-value">${projID}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Date:</div>
              <div class="info-value">${currentDate}</div>
            </div>
          </div>
          
          <div class="confidential">CONFIDENTIAL - FOR INTERNAL USE ONLY</div>
          <div class="copyright">© ${new Date().getFullYear()} Ino360 - All Rights Reserved</div>
        </div>
        
        <!-- Main Report Content -->
        <div class="report-section">
          <h2>Key Features and Analysis</h2>
          <div>${editorContent}</div>
        </div>
        
        <div class="section-divider"></div>
        
        <div class="report-section">
          ${analyzeHTML}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    try {
      printWindow.print();
      console.log("[handlePrintPdf] Print dialog opened");
    } catch (error) {
      console.error("[handlePrintPdf] Error triggering print:", error);
      alert("Failed to open print dialog. Please try again.");
    }
  };

  setTimeout(() => {
    try {
      if (
        !printWindow.document.readyState ||
        printWindow.document.readyState === "complete"
      ) {
        printWindow.print();
      }
    } catch (error) {
      console.error("[handlePrintPdf] Fallback print error:", error);
      alert("Failed to print. Please try again.");
    }
  }, 3000);

  setShowDownloadOptions(false);
};

  const createBorderSeparator = () => {
    return new Paragraph({
      children: [
        new TextRun({
          text: "────────────────────────────────────────────────────────────",
          color: "36718b",
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    });
  };

  // Helper function to create a section header for DOCX
  const createSectionHeader = (text) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 28, // 14pt
          color: "36718b",
        }),
      ],
      spacing: { before: 400, after: 100 },
      borders: {
        bottom: { color: "CCCCCC", style: BorderStyle.SINGLE, size: 10 },
      },
    });
  };

  // Helper function to create a styled subheader for DOCX
  const createSubHeader = (text) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 24, // 12pt
          color: "2196f3",
        }),
      ],
      spacing: { before: 300, after: 100 },
      shading: {
        type: "solid",
        color: "f5f7fa",
      },
      border: {
        left: {
          color: "2196f3",
          style: BorderStyle.SINGLE,
          size: 16,
        },
      },
      indent: { left: 120 },
    });
  };

  // Helper function for patent card section
  const createPatentCard = (patentId, title, isStart = false) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: `Search Result ID: ${patentId}`,
          bold: true,
          size: 24, // 12pt
        }),
      ],
      spacing: { before: isStart ? 0 : 400, after: 100 },
      borders: {
        top: { color: "DDDDDD", style: BorderStyle.SINGLE, size: 10 },
      },
      pageBreakBefore: isStart ? false : true,
    });
  };

  const handleDownloadDocx = async () => {
  try {
    const quill = quillRef.current.getEditor();
    const textContent = quill.getText();
    const lines = textContent
      .split("\n")
      .filter((line) => line.trim() !== "");
    
    const paragraphs = [];
    
    // Get current date for cover page
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Simplified and direct logic to fetch the project title, same as in handlePrintPdf
    let projectTitle = "Untitled Project"; // Default value
    try {
      const projectId =
        localStorage.getItem("project_id") ||
        localStorage.getItem("selectedProject");

      if (projectId) {
        // Call the existing endpoint to get project data
        const response = await axios.get("/getProjectData", {
        params: { project_id: projectId },
      });
        
        // If the API call is successful and a title exists, use it
        if (response.data && response.data.project_title) {
          projectTitle = response.data.project_title;
          console.log(`[handleDownloadDocx] Successfully fetched project title from Invention model: ${projectTitle}`);
        }
      }
    } catch (error) {
      console.error("[handleDownloadDocx] Error fetching project title from Invention model. Using default.", error);
    }
    
    // Create an enhanced cover page with better design
    const coverPage = [
      // Top decorative border
      createBorderSeparator(),
      
      // Report title with large stylized formatting
      new Paragraph({
        children: [
          new TextRun({
            text: "INO360",
            bold: true,
            size: 52,
            color: "36718b", // Blue color
            underline: {
              type: UnderlineType.SINGLE,
              color: "36718b",
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 },
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: "NOVELTY SEARCH REPORT",
            bold: true,
            size: 36,
            color: "36718b",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 300 },
      }),
      
      // Decorative line
      createBorderSeparator(),
      
      // Project information section
      new Paragraph({
        children: [
          new TextRun({
            text: "PROJECT INFORMATION",
            bold: true,
            size: 28,
            color: "404040",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
      
      // Project title
      new Paragraph({
        children: [
          new TextRun({
            text: "Title: ",
            bold: true,
            size: 24,
            color: "404040",
          }),
          new TextRun({
            text: projectTitle,
            size: 24,
            color: "404040",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
      }),
      
      // Project ID
      new Paragraph({
        children: [
          new TextRun({
            text: "Project ID: ",
            bold: true,
            size: 24,
            color: "404040",
          }),
          new TextRun({
            text: projID,
            size: 24,
            color: "404040",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 100 },
      }),
      
      // Date
      new Paragraph({
        children: [
          new TextRun({
            text: "Date: ",
            bold: true,
            size: 24,
            color: "404040",
          }),
          new TextRun({
            text: formattedDate,
            size: 24,
            color: "404040",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
      }),
      
      // Descriptive tagline
      new Paragraph({
        children: [
          new TextRun({
            text: "Comprehensive prior art analysis with detailed feature mapping",
            italic: true,
            size: 24,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      }),
      
      // Bottom decorative border
      createBorderSeparator(),
      
      // Footer note
      new Paragraph({
        children: [
          new TextRun({
            text: "CONFIDENTIAL - FOR INTERNAL USE ONLY",
            bold: true,
            size: 20,
            color: "808080",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 500, after: 0 },
      }),
      
      // Copyright text
      new Paragraph({
        children: [
          new TextRun({
            text: "© " + new Date().getFullYear() + " Ino360 - All Rights Reserved",
            size: 20,
            color: "808080",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 0 },
      }),
      
      // Add page break after cover page
      new Paragraph({
        children: [],
        pageBreakBefore: true,
      })
    ];
    
    // Add cover page to paragraphs
    paragraphs.push(...coverPage);

    // Add section header for Key Features
    paragraphs.push(createSectionHeader("Key Features and Analysis"));

    // Process document content
    lines.forEach((line) => {
      const isHeading =
        /^(Summary|Key Features|Problem Statement|Solution Statement|Novelty Statement|Advantages of the Invention|Potential Industrial Applications|Key Innovators)/i.test(
          line
        );
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: isHeading,
              size: isHeading ? 28 : 24, // 14pt or 12pt
              color: isHeading ? "36718b" : "000000",
            }),
          ],
          spacing: {
            before: isHeading ? 400 : 200,
            after: isHeading ? 200 : 100,
          },
          ...(isHeading ? {
            borders: {
              bottom: { color: "CCCCCC", style: BorderStyle.SINGLE, size: 5 },
            }
          } : {})
        })
      );
      if (isHeading)
        paragraphs.push(new Paragraph({ spacing: { after: 200 } }));
    });

    // Add a section break before the analysis section
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "",
          }),
        ],
        spacing: { before: 400, after: 0 },
        border: {
          top: {
            color: "36718b",
            style: BorderStyle.SINGLE,
            size: 16,
          },
        },
      })
    );

    let analyzeData = null;
    try {
      const freshData = await fetchCurrentData();
      if (freshData && freshData.analyze_invention_data) {
        analyzeData = freshData.analyze_invention_data;
        console.log(
          "[handleDownloadDocx] Using fresh analyze data:",
          analyzeData
        );
      } else if (analyzeInventionDataRef.current) {
        analyzeData = analyzeInventionDataRef.current;
        console.log(
          "[handleDownloadDocx] Using ref analyze data:",
          analyzeData
        );
      } else {
        const storedData = localStorage.getItem("analyzeInventionData");
        if (storedData) {
          analyzeData = JSON.parse(storedData);
          console.log(
            "[handleDownloadDocx] Using localStorage analyze data:",
            analyzeData
          );
        }
      }
    } catch (error) {
      console.error("[handleDownloadDocx] Error fetching fresh data:", error);
    }

    if (analyzeData) {
      // Add Novelty Search Analysis section header
      paragraphs.push(createSectionHeader("Novelty Search Analysis"));

      // Relevant Search Results - Use comparisons directly (all 10 patents)
      if (analyzeData.comparisons && Array.isArray(analyzeData.comparisons)) {
        paragraphs.push(createSubHeader(`Relevant Search Results (${analyzeData.comparisons.length})`));

        analyzeData.comparisons.forEach((comparison, index) => {
          const patentId = comparison.patentId;
          const simplifiedId = extractPatentNumber(patentId);
          const details = comparison.details || {};

          // Add a page break for each patent (except the first one)
          const isFirstPatent = index === 0;
          
          // Patent header
          paragraphs.push(createPatentCard(simplifiedId, details.title || "No title available", isFirstPatent));
          
          // Title
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: "Title", bold: true, size: 24 })],
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: details.title || "No title available", 
                  size: 24,
                  color: "333333" 
                })
              ],
              spacing: { after: 100 },
            })
          );
          
          // Found Features section with styling
          if (comparison.foundSummary) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Coverage Identified: ", 
                    bold: true, 
                    color: "2ecc71",
                    size: 24
                  }),
                  new TextRun({ 
                    text: comparison.foundSummary,
                    size: 24
                  })
                ],
                spacing: { before: 100, after: 100 },
                shading: {
                  type: "solid",
                  color: "e9f7ef",
                },
                border: {
                  left: {
                    color: "2ecc71",
                    style: BorderStyle.SINGLE,
                    size: 16,
                  }
                },
                indent: { left: 240 },
                margins: { left: 240 }
              })
            );
          }
          
          // Abstract/Snippet
          if (details.abstract || details.snippet) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Abstract",
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 100, after: 50 },
              })
            );
            
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: details.abstract || details.snippet, 
                    size: 24,
                    color: "555555"
                  })
                ],
                spacing: { after: 100 },
                shading: {
                  type: "solid",
                  color: "f9f9f9",
                },
                border: {
                  left: {
                    color: "dddddd",
                    style: BorderStyle.SINGLE,
                    size: 8,
                  }
                },
                indent: { left: 240 },
              })
            );
          }
          
          // Patent metadata
          if (details.filing_date || details.assignee) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      details.filing_date
                        ? `Filing Date: ${details.filing_date}`
                        : ""
                    }${
                      details.assignee
                        ? `    Assignee: ${details.assignee}`
                        : ""
                    }`,
                    size: 24,
                    color: "666666"
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
          
          if (details.inventor) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Inventor: ${details.inventor}`, 
                    size: 24,
                    color: "666666"
                  })
                ],
                spacing: { after: 200 },
              })
            );
          }

          // Matrix header
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Key Features vs ${simplifiedId} Matrix`,
                  bold: true,
                  size: 24,
                  color: "36718b"
                }),
              ],
              spacing: { before: 200, after: 100 },
              borders: {
                bottom: { color: "DDDDDD", style: BorderStyle.SINGLE, size: 5 },
              },
            })
          );
          
          // Matrix table with improved styling
          const matrixData = comparison.matrix
            ? parseMarkdownTable(comparison.matrix)
            : { headers: [], rows: [] };
          
          if (matrixData.headers.length > 0) {
            const tableRows = [
              new TableRow({
                children: matrixData.headers.map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: header, 
                              bold: true, 
                              size: 24,
                              color: "FFFFFF"
                            }),
                          ],
                        }),
                      ],
                      shading: {
                        type: "solid",
                        color: "36718b",
                      },
                    })
                ),
              }),
              ...matrixData.rows.map(
                (row, rowIndex) =>
                  new TableRow({
                    children: row.map(
                      (cell, cellIndex) =>
                        new TableCell({
                          children: [
                            new Paragraph({ 
                              children: [
                                new TextRun({ 
                                  text: cell, 
                                  size: 24,
                                  color: cellIndex === row.length - 1 && (
                                    cell.includes('Considerable') ? '2ecc71' : 
                                    (cell.includes('Partial') ? 'f39c12' : '333333')
                                  ),
                                  bold: cellIndex === row.length - 1 && (
                                    cell.includes('Considerable') || cell.includes('Partial')
                                  )
                                }),
                              ],
                            }),
                          ],
                          shading: {
                            type: "solid",
                            color: rowIndex % 2 === 0 ? "FFFFFF" : "f9f9f9",
                          },
                        })
                    ),
                  })
              ),
            ];
            
            paragraphs.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                }
              })
            );
          }

          // Excerpts
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Relevant Excerpts from ${simplifiedId}`,
                  bold: true,
                  size: 24,
                  color: "36718b"
                }),
              ],
              spacing: { before: 200, after: 100 },
              borders: {
                bottom: { color: "DDDDDD", style: BorderStyle.SINGLE, size: 5 },
              },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: comparison.excerpts || "No excerpts available",
                  size: 24,
                  color: "444444"
                }),
              ],
              spacing: { after: 200 },
              shading: {
                type: "solid",
                color: "f5f5f5",
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              },
              indent: { left: 240 },
            })
          );
        });
      }

      // Additional Search Results with updated logic
      if (analyzeData.patentResults && Array.isArray(analyzeData.patentResults)) {
        // Get the patent IDs that are already shown in relevant results
        const shownPatentIds = analyzeData.comparisons.map(c => extractPatentNumber(c.patentId));
        
        // Filter scholar results (max 2)
        const scholarResults = analyzeData.patentResults
          .filter((result) => result.is_scholar)
          .slice(0, 2);
        
        // Filter additional patents (not shown in relevant, max 18)
        const additionalPatents = analyzeData.patentResults
          .filter((result) => {
            if (result.is_scholar) return false;
            const patentNumber = extractPatentNumber(result.patent_id);
            return !shownPatentIds.includes(patentNumber);
          })
          .slice(0, 18);
        
        const combinedResults = [...scholarResults, ...additionalPatents];
        
        // Add page break before Additional Search Results
        paragraphs.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          })
        );
        
        // Section header for Additional Search Results
        paragraphs.push(createSubHeader(`Additional Search Results (${combinedResults.length})`));

        // Create a 2-column table for additional results for better layout
        const resultRows = [];
        
        // Process results in pairs for the table
        for (let i = 0; i < combinedResults.length; i += 2) {
          const result1 = combinedResults[i];
          const result2 = i + 1 < combinedResults.length ? combinedResults[i + 1] : null;
          
          const cells = [createResultTableCell(result1, scholarResults)];
          
          if (result2) {
            cells.push(createResultTableCell(result2, scholarResults));
          } else {
            cells.push(new TableCell({
              children: [new Paragraph({ text: "" })],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            }));
          }
          
          resultRows.push(new TableRow({ children: cells }));
        }
        
        if (resultRows.length > 0) {
          paragraphs.push(
            new Table({
              rows: resultRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
              },
              columnWidths: [50, 50],
            })
          );
        } else {
          // Fallback to normal paragraphs if we don't have enough results for a table
          combinedResults.forEach((result) => {
            processResult(result, paragraphs, scholarResults);
          });
        }
      }

      // Search Strategy Section
      if (analyzeData.searchQueries && Array.isArray(analyzeData.searchQueries)) {
        // Add page break before Search Strategy
        paragraphs.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          })
        );
        
        paragraphs.push(createSubHeader("Search Strategy & Queries Used"));
        
        // Group queries by step
        const groupedQueries = analyzeData.searchQueries.reduce((acc, query) => {
          if (!acc[query.step]) {
            acc[query.step] = [];
          }
          acc[query.step].push(query);
          return acc;
        }, {});
        
        Object.entries(groupedQueries).forEach(([step, queries]) => {
          // Step header
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: step,
                  bold: true,
                  size: 24,
                  color: "36718b",
                }),
              ],
              spacing: { before: 200, after: 100 },
              borders: {
                bottom: { color: "DDDDDD", style: BorderStyle.SINGLE, size: 5 },
              },
            })
          );
          
          // Create table for queries
          const queryRows = queries.map((queryItem) => {
            const badgeColor = queryItem.type === "Primary Search" ? "2196f3" : 
                              queryItem.type === "Expanded Search" ? "4caf50" : 
                              "ff9800";
            
            return new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: queryItem.type,
                          bold: true,
                          size: 22,
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  shading: {
                    type: "solid",
                    color: badgeColor,
                  },
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: queryItem.query,
                          size: 22,
                          font: "Consolas",
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    type: "solid",
                    color: "f5f5f5",
                  },
                  width: { size: 80, type: WidthType.PERCENTAGE },
                }),
              ],
            });
          });
          
          paragraphs.push(
            new Table({
              rows: queryRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              },
            })
          );
          
          paragraphs.push(new Paragraph({ spacing: { after: 200 } }));
        });
        
        // Add note
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Note: ",
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: "These queries were automatically generated and executed across multiple patent databases to ensure comprehensive prior art coverage. The system uses advanced query optimization techniques including classification-based refinement and citation network analysis.",
                size: 22,
                color: "555555",
              }),
            ],
            spacing: { before: 200, after: 200 },
            shading: {
              type: "solid",
              color: "e8f4f8",
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            },
            indent: { left: 240, right: 240 },
          })
        );
      }
    }

    // Create the document with headers and footers for page numbers
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Ino360 Novelty Search Report",
                    size: 20,
                    color: "666666",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun("Page "),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                  }),
                  new TextRun(" of "),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
      }],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `searchReport-${projID}.docx`;
        link.click();
        setShowDownloadOptions(false);
      })
      .catch((error) => {
        console.error(
          "[handleDownloadDocx] Error creating DOCX file:",
          error
        );
        alert("Failed to create DOCX file. Please try again.");
      });
  } catch (error) {
    console.error("[handleDownloadDocx] Error:", error);
    alert("There was an error during download. Please try again.");
  }
};

  // Helper function to create a result cell for the additional results table
function createResultTableCell(result, scholarResults) {
  if (!result) return new TableCell({ children: [new Paragraph({ text: "" })] });
  
  const isScholar = result.is_scholar;
  let simplifiedId;
  
  if (isScholar) {
    const scholarIndex = scholarResults.indexOf(result) + 1;
    simplifiedId = `Scholar Res ${scholarIndex}`;
  } else {
    simplifiedId = extractPatentNumber(result.patent_id);
  }
  
  const cellChildren = [
    new Paragraph({
      children: [
        new TextRun({
          text: `${isScholar ? "Scholar Result" : "Search Result ID"}: `,
          bold: true,
          size: 24,
        }),
        new TextRun({
          text: simplifiedId,
          size: 24,
          color: "2196f3",
        }),
      ],
      spacing: { before: 120, after: 80 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({ 
          text: "Title: ", 
          bold: true, 
          size: 24 
        }),
        new TextRun({ 
          text: result.title || "No title available", 
          size: 24 
        }),
      ],
      spacing: { after: 80 },
    }),
  ];
  
  if (result.snippet) {
    cellChildren.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: result.snippet, 
            size: 24,
            color: "666666" 
          }),
        ],
        spacing: { after: 80 },
        shading: {
          type: "solid",
          color: "f9f9f9",
        },
      })
    );
  }
  
  // Add metadata
  const metaInfo = [];
  
  if (isScholar && result.publication_date) {
    metaInfo.push(`Publication Date: ${result.publication_date}`);
  } else if (!isScholar && result.filing_date) {
    metaInfo.push(`Filing Date: ${result.filing_date}`);
  }
  
  if (isScholar && result.author) {
    metaInfo.push(`Author: ${result.author}`);
  } else if (!isScholar && result.assignee) {
    metaInfo.push(`Assignee: ${result.assignee}`);
  }
  
  if (!isScholar && result.inventor) {
    metaInfo.push(`Inventor: ${result.inventor}`);
  }
  
  if (metaInfo.length > 0) {
    cellChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metaInfo.join(" | "),
            size: 24,
            color: "777777",
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }
  
  return new TableCell({
    children: cellChildren,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    width: { size: 50, type: WidthType.PERCENTAGE },
    margins: {
      top: 100,
      bottom: 100,
      left: 300,
      right: 300,
    },
  });
}

// Helper function to process a single result
function processResult(result, paragraphs, scholarResults) {
  const isScholar = result.is_scholar;
  let simplifiedId;
  
  if (isScholar) {
    const scholarIndex = scholarResults.indexOf(result) + 1;
    simplifiedId = `Scholar Res ${scholarIndex}`;
  } else {
    simplifiedId = extractPatentNumber(result.patent_id);
  }

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${
            isScholar ? "Scholar Result" : "Search Result ID"
          }: ${simplifiedId}`,
          bold: true,
          size: 24,
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Title", bold: true, size: 24 })],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [new TextRun({ text: result.title || "No title available", size: 24 })],
      spacing: { after: 100 },
    })
  );
  
  if (result.snippet) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: result.snippet, size: 24 })],
        spacing: { after: 100 },
      })
    );
  }
  
  if (
    (isScholar && result.publication_date) ||
    (!isScholar && result.filing_date) ||
    (isScholar && result.author) ||
    (!isScholar && result.assignee)
  ) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${
              isScholar && result.publication_date
                ? `Publication Date: ${result.publication_date}`
                : !isScholar && result.filing_date
                ? `Filing Date: ${result.filing_date}`
                : ""
            }${
              isScholar && result.author
                ? `    Author: ${result.author}`
                : !isScholar && result.assignee
                ? `    Assignee: ${result.assignee}`
                : ""
            }`,
            size: 24
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }
  
  if (!isScholar && result.inventor) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `Inventor: ${result.inventor}`, size: 24 })],
        spacing: { after: 200 },
      })
    );
  }
}

  // Helper function to process a single result
  function processResult(result, paragraphs) {
    const isScholar = result.is_scholar;
    let simplifiedId = isScholar
      ? `Scholar Res ${scholarResults.indexOf(result) + 1}`
      : extractPatentNumber(result.patent_id);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${
              isScholar ? "Scholar Result" : "Search Result ID"
            }: ${simplifiedId}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Title", bold: true, size: 24 })],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [new TextRun({ text: result.title || "No title available", size: 24 })],
        spacing: { after: 100 },
      })
    );
    
    if (result.snippet) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: result.snippet, size: 24 })],
          spacing: { after: 100 },
        })
      );
    }
    
    if (
      (isScholar && result.publication_date) ||
      (!isScholar && result.filing_date) ||
      (isScholar && result.author) ||
      (!isScholar && result.assignee)
    ) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${
                isScholar && result.publication_date
                  ? `Publication Date: ${result.publication_date}`
                  : !isScholar && result.filing_date
                  ? `Filing Date: ${result.filing_date}`
                  : ""
              }${
                isScholar && result.author
                  ? `    Author: ${result.author}`
                  : !isScholar && result.assignee
                  ? `    Assignee: ${result.assignee}`
                  : ""
              }`,
              size: 24
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
    
    if (!isScholar && result.inventor) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `Inventor: ${result.inventor}`, size: 24 })],
          spacing: { after: 200 },
        })
      );
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  // Preserve most of the code, only changing the return statement
  return (
    <div id="PatentDrafting" className="mb-5">
      <h1 className="head-stl" style={{ color: "#36718b", display: "none" }}>
        Patent Drafting
      </h1>
      <ReactQuill
        ref={quillRef}
        value={editorContent}
        onChange={handleChange}
        modules={modules}
        style={{ display: "none" }}
      />
      <div className="relative" style={{ display: "inline" }}>
        <button
          ref={triggerRef}
          className="btn-stl-4 w-auto"
          onClick={() => setShowDownloadOptions(!showDownloadOptions)}
        >
          <span>
            <b
              style={{ fontSize: "13px", fontWeight: "700", color: "#4e4e4e" }}
            >
              Download Search Report
            </b>
          </span>
          <span className="ms-1" style={{ color: "#4e4e4e" }}>
            ▼
          </span>
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
              width: "90px",
            }}
          >
            <ul
              style={{
                paddingLeft: "0rem",
                marginBottom: "0rem",
                display: "flex",
              }}
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
                  borderRight: "1px solid #dfdcdc",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f7fafc")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Download as PDF"
              >
                <FaFilePdf style={{ color: "#e53e3e", fontSize: "20px" }} />
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
                  (e.currentTarget.style.backgroundColor = "#f7fafc")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Download as DOCX"
              >
                <FaFileWord style={{ color: "#2b6cb0", fontSize: "20px" }} />
              </li>
            </ul>
          </div>
        )}
      </div>

      <button
        className="btn-stl-4 w-auto"
        onClick={() => navigate("/provisioDraft")}
        style={{
          fontSize: "13px",
          color: "rgb(80, 79, 79)",
        }}
      >
        <b style={{ fontSize: "13px", fontWeight: "700" }}>
          Generate Provisional Draft
        </b>
      </button>
      <button
        className="btn-stl-4 w-auto"
        onClick={() => navigate("/draftMaster")}
        style={{
          fontSize: "13px",
          color: "rgb(80, 79, 79)",
        }}
      >
        <b style={{ fontSize: "13px", fontWeight: "700" }}>
          Generate Non-Provisional Draft
        </b>
      </button>
      <button
        className="btn-stl-4 w-auto"
        onClick={() => setShowConsultModal(true)}
      >
        <b
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "rgb(80, 79, 79)",
          }}
        >
          Collab with anovIP
        </b>
      </button>

      <Consult show={showConsultModal} handleClose={handleCloseConsultModal} />
    </div>
  );
};

export default PatentDraftingInno;
