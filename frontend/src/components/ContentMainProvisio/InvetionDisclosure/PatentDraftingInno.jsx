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
      <h2 style="color: #36718b; margin: 5px 0; font-weight: 600; font-size: 20px; letter-spacing: 0.5px;">NOVELTY SEARCH ANALYSIS</h2>
    </div>
  `;

  // Relevant Search Results - Use comparisons directly (10 patents)
  if (analyzeData.comparisons && Array.isArray(analyzeData.comparisons)) {
    html += `
      <div style="background: linear-gradient(to right, #e3f2fd, #f5f5f5); border-left: 5px solid #2196f3; padding: 12px 18px; margin: 25px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);">
        <h3 style="color: #1976d2; margin: 0; font-weight: 600; font-size: 18px; display: flex; align-items: center;">
          <span style="margin-right: 10px;">📊</span>
          Relevant Search Results 
          <span style="background-color: #1976d2; color: white; padding: 3px 10px; margin-left: 15px; border-radius: 15px; font-size: 14px; font-weight: 500;">${analyzeData.comparisons.length}</span>
        </h3>
      </div>
    `;

    analyzeData.comparisons.forEach((comparison, index) => {
      const patentId = comparison.patentId;
      const simplifiedId = extractPatentNumber(patentId);
      const details = comparison.details || {};

      html += `
        <div style="border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 35px; overflow: hidden; transition: box-shadow 0.3s ease;">
          <!-- Compact Patent Header -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 12px 20px; border-bottom: 1px solid #dee2e6;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 20px;">📄</span>
                <a href="https://patents.google.com/patent/${simplifiedId}" target="_blank" style="color: #1976d2; text-decoration: none; font-weight: 600; font-size: 15px; hover: text-decoration: underline;">${simplifiedId}</a>
                ${details.assignee ? `<span style="color: #666; font-size: 13px; border-left: 1px solid #ccc; padding-left: 15px;">${details.assignee}</span>` : ""}
                ${details.filing_date ? `<span style="color: #666; font-size: 13px;">${details.filing_date.split('-')[0]}</span>` : ""}
              </div>
              ${
                comparison.rank
                  ? `<div style="background: linear-gradient(135deg, #36718b, #4a90a4); color: white; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(54, 113, 139, 0.3);">Rank #${comparison.rank}</div>`
                  : ""
              }
            </div>
          </div>
          
          <!-- Patent Content with improved spacing -->
          <div style="padding: 20px 25px;">
            <h4 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 16px; font-weight: 600; line-height: 1.4;">${
              details.title || "No title available"
            }</h4>
            
            <!-- Coverage Section with better visual -->
            ${
              comparison.foundSummary
                ? `
              <div style="background: linear-gradient(to right, #e8f5e9, #f1f8f2); padding: 14px 18px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 18px;">
                <div style="display: flex; align-items: start; gap: 10px;">
                  <span style="color: #2e7d32; font-size: 18px; margin-top: 2px;">✓</span>
                  <div>
                    <strong style="color: #2e7d32; display: block; margin-bottom: 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Coverage Identified</strong>
                    <p style="margin: 0; font-size: 13px; color: #1b5e20; line-height: 1.6;">${comparison.foundSummary}</p>
                  </div>
                </div>
              </div>`
                : ""
            }
            
            <!-- Abstract Section with better typography -->
            ${
              details.abstract || details.snippet
                ? `
              <div style="background-color: #fafafa; padding: 14px 18px; border-radius: 8px; margin-bottom: 18px; border: 1px solid #e8e8e8;">
                <strong style="color: #616161; display: block; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Abstract</strong>
                <p style="margin: 0; font-size: 13px; color: #424242; line-height: 1.7; text-align: justify;">${details.abstract || details.snippet}</p>
              </div>`
                : ""
            }
            
            <!-- Compact Meta Information -->
            <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 12px; color: #666; padding: 8px 0;">
              ${details.filing_date ? `<span><strong>Filed:</strong> ${details.filing_date}</span>` : ""}
              ${details.inventor ? `<span><strong>Inventor:</strong> ${details.inventor}</span>` : ""}
            </div>
          </div>
          
          <!-- Feature Matrix Section with enhanced styling -->
          <div style="background-color: #f8f9fa; border-top: 1px solid #e9ecef; padding: 20px 25px;">
            <h4 style="margin: 0 0 18px 0; color: #36718b; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">🔍</span>
              Feature Comparison Matrix
            </h4>
            
            <!-- Matrix Table with better styling -->
            <div style="overflow-x: auto; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      `;

      // Matrix data
      const matrixData = comparison.matrix
        ? parseMarkdownTable(comparison.matrix)
        : { headers: [], rows: [] };
      
      if (matrixData.headers.length > 0) {
        html += `
          <table style="border-collapse: collapse; width: 100%; font-size: 13px; background: white;">
            <thead>
              <tr>
                ${matrixData.headers
                  .map(
                    (header) => `
                  <th style="border: 1px solid #dee2e6; padding: 12px; background: linear-gradient(to bottom, #36718b, #2d5a73); color: white; text-align: left; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">${header}</th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${matrixData.rows
                .map(
                  (row, rowIndex) => `
                <tr style="background-color: ${rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa'}; transition: background-color 0.2s;">
                  ${row
                    .map(
                      (cell, cellIndex) => `
                    <td style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 12px; line-height: 1.5; ${cellIndex === row.length - 1 && (cell.includes('Considerable') ? 'color: #2e7d32; font-weight: 600; background-color: #e8f5e9;' : (cell.includes('Partial') ? 'color: #f57c00; font-weight: 600; background-color: #fff3e0;' : ''))}">${cell}</td>
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
            
            <!-- Excerpts Section with better design -->
            <h4 style="margin: 28px 0 15px 0; color: #36718b; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">📝</span>
              Relevant Excerpts
            </h4>
            <div style="background-color: #f5f7fa; border: 1px solid #d1d9e6; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; color: #34495e; max-height: 250px; overflow-y: auto; font-family: 'Roboto', sans-serif;">
              ${comparison.excerpts || "No excerpts available"}
            </div>
          </div>
        </div>
      `;
    });
  }

  // Additional Search Results Section with improved grid
  if (analyzeData.patentResults && Array.isArray(analyzeData.patentResults)) {
    const shownPatentIds = analyzeData.comparisons ? analyzeData.comparisons.map(c => extractPatentNumber(c.patentId)) : [];
    
    const scholarResults = analyzeData.patentResults
      .filter((result) => result.is_scholar)
      .slice(0, 2);
    
    const additionalPatents = analyzeData.patentResults
      .filter((result) => {
        if (result.is_scholar) return false;
        const patentNumber = extractPatentNumber(result.patent_id);
        return !shownPatentIds.includes(patentNumber);
      })
      .slice(0, 18);
    
    const combinedResults = [...scholarResults, ...additionalPatents];
    
    if (combinedResults.length > 0) {
      html += `
        <div style="background: linear-gradient(to right, #e3f2fd, #f5f5f5); border-left: 5px solid #2196f3; padding: 12px 18px; margin: 35px 0 25px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);">
          <h3 style="color: #1976d2; margin: 0; font-weight: 600; font-size: 18px; display: flex; align-items: center;">
            <span style="margin-right: 10px;">📚</span>
            Additional Search Results
            <span style="background-color: #1976d2; color: white; padding: 3px 10px; margin-left: 15px; border-radius: 15px; font-size: 14px; font-weight: 500;">${combinedResults.length}</span>
          </h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-bottom: 35px;">
      `;

      let scholarCounter = 0;
      combinedResults.forEach((result) => {
        const isScholar = result.is_scholar;
        if (isScholar) scholarCounter++;
        
        const simplifiedId = isScholar
          ? `Scholar ${scholarCounter}`
          : extractPatentNumber(result.patent_id);
        const link = isScholar
          ? result.scholar_link || "#"
          : `https://patents.google.com/patent/${extractPatentNumber(result.patent_id)}`;

        html += `
          <div style="border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; hover: transform: translateY(-2px);">
            <!-- Result Header with icon -->
            <div style="background: ${isScholar ? 'linear-gradient(135deg, #fff8e1, #ffecb3)' : 'linear-gradient(135deg, #f5f7f9, #e9ecef)'}; padding: 12px 16px; border-bottom: 1px solid ${isScholar ? '#ffe082' : '#dee2e6'};">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">${isScholar ? '🔬' : '📄'}</span>
                <a href="${link}" target="_blank" style="color: #1976d2; text-decoration: none; font-weight: 600; font-size: 14px; flex: 1;">
                  ${simplifiedId}
                </a>
              </div>
            </div>
            
            <!-- Result Content with better spacing -->
            <div style="padding: 16px;">
              <h5 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px; font-weight: 600; line-height: 1.4;">
                ${result.title || "No title available"}
              </h5>
              
              ${
                result.snippet
                  ? `
                <div style="margin-bottom: 12px; font-size: 12px; color: #5a6c7d; background-color: #f8f9fa; padding: 10px; border-radius: 6px; line-height: 1.6;">
                  ${result.snippet}
                </div>`
                  : ""
              }
              
              <!-- Compact Meta Information -->
              <div style="font-size: 11px; color: #7a8b9a; line-height: 1.8;">
                ${
                  isScholar && result.publication_date
                    ? `<div><strong>Published:</strong> ${result.publication_date}</div>`
                    : ""
                }
                ${
                  !isScholar && result.filing_date
                    ? `<div><strong>Filed:</strong> ${result.filing_date}</div>`
                    : ""
                }
                ${
                  isScholar && result.author
                    ? `<div><strong>Authors:</strong> ${result.author}</div>`
                    : ""
                }
                ${
                  !isScholar && result.assignee
                    ? `<div><strong>Assignee:</strong> ${result.assignee}</div>`
                    : ""
                }
              </div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
  }

  // Search Strategy Section with orange theme
  if (analyzeData.searchQueries && Array.isArray(analyzeData.searchQueries)) {
    html += `
      <div style="background: linear-gradient(to right, #fff3e0, #f5f5f5); border-left: 5px solid #ff9800; padding: 12px 18px; margin: 35px 0 25px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(255, 152, 0, 0.1);">
        <h3 style="color: #f57c00; margin: 0; font-weight: 600; font-size: 18px; display: flex; align-items: center;">
          <span style="margin-right: 10px;">🔍</span>
          Search Strategy & Queries Used
        </h3>
      </div>
      <div style="margin-bottom: 35px;">
    `;
    
    const groupedQueries = analyzeData.searchQueries.reduce((acc, query) => {
      if (!acc[query.step]) {
        acc[query.step] = [];
      }
      acc[query.step].push(query);
      return acc;
    }, {});
    
    Object.entries(groupedQueries).forEach(([step, queries]) => {
      html += `
        <div style="margin-bottom: 22px; padding: 18px; background-color: #fafafa; border-radius: 10px; border: 1px solid #e9ecef; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h4 style="color: #2c5282; font-size: 15px; font-weight: 600; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
            ${step}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
      `;
      
      queries.forEach((queryItem, index) => {
        const badgeColor = queryItem.type === "Primary Search" ? "#2196f3" : 
                          queryItem.type === "Expanded Search" ? "#4caf50" : 
                          "#ff9800";
        
        html += `
          <div style="display: flex; align-items: flex-start; gap: 12px; background-color: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
            <span style="background-color: ${badgeColor}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; white-space: nowrap; margin-top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
              ${queryItem.type}
            </span>
            <code style="flex: 1; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; color: #2d3748; background-color: #f7fafc; padding: 8px 12px; border-radius: 6px; word-break: break-word; line-height: 1.5;">
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
      <div style="margin-top: 20px; padding: 14px 18px; background: linear-gradient(to right, #e8f4f8, #f0f9ff); border-radius: 8px; font-size: 13px; color: #2c5282; line-height: 1.7; border-left: 3px solid #3182ce;">
        <strong style="font-weight: 600;">Note:</strong> These queries were automatically generated and executed across multiple patent databases 
        to ensure comprehensive prior art coverage. The system uses advanced query optimization techniques including 
        classification-based refinement and citation network analysis.
      </div>
    </div>
    `;
  }

  // Results Summary Section with gray theme
  html += `
    <div style="background: linear-gradient(to right, #f5f5f5, #eeeeee); border-left: 5px solid #6c757d; padding: 12px 18px; margin: 35px 0 25px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(108, 117, 125, 0.1);">
      <h3 style="color: #495057; margin: 0; font-weight: 600; font-size: 18px; display: flex; align-items: center;">
        <span style="margin-right: 10px;">📋</span>
        Results Summary
      </h3>
    </div>
    <p style="color: #6c757d; margin: 0 0 18px 0; font-size: 14px; font-style: italic;">
      Consolidated list of all the analyzed patents and NPLs
    </p>
  `;

  if (analyzeData.patentResults && analyzeData.comparisons) {
    const relevantPatentIds = analyzeData.comparisons.map(c => c.patentId);
    const relevantResults = relevantPatentIds
      .map((patentId) =>
        analyzeData.patentResults.find(
          (res) => res.patent_id === patentId
        )
      )
      .filter(Boolean);

    const scholarResults = analyzeData.patentResults
      .filter((result) => result.is_scholar)
      .slice(0, 2);
      
    const additionalPatents = analyzeData.patentResults
      .filter((result) => {
        if (result.is_scholar) return false;
        const resultPatentNumber = extractPatentNumber(result.patent_id);
        const shownPatentNumbers = relevantPatentIds.map(extractPatentNumber);
        return !shownPatentNumbers.includes(resultPatentNumber);
      })
      .slice(0, 18);

    const additionalResults = [...scholarResults, ...additionalPatents];
    const combinedMap = new Map();
    relevantResults.forEach((res) =>
      combinedMap.set(res.patent_id || res.scholar_id, res)
    );
    additionalResults.forEach((res) =>
      combinedMap.set(res.patent_id || res.scholar_id, res)
    );
    const displayedResults = Array.from(combinedMap.values());

    if (displayedResults.length > 0) {
      const itemsPerRow = 3;
      const numRows = Math.ceil(displayedResults.length / itemsPerRow);
      let scholarResultCounter = 0;

      html += `
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tbody>
      `;

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        html += `<tr>`;
        for (let colIndex = 0; colIndex < itemsPerRow; colIndex++) {
          const resultIndex = rowIndex * itemsPerRow + colIndex;
          if (resultIndex < displayedResults.length) {
            const result = displayedResults[resultIndex];
            const isScholar = result.is_scholar;
            
            let displayText;
            let icon;
            if (isScholar) {
              scholarResultCounter++;
              displayText = `Scholar ${scholarResultCounter}`;
              icon = "🔬";
            } else {
              displayText = extractPatentNumber(result.patent_id || "");
              icon = "📄";
            }

            const link = isScholar
              ? result.scholar_link || "#"
              : result.patent_id
              ? `https://patents.google.com/${result.patent_id}`
              : "#";

            html += `
              <td style="border: 1px solid #dee2e6; padding: 12px; background-color: #fafafa; font-size: 13px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">${icon}</span>
                  ${link !== "#" ? `
                    <a href="${link}" target="_blank" style="color: #1976d2; text-decoration: none; font-weight: 500;">
                      ${displayText}
                    </a>
                  ` : `<span style="color: #495057; font-weight: 500;">${displayText}</span>`}
                </div>
              </td>
            `;
          } else {
            html += `<td style="border: 1px solid #dee2e6; padding: 12px; background-color: #fafafa;"></td>`;
          }
        }
        html += `</tr>`;
      }

      html += `
          </tbody>
        </table>
      `;
    } else {
      html += `<p style="color: #6c757d; font-style: italic;">No patent results available to summarize.</p>`;
    }
  } else {
    html += `<p style="color: #6c757d; font-style: italic;">No patent results available to summarize.</p>`;
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
  
  let projectTitle = "Untitled Project";
  try {
    const projectId =
      localStorage.getItem("project_id") ||
      localStorage.getItem("selectedProject");

    if (projectId) {
      const response = await axios.get("/getProjectData", {
        params: { project_id: projectId },
      });
      
      if (response.data && response.data.project_title) {
        projectTitle = response.data.project_title;
        console.log(`[handlePrintPdf] Successfully fetched project title: ${projectTitle}`);
      }
    }
  } catch (error) {
    console.error("[handlePrintPdf] Error fetching project title. Using default.", error);
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site and try again.");
    return;
  }

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
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Roboto', Arial, sans-serif; 
            padding: 30px; 
            line-height: 1.6; 
            color: #2c3e50; 
            font-size: 12px;
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            position: relative;
          }
          
          /* Watermark */
          body::before {
            content: "CONFIDENTIAL";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0, 0, 0, 0.05);
            font-weight: bold;
            z-index: -1;
            letter-spacing: 20px;
          }
          
          /* Enhanced typography */
          p {
            line-height: 1.7;
            margin-bottom: 12px;
          }
          
          /* Cover page styling */
          .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin-bottom: 40px;
            page-break-after: always;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            position: relative;
          }
          
          .logo {
            font-size: 64px;
            font-weight: 700;
            color: #36718b;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            letter-spacing: 2px;
          }
          
          .report-title {
            font-size: 32px;
            font-weight: 300;
            color: #2c5282;
            margin-bottom: 60px;
            letter-spacing: 1px;
          }
          
          .project-info {
            margin: 40px 0;
            padding: 40px;
            border-radius: 15px;
            background: white;
            width: 70%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          
          .info-row {
            display: flex;
            margin-bottom: 20px;
            align-items: center;
          }
          
          .info-label {
            font-weight: 600;
            width: 120px;
            color: #555;
            text-align: right;
            padding-right: 25px;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            flex: 1;
            font-weight: 400;
            color: #2c3e50;
            text-align: left;
            font-size: 16px;
          }
          
          .confidential {
            margin-top: 80px;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
          }
          
          .copyright {
            color: #888;
            font-size: 11px;
            margin-top: 15px;
          }
          
          /* Section styling */
          .section-divider {
            border-top: 3px solid #36718b;
            margin: 40px 0;
          }
          
          h2 { 
            color: #36718b; 
            margin-top: 35px; 
            margin-bottom: 20px; 
            font-size: 22px; 
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            letter-spacing: 0.5px;
          }
          
          h3 { 
            color: #1976d2; 
            margin-top: 30px; 
            margin-bottom: 18px; 
            font-size: 18px; 
            font-weight: 600;
            background: linear-gradient(to right, #e3f2fd, #f5f5f5);
            padding: 12px 20px;
            border-left: 5px solid #2196f3;
            border-radius: 0 8px 8px 0;
          }
          
          h4 {
            color: #2c5282;
            margin-top: 20px;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 600;
          }
          
          h5 { 
            color: #34495e; 
            margin-top: 15px; 
            font-size: 14px; 
            font-weight: 600;
          }
          
          /* Table styling */
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-radius: 8px;
            overflow: hidden;
          }
          
          th, td { 
            border: 1px solid #dee2e6; 
            padding: 12px; 
            text-align: left; 
            font-size: 12px; 
          }
          
          th {
            background: linear-gradient(to bottom, #36718b, #2d5a73);
            color: white;
            font-weight: 600;
            letter-spacing: 0.3px;
            position: sticky;
            top: 0;
          }
          
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tr:hover {
            background-color: #e9ecef;
          }
          
          /* Code and pre styling */
          pre, code { 
            background-color: #f7fafc; 
            padding: 16px; 
            border-radius: 8px; 
            font-size: 11px;
            border: 1px solid #e2e8f0;
            line-height: 1.7;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          }
          
          code {
            padding: 2px 6px;
            font-size: 11px;
          }
          
          /* Link styling */
          a { 
            color: #1976d2; 
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }
          
          a:hover {
            color: #1565c0;
            text-decoration: underline;
          }
          
          /* Report sections */
          .report-section { 
            margin-bottom: 50px;
            page-break-inside: avoid;
          }
          
          /* Patent cards */
          .patent-card {
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            margin-bottom: 35px;
            overflow: hidden;
            page-break-inside: avoid;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: box-shadow 0.3s;
          }
          
          .patent-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 15px 20px;
            border-bottom: 1px solid #dee2e6;
          }
          
          .patent-body {
            padding: 20px 25px;
          }
          
          /* Coverage boxes */
          .coverage-box {
            background: linear-gradient(to right, #e8f5e9, #f1f8f2);
            padding: 14px 18px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
            margin-bottom: 18px;
          }
          
          /* Meta information */
          .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 12px;
            color: #666;
            padding: 8px 0;
          }
          
          /* Icons */
          .icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 18px;
          }
          
          /* Page header/footer */
          @media print {
            body {
              padding: 0;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            @page {
              margin: 2cm;
              @top-right {
                content: "Ino360 Novelty Search Report | Page " counter(page);
                font-size: 10px;
                color: #666;
              }
            }
            
            /* Ensure watermark prints */
            body::before {
              position: fixed !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
          
          /* Badge styling */
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            background: linear-gradient(135deg, #36718b, #4a90a4);
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          /* Grid layout for additional results */
          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 20px;
            margin-bottom: 35px;
          }
          
          .result-card {
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          
          .result-header {
            padding: 12px 16px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .scholar-header {
            background: linear-gradient(135deg, #fff8e1, #ffecb3);
            border-color: #ffe082;
          }
          
          .patent-header-simple {
            background: linear-gradient(135deg, #f5f7f9, #e9ecef);
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
              <div class="info-label">Title</div>
              <div class="info-value">${projectTitle}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Project ID</div>
              <div class="info-value">${projID}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Date</div>
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
        text: text.toUpperCase(),
        bold: true,
        size: 32, // 16pt
        color: "36718b",
      }),
    ],
    spacing: { before: 600, after: 200 },
    borders: {
      bottom: { color: "e2e8f0", style: BorderStyle.SINGLE, size: 15 },
    },
  });
};

// Create compact patent header for DOCX
const createCompactPatentHeader = (patentId, assignee, year, rank) => {
  const children = [
    new TextRun({
      text: "📄 ",
      size: 28,
    }),
    new TextRun({
      text: patentId,
      bold: true,
      size: 26,
      color: "1976d2",
    }),
  ];

  if (assignee) {
    children.push(
      new TextRun({
        text: ` | ${assignee}`,
        size: 24,
        color: "666666",
      })
    );
  }

  if (year) {
    children.push(
      new TextRun({
        text: ` | ${year}`,
        size: 24,
        color: "666666",
      })
    );
  }

  return new Paragraph({
    children,
    spacing: { before: 400, after: 150 },
    shading: {
      type: "solid",
      color: "f8f9fa",
    },
    borders: {
      all: {
        color: "e0e0e0",
        style: BorderStyle.SINGLE,
        size: 3,
      },
    },
    indent: { left: 200, right: 200 },
    alignment: AlignmentType.LEFT,
  });
};

  // Helper function to create a styled subheader for DOCX
  const createSubHeader = (text) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        color: "1976d2",
      }),
    ],
    spacing: { before: 400, after: 200 },
    shading: {
      type: "solid",
      color: "e3f2fd",
    },
    border: {
      left: {
        color: "2196f3",
        style: BorderStyle.SINGLE,
        size: 20,
      },
    },
    indent: { left: 200 },
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
    // Updated Project Title Fetching (use this exact code in both handlePrintPdf and handleDownloadDocx)
let projectTitle = "Untitled Project"; // Default value
try {
  const projectId =
    localStorage.getItem("project_id") ||
    localStorage.getItem("selectedProject");

  if (projectId) {
    // First try to get from the existing project data response
    const response = await axios.get("/getProjectData", {
      params: { project_id: projectId },
    });
    
    // The project_title is stored in the Invention model
    if (response.data && response.data.project_title) {
      projectTitle = response.data.project_title;
      console.log(`[handlePrintPdf/handleDownloadDocx] Successfully fetched project title: ${projectTitle}`);
    }
  }
} catch (error) {
  console.error("[handlePrintPdf/handleDownloadDocx] Error fetching project title. Using default.", error);
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

    // Results Summary Section - ADD THIS
if (analyzeData.patentResults && analyzeData.comparisons) {
  // Add page break before Results Summary
  paragraphs.push(
    new Paragraph({
      children: [],
      pageBreakBefore: true,
    })
  );
  
  paragraphs.push(createSubHeader("Results Summary"));
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Consolidated list of all the analyzed patents and NPLs",
          size: 24,
          color: "666666",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Get all unique results
  const relevantPatentIds = analyzeData.comparisons.map(c => c.patentId);
  const relevantResults = relevantPatentIds
    .map((patentId) =>
      analyzeData.patentResults.find(
        (res) => res.patent_id === patentId
      )
    )
    .filter(Boolean);

  const scholarResults = analyzeData.patentResults
    .filter((result) => result.is_scholar)
    .slice(0, 2);
    
  const additionalPatents = analyzeData.patentResults
    .filter((result) => {
      if (result.is_scholar) return false;
      const resultPatentNumber = extractPatentNumber(result.patent_id);
      const shownPatentNumbers = relevantPatentIds.map(extractPatentNumber);
      return !shownPatentNumbers.includes(resultPatentNumber);
    })
    .slice(0, 18);

  const additionalResults = [...scholarResults, ...additionalPatents];
  const combinedMap = new Map();
  relevantResults.forEach((res) =>
    combinedMap.set(res.patent_id || res.scholar_id, res)
  );
  additionalResults.forEach((res) =>
    combinedMap.set(res.patent_id || res.scholar_id, res)
  );
  const displayedResults = Array.from(combinedMap.values());

  if (displayedResults.length > 0) {
    const itemsPerRow = 3;
    const numRows = Math.ceil(displayedResults.length / itemsPerRow);
    let scholarResultCounter = 0;

    const tableRows = [];
    
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const cells = [];
      for (let colIndex = 0; colIndex < itemsPerRow; colIndex++) {
        const resultIndex = rowIndex * itemsPerRow + colIndex;
        if (resultIndex < displayedResults.length) {
          const result = displayedResults[resultIndex];
          const isScholar = result.is_scholar;
          
          let displayText;
          if (isScholar) {
            scholarResultCounter++;
            displayText = `Scholar Res ${scholarResultCounter}`;
          } else {
            displayText = extractPatentNumber(result.patent_id || "");
          }

          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: displayText,
                      size: 24,
                      color: "2196f3",
                    }),
                  ],
                }),
              ],
            })
          );
        } else {
          cells.push(
            new TableCell({
              children: [new Paragraph({ text: "" })],
            })
          );
        }
      }
      tableRows.push(new TableRow({ children: cells }));
    }

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
        },
      })
    );
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No patent results available to summarize.",
            size: 24,
          }),
        ],
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

  // Updated result table cell with icons
function createResultTableCell(result, scholarResults) {
  if (!result) return new TableCell({ children: [new Paragraph({ text: "" })] });
  
  const isScholar = result.is_scholar;
  let simplifiedId;
  let icon;
  
  if (isScholar) {
    const scholarIndex = scholarResults.indexOf(result) + 1;
    simplifiedId = `Scholar ${scholarIndex}`;
    icon = "🔬 ";
  } else {
    simplifiedId = extractPatentNumber(result.patent_id);
    icon = "📄 ";
  }
  
  const cellChildren = [
    new Paragraph({
      children: [
        new TextRun({
          text: icon,
          size: 26,
        }),
        new TextRun({
          text: simplifiedId,
          size: 24,
          color: "1976d2",
          bold: true,
        }),
      ],
      spacing: { before: 120, after: 80 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({ 
          text: result.title || "No title available", 
          size: 24,
          color: "2c3e50",
        }),
      ],
      spacing: { after: 80 },
      indent: { left: 120 },
    }),
  ];
  
  // Add metadata with better formatting
  const metaInfo = [];
  
  if (isScholar && result.author) {
    metaInfo.push(`Authors: ${result.author}`);
  }
  
  if (result.publication_date || result.filing_date) {
    metaInfo.push(`${isScholar ? 'Published' : 'Filed'}: ${result.publication_date || result.filing_date}`);
  }
  
  if (!isScholar && result.assignee) {
    metaInfo.push(`Assignee: ${result.assignee}`);
  }
  
  if (metaInfo.length > 0) {
    cellChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metaInfo.join(" | "),
            size: 22,
            color: "7a8b9a",
            italic: true,
          }),
        ],
        spacing: { after: 80 },
        indent: { left: 120 },
      })
    );
  }
  
  return new TableCell({
    children: cellChildren,
    borders: {
      all: {
        style: BorderStyle.SINGLE,
        size: 2,
        color: "e0e0e0",
      },
    },
    width: { size: 50, type: WidthType.PERCENTAGE },
    margins: {
      top: 150,
      bottom: 150,
      left: 200,
      right: 200,
    },
    shading: {
      type: "solid",
      color: isScholar ? "fffaf0" : "fafafa",
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
