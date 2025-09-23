import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import axios from "axios";
import TableComponent from "./TableComponent";
import "./inventionAnalyzer.css";

// Modified helper function to extract simplified patent number
const extractPatentNumber = (patentId) => {
  if (!patentId || typeof patentId !== "string") return "";
  return patentId
    .replace(/^patent\//, "") // Remove "patent/" prefix
    .replace(/\/en$/, ""); // Remove "/en" suffix
};
// Patent Result Card component (unchanged)
const PatentResultCard = ({ result }) => {
  const isScholar = result.is_scholar;

  // --- TEMPORARY FIX START ---
  // Determine the ID to display and the link URL based on whether it's a patent or scholar result
  let displayIdText = "N/A";
  let linkUrl = "#";
  let linkTitle = "No Link Available";

  if (isScholar) {
    // For Scholar results:
    // Use the scholar_id if available, otherwise show "Scholar Result"
    const scholarId = result.scholar_id || "Scholar Result";
    // Display text for the link
    displayIdText = "View Article"; // More user-friendly text
    // Construct the Google Scholar link ONLY if scholar_id exists
    // Always prioritize scholar_link provided from backend Google Scholar search results
    linkUrl = result.scholar_link || "#";
    linkTitle = result.scholar_link
      ? `View Article on ${
          result.scholar_link.split("/")[2] || "External Site"
        }`
      : "No Link Available";
    // Keep displayIdText simple or adjust based on link presence
    displayIdText = result.scholar_link ? "View Scholar Result" : "No Link";
  } else {
    // For Patent results (original logic):
    displayIdText = extractPatentNumber(result.patent_id);
    if (result.patent_id) {
      linkUrl = `https://patents.google.com/${result.patent_id}`;
      linkTitle = `View Patent ${displayIdText} on Google Patents`;
    } else {
      displayIdText = "Patent ID Missing";
      linkTitle = "Patent Link Unavailable";
    }
  }
  // --- TEMPORARY FIX END ---

  return (
    <div className="patent-result-card">
      <div className="patent-card-content">
        <div className="patent-id">
          {isScholar ? "Non-Patent Literature:" : "Search Result ID:"}{" "}
          {/* Changed label based on isScholar */}
          <a
            href={linkUrl} // Use the corrected link URL
            target="_blank"
            rel="noopener noreferrer"
            className="patent-number-link"
            title={linkTitle} // Use the generated title
          >
            {/* Display user-friendly text for Scholar, Patent ID for patents */}
            {displayIdText}
          </a>
        </div>

        <h5 className="patent-title-heading">Title</h5>
        <p className="patent-title">{result.title}</p>

        {/* Use snippet, fallback to abstract if available (often richer for patents) */}
        {(result.snippet || result.abstract) && (
          <div className="patent-snippet">
            {result.snippet || result.abstract}
          </div>
        )}

        <div className="patent-card-footer">
          <div className="patent-footer-left">
            {/* Display Publication Date for Scholar, Filing Date for Patents */}
            {isScholar && result.publication_date && (
              <div className="patent-filing-date">
                <span className="patent-label">Publication Date:</span>{" "}
                {result.publication_date}
              </div>
            )}
            {!isScholar && result.filing_date && (
              <div className="patent-filing-date">
                <span className="patent-label">Filing Date:</span>{" "}
                {result.filing_date}
              </div>
            )}
          </div>
          <div className="patent-footer-right">
            {/* Display Author for Scholar, Assignee for Patents */}
            {isScholar && result.author && (
              <div className="patent-assignee">
                <span className="patent-label">Author:</span> {result.author}
              </div>
            )}
            {!isScholar && result.assignee && (
              <div className="patent-assignee">
                <span className="patent-label">Assignee:</span>{" "}
                {result.assignee}
              </div>
            )}
          </div>
        </div>

        {/* Display Inventor only for Patents */}
        {!isScholar && result.inventor && (
          <div className="patent-inventor">
            <span className="patent-label">Inventor:</span> {result.inventor}
          </div>
        )}
      </div>
    </div>
  );
};

const PatentDetailsCard = ({
  patentId,
  details = {},
  rank,
  foundSummary,
  isExpanded,
  onToggleExpand,
  matrixData,
  excerpts,
  onRetry,
  isRetrying,
}) => {
  const simplifiedPatentId = extractPatentNumber(patentId);
  const needsRetry = !matrixData?.headers?.length || !excerpts || matrixData.rows.length === 0;
  const [abstractExpanded, setAbstractExpanded] = useState(false);
  
  // Get the abstract or snippet
  const abstractText = details?.abstract || details?.snippet || "No abstract available";
  
  // Function to toggle abstract expansion
  const toggleAbstract = (e) => {
    e.stopPropagation(); // Prevent triggering card expansion
    setAbstractExpanded(!abstractExpanded);
  };

  // Function to limit text to a specific word count
  const truncateToWords = (text, wordCount) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(" ") + "...";
  };

  return (
    <div className="patent-result-card">
      <div className="patent-card-content">
        {/* Patent ID with rank badge */}
        <div className="patent-id-row">
          {rank && (
            <span
              style={{
                background: "#36718b",
                color: "white",
                padding: "3px 8px",
                borderRadius: "12px",
                marginRight: "10px",
                fontSize: "0.9rem",
              }}
            >
              Rank {rank}
            </span>
          )}
          <span className="patent-label" style={{ marginRight: "5px" }}>Search Result ID:</span>
          <a
            href={`https://patents.google.com/patent/${simplifiedPatentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="patent-number-link"
          >
            {simplifiedPatentId}
          </a>
        </div>

        {/* Coverage identified - at the top */}
        {foundSummary && (
          <div className="patent-coverage-box">
            <strong style={{ color: "#2ecc71" }}>Coverage Identified:</strong>{" "}
            {foundSummary}
          </div>
        )}

        {/* Bibliographic data container - unified with cards inside */}
        <div className="biblio-container">
          <div className="biblio-header">
            <h4 className="biblio-title">Bibliographic Data</h4>
          </div>
          <div className="biblio-content">
            {/* Title Item */}
            <div className="biblio-item">
              <div className="biblio-item-header">
                <h5 className="biblio-item-title">Title</h5>
              </div>
              <div className="biblio-item-content">
                {details?.title || "No title available"}
              </div>
            </div>

            {/* Filing Date, Inventor and Assignee in a row */}
            <div className="biblio-item">
              <div className="patent-details-row">
                {/* Filing Date */}
                {details?.filing_date && (
                  <div className="patent-detail-column">
                    <div className="patent-detail-label">Filing Date</div>
                    <div className="patent-detail-value">{details.filing_date}</div>
                  </div>
                )}
                
                {/* Inventor */}
                {(details?.inventor || details?.inventors) && (
                  <div className="patent-detail-column">
                    <div className="patent-detail-label">Inventor</div>
                    <div className="patent-detail-value">
                      {Array.isArray(details.inventors)
                        ? details.inventors.map((inv) => inv.name).join(", ")
                        : details.inventor || "N/A"}
                    </div>
                  </div>
                )}
                
                {/* Assignee */}
                {details?.assignees?.length > 0 && (
                  <div className="patent-detail-column">
                    <div className="patent-detail-label">Assignee</div>
                    <div className="patent-detail-value">{details.assignees.join(", ")}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Abstract Item */}
            {abstractText && (
              <div className="biblio-item">
                <div className="biblio-item-header">
                  <h5 className="biblio-item-title">Abstract</h5>
                </div>
                <div className="biblio-item-content abstract-content">
                  {abstractExpanded ? abstractText : truncateToWords(abstractText, 10)}
                  <button 
                    className="abstract-toggle" 
                    onClick={toggleAbstract}
                  >
                    {abstractExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Retry button if needed */}
        {needsRetry && (
          <div className="retry-container">
            <button 
              onClick={() => onRetry(patentId)}
              disabled={isRetrying}
              className="retry-button"
            >
              {isRetrying ? (
                <span>Retrying <span className="blinking-dots">...</span></span>
              ) : (
                "Retry Analysis"
              )}
            </button>
            <div className="retry-hint">
              Detailed Analysis for this patent is incomplete. Click to retry.
            </div>
          </div>
        )}

        {/* Detailed Analysis Toggle (visually separated) */}
        <div className="patent-detailed-analysis">
          <div 
            className={`matrix-toggle-button ${isExpanded ? 'expanded' : ''}`} 
            onClick={onToggleExpand}
          >
            <div className="matrix-toggle-content">
              <div className="matrix-toggle-left">
                <div className="matrix-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H10V10H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 3H21V10H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 14H21V21H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 14H10V21H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="matrix-toggle-text">
                  {isExpanded ? "Hide Detailed Analysis" : "View Detailed Analysis"}
                </span>
              </div>
              <div className="matrix-toggle-chevron">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={isExpanded ? 'chevron-up' : 'chevron-down'}
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="matrix-toggle-hint">
              {isExpanded ? "Close the detailed comparison matrix and excerpts" : "See key features comparison matrix and relevant patent excerpts"}
            </div>
          </div>
        </div>

        {/* Expandable section with error handling - unchanged */}
        {isExpanded && (
          <div className="expanded-matrix-section">
            <div className="analysis-matrix-section">
              <h5 className="analysis-section-heading">
                Key Features vs{" "}
                <a
                  href={`https://patents.google.com/patent/${simplifiedPatentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="patent-number-link"
                >
                  {simplifiedPatentId}
                </a>{" "}
                Matrix
              </h5>
              <div className="analysis-section-content">
                {matrixData?.headers?.length > 0 && matrixData.rows.length > 0 ? (
                  <TableComponent
                    tableData={matrixData}
                    className="analyzer-table"
                  />
                ) : (
                  <div className="missing-data-message">
                    Matrix data unavailable. Please retry the analysis.
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-excerpts-section">
              <h5 className="analysis-section-heading">
                Relevant Excerpts from{" "}
                <a
                  href={`https://patents.google.com/patent/${simplifiedPatentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="patent-number-link"
                >
                  {simplifiedPatentId}
                </a>
              </h5>
              <div className="analysis-section-content">
                {excerpts ? (
                  <pre className="excerpts-text">{excerpts}</pre>
                ) : (
                  <div className="missing-data-message">
                    Excerpts unavailable. Please retry the analysis.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main InventionAnalyzer component
const InventionAnalyzer = forwardRef((props, ref) => {
  const [inventionText, setInventionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [expandedCards, setExpandedCards] = useState({}); // State for tracking expanded cards
  const [retryingPatents, setRetryingPatents] = useState({}); // State for tracking retrying patents

  // Toggle function for expanding/collapsing cards
  const toggleCardExpand = (patentId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [patentId]: !prev[patentId],
    }));
  };

  // Extract keyFeatures from props
  const { keyFeatures } = props;

  // Add retry function
  const handleRetryPatent = async (patentId) => {
    try {
      setRetryingPatents(prev => ({ ...prev, [patentId]: true }));
      
      // Call the backend endpoint
      const response = await axios.post('/api/retry-patent-comparison', {
        patentId,
        keyFeatures // Use the keyFeatures from props
      });
      
      if (response.data && response.data.success) {
        // Update the result data
        setResultData(prevData => {
          const updatedComparisons = prevData.comparisons.map(comparison => {
            if (comparison.patentId === patentId) {
              return {
                ...comparison,
                matrix: response.data.matrix,
                excerpts: response.data.excerpts
              };
            }
            return comparison;
          });
          
          const updatedData = {
            ...prevData,
            comparisons: updatedComparisons
          };
          
          // Save the updated analysis data
          saveAnalysisData(updatedData);
          
          return updatedData;
        });
      } else {
        throw new Error(response.data.error || 'Retry failed');
      }
    } catch (err) {
      console.error('Error retrying patent analysis:', err);
      setError(`Failed to retry analysis: ${err.message}`);
    } finally {
      setRetryingPatents(prev => ({ ...prev, [patentId]: false }));
    }
  };

  // Add/modify this section in the component
  useImperativeHandle(ref, () => ({
    handleSubmit: async () => {
      if (loading) return false; // Only check if already loading, allow regeneration

      setLoading(true);
      setError("");
      setResultData(null); // Clear previous results to show loading state
      setJobId(null);
      setProgress(0);

      try {
        const mockEvent = { preventDefault: () => {} };
        await handleSubmitAnalyzer(mockEvent);
        return true; // Return true to indicate success
      } catch (err) {
        console.error("Error in handleSubmit:", err);
        setError(err.message || "An error occurred during analysis");
        setLoading(false);
        return false; // Return false to indicate failure
      }
    },
    resetAnalysis: () => {
      setResultData(null);
      setError("");
    },
    getResultData: () => resultData,
    setResultData: (data) => {
      setResultData(data);
      setLoading(false);
      setError("");
    },
    isAnalyzing: () => loading, // Add this method to check if analysis is in progress
  }));

  const saveAnalysisData = async (data) => {
    try {
      const projectId =
        localStorage.getItem("project_id") ||
        localStorage.getItem("selectedProject");
      const userData = localStorage.getItem("user");
      if (!projectId || !userData) {
        throw new Error("Missing project_id or user data in localStorage");
      }
      const user = JSON.parse(userData);
      const u_id = Number(user.id);
      if (isNaN(u_id)) {
        throw new Error("Invalid user ID: must be a number");
      }

      const enrichedSelectedPatents = data.selectedPatentIds.map((patentId) => {
        const comparison = data.comparisons.find(
          (comp) => comp.patentId === patentId
        );
        const details = comparison?.details || {};
        return {
          patent_id: patentId,
          title: details.title || "",
          assignee: details.assignee || "",
          snippet: details.snippet || "",
          abstract: details.abstract || "",
          filing_date: details.filing_date || "",
          inventor: details.inventor || "",
        };
      });

      const enrichedData = {
        ...data,
        selectedPatentIds: enrichedSelectedPatents,
      };

      const payload = {
        project_id: projectId,
        u_id: u_id,
        analyze_invention_data: enrichedData,
      };

      const response = await axios.post("/api/saveInnocheck", payload);
      console.log("Analysis data saved successfully:", response.data);
    } catch (err) {
      console.error("Error saving analysis data:", err);
      if (err.response) {
        console.error("Server response:", err.response.data);
      }
      setError(
        "Failed to save analysis data: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  function parseMarkdownTable(text) {
    if (!text || typeof text !== "string") {
      throw new Error("Input must be a non-empty string");
    }
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2)
      throw new Error("Invalid table format: insufficient lines");
    const headers = lines[0]
      .split(/(?<!\\)\|/)
      .slice(1, -1)
      .map((cell) => cell.replace(/\\\|/g, "|").trim());
    if (headers.length === 0) throw new Error("No headers found");
    const rows = lines.slice(2).map((row) =>
      row
        .split(/(?<!\\)\|/)
        .slice(1, -1)
        .map((cell) => cell.replace(/\\\|/g, "|").trim())
    );
    if (rows.length === 0) console.warn("No rows found, returning empty rows");
    return { headers, rows };
  }

  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setInventionText(storedPdfText);
    }

    // Clean up polling interval when component unmounts
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Effect for polling job status
  useEffect(() => {
    if (!jobId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/process-invention/status/${jobId}`);
        if (!response.ok) throw new Error("Status check failed");

        const statusData = await response.json();
        setProgress(statusData.progress);

if (statusData.progress <= 10) {
  setProgressMessage(`Analyzing your invention`);
} else if (statusData.progress <= 25) {
  setProgressMessage(`Searching patent databases`);
} else if (statusData.progress <= 35) {
  setProgressMessage(`Reviewing search results`);
} else if (statusData.progress <= 50) {
  setProgressMessage(`Identifying most relevant patents`);
} else if (statusData.progress <= 60) {
  setProgressMessage(`Comparing with your invention`);
} else if (statusData.progress <= 70) {
  setProgressMessage(`Generating detailed comparisons`);
} else if (statusData.progress <= 78) {
  setProgressMessage(`Finding related patents`);
} else if (statusData.progress <= 82) {
  setProgressMessage(`Analyzing patent connections`);
} else if (statusData.progress <= 86) {
  setProgressMessage(`Exploring citation networks`);
} else if (statusData.progress <= 88) {
  setProgressMessage(`Evaluating additional references`);
} else if (statusData.progress <= 92) {
  setProgressMessage(`Finalizing patent selection`);
} else if (statusData.progress <= 95) {
  setProgressMessage(`Completing analysis`);
} else {
  setProgressMessage(`Preparing your report`);
}

        if (statusData.status === "completed") {
          clearInterval(pollingInterval);
          setPollingInterval(null);

          const resultResponse = await fetch(
            `/api/process-invention/result/${jobId}`
          );
          if (!resultResponse.ok) throw new Error("Failed to fetch results");

          const data = await resultResponse.json();

          console.log("Full resultData:", JSON.stringify(data, null, 2)); // Keep original log too
          setResultData(data);
          setLoading(false);

          await saveAnalysisData(data); // Ensure this is called *after* setting state if it depends on it
        } else if (statusData.status === "failed") {
          clearInterval(pollingInterval);
          setPollingInterval(null);

          setError("Analysis failed. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking job status:", err);
        // Optionally clear interval or set error state here if needed
        // setError("Error checking analysis status.");
        // setLoading(false); // Might want to stop loading on polling error
      }
    };
    // Start polling
    const interval = setInterval(checkStatus, 3000); // Poll every 3 seconds
    setPollingInterval(interval);

    // Initial status check
    checkStatus();

    // Cleanup function for the effect
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Clear the pollingInterval state variable as well if it holds the interval ID
      setPollingInterval(null);
    };
  }, [jobId]); // Dependency array includes jobId

  const handleSubmitAnalyzer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultData(null);
    setJobId(null);
    setProgress(0);

    try {
      // Include keyFeatures in the request if available
      const requestBody = {
        inventionText,
        ...(keyFeatures && { keyFeatures }), // Only include if keyFeatures exists and is not empty
      };

      const response = await fetch("/api/process-invention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.error || "API Error");
      }

      const data = await response.json();
      console.log("Job Started:", data);

      // Store the job ID for status polling
      setJobId(data.jobId);

      // Note: We're not setting loading=false here since we're still waiting for the job to complete
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Keep form for backward compatibility, but hide it with display:none */}
      <form onSubmit={handleSubmitAnalyzer} style={{ display: "none" }}>
        <button className="btn-stl-3 w-auto" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Invention"}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <div style={{ marginBottom: "10px" }}>
            {progressMessage}
            <span className="blinking-dots">...</span>
            {/* Analysis in progress: {progress}% complete */}
          </div>
          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#e0e0e0",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#36718b",
                borderRadius: "10px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
          <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
            This analysis typically takes few minutes to complete. Please don't close the tab!
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {resultData && (
        <div>
          <div className="analyzer-section">
            <h3 className="analyzer-heading">Relevant Search Results</h3>
            <div className="patent-results-grid">
              {resultData.comparisons.map((comparison, index) => {
                // Use comparisons directly for ranked display
                const patentId = comparison.patentId;
                const matrix = comparison?.matrix || "";
                let parsedMatrix;

                try {
                  parsedMatrix = parseMarkdownTable(matrix);
                } catch (error) {
                  console.error(
                    `Failed to parse matrix for ${patentId}:`,
                    error
                  );
                  parsedMatrix = { headers: [], rows: [] };
                }

                return (
                  <PatentDetailsCard
                    key={`details-${index}`}
                    patentId={patentId}
                    details={comparison?.details || {}}
                    rank={comparison.rank}
                    foundSummary={comparison.foundSummary}
                    isExpanded={!!expandedCards[patentId]}
                    onToggleExpand={() => toggleCardExpand(patentId)}
                    matrixData={parsedMatrix}
                    excerpts={comparison?.excerpts}
                    onRetry={handleRetryPatent}
                    isRetrying={!!retryingPatents[patentId]}
                  />
                );
              })}
            </div>
          </div>
          <div className="analyzer-section">
            <h3 className="analyzer-heading">Additional Search Results</h3>
            <div className="patent-results-grid">
              {(() => {
                // First, separate scholar results and patent results
                const scholarResults = resultData.patentResults
                  .filter((result) => result.is_scholar)
                  .slice(0, 2); // Get up to 2 scholar results

                // Get patents not in "Relevant Search Results"
                const otherPatents = resultData.patentResults
                  .filter((result) => {
                    // Skip scholar results
                    if (result.is_scholar) return false;

                    // Skip patents already in Relevant Search Results
                    const resultPatentNumber = extractPatentNumber(
                      result.patent_id
                    );

                    const selectedPatentNumbers =
                      resultData.selectedPatentIds.map(extractPatentNumber);
                    return !selectedPatentNumbers.includes(resultPatentNumber);
                  })
                  .slice(0, 8); // Limit to 8 patent results

                // Combine the results, showing scholar results first
                const combinedResults = [...scholarResults, ...otherPatents];

                return combinedResults.map((result, index) => (
                  <PatentResultCard key={index} result={result} />
                ));
              })()}
            </div>
          </div>

{resultData && resultData.searchQueries && resultData.searchQueries.length > 0 && (
  <div className="analyzer-section">
    <h3 className="analyzer-heading">Search Strategy & Queries Used</h3>
    <h5 className="patent-title-heading">
      Complete list of search queries executed to find relevant prior art
    </h5>
    <div className="search-queries-container">
      {(() => {
        // Group queries by type
        const groupedQueries = resultData.searchQueries.reduce((acc, query) => {
          if (!acc[query.step]) {
            acc[query.step] = [];
          }
          acc[query.step].push(query);
          return acc;
        }, {});

        return Object.entries(groupedQueries).map(([step, queries]) => (
          <div key={step} className="query-group" style={{
            marginBottom: "25px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef"
          }}>
            <h4 style={{
              color: "#36718b",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              borderBottom: "1px solid #dee2e6",
              paddingBottom: "8px"
            }}>
              {step}
            </h4>
            <div className="queries-list">
              {queries.map((queryItem, index) => (
                <div key={index} style={{
                  marginBottom: "10px",
                  padding: "10px",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px"
                  }}>
                    <span style={{
                      backgroundColor: queryItem.type === "Primary Search" ? "#2196f3" : 
                                       queryItem.type === "Expanded Search" ? "#4caf50" : 
                                       "#ff9800",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      marginTop: "2px"
                    }}>
                      {queryItem.type}
                    </span>
                    <code style={{
                      flex: 1,
                      fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                      fontSize: "12px",
                      color: "#333",
                      backgroundColor: "#f5f5f5",
                      padding: "8px",
                      borderRadius: "4px",
                      wordBreak: "break-word"
                    }}>
                      {queryItem.query}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ));
      })()}
    </div>
    <div style={{
      marginTop: "15px",
      padding: "12px",
      backgroundColor: "#e8f4f8",
      borderRadius: "6px",
      fontSize: "12px",
      color: "#555"
    }}>
      <strong>Note:</strong> These queries were automatically generated and executed across multiple patent databases 
      to ensure comprehensive prior art coverage. The system uses advanced query optimization techniques including 
      classification-based refinement and citation network analysis.
    </div>
  </div>
)}

          <div className="analyzer-section">
            <h3 className="analyzer-heading">Results Summary</h3>
            <h5 className="patent-title-heading">
              Consolidated list of all the analyzed patents and NPLs
            </h5>
            <div className="analysis-section-content">
              {resultData &&
              resultData.patentResults &&
              resultData.comparisons ? (
                (() => {
                  // 1. Get the list of relevant patent IDs (normalize if needed)
                  const relevantPatentIds = (
                    resultData.selectedPatentIds || []
                  ).map((id) => (typeof id === "string" ? id : id.patent_id));

                  // 2. Get the full result objects for the relevant patents
                  const relevantResults = relevantPatentIds
                    .map((relId) =>
                      resultData.patentResults.find(
                        (res) => res.patent_id === relId
                      )
                    )
                    .filter(Boolean); // Filter out any potential undefined if IDs don't match

                  // 3. Get the additional results (using the same logic as the "Additional Search Results" section)
                  const additionalResults = resultData.patentResults
                    .filter((result) => {
                      if (result.is_scholar) return true; // Keep scholar results for this list initially
                      // Check if it's NOT among the relevant ones
                      const resultPatentNumber = extractPatentNumber(
                        result.patent_id
                      );
                      const selectedPatentNumbers =
                        relevantPatentIds.map(extractPatentNumber);
                      return !selectedPatentNumbers.includes(
                        resultPatentNumber
                      );
                    })
                    // Now filter and limit as done in the display section
                    .reduce(
                      (acc, result) => {
                        if (result.is_scholar && acc.scholarCount < 2) {
                          acc.results.push(result);
                          acc.scholarCount++;
                        } else if (!result.is_scholar && acc.patentCount < 8) {
                          acc.results.push(result);
                          acc.patentCount++;
                        }
                        return acc;
                      },
                      { results: [], scholarCount: 0, patentCount: 0 }
                    ).results;

                  // 4. Combine the lists (ensure no duplicates if an ID somehow appeared in both)
                  const combinedMap = new Map();
                  relevantResults.forEach((res) =>
                    combinedMap.set(res.patent_id || res.scholar_id, res)
                  );
                  additionalResults.forEach((res) =>
                    combinedMap.set(res.patent_id || res.scholar_id, res)
                  );
                  const displayedResults = Array.from(combinedMap.values());

                  if (displayedResults.length === 0) {
                    return <p>No patent results available to summarize.</p>;
                  }

// ... inside the InventionAnalyzer component, within the "Results Summary" section

                  // 5. Render the table dynamically
                  const itemsPerRow = 3;
                  const numRows = Math.ceil(
                    displayedResults.length / itemsPerRow
                  );

                  // FIX START: Pre-calculate scholar numbers to avoid side effects during render
                  const scholarNumberMap = new Map();
                  let currentScholarNumber = 1;
                  displayedResults.forEach(result => {
                    if (result.is_scholar) {
                      // Use a unique ID for the scholar result as the key
                      const scholarKey = result.scholar_id || JSON.stringify(result); // Fallback key
                      if (!scholarNumberMap.has(scholarKey)) {
                        scholarNumberMap.set(scholarKey, currentScholarNumber++);
                      }
                    }
                  });
                  // FIX END

                  // REMOVED: let scholarResultCounter = 0;

                  return (
                    <table className="analyzer-table patent-summary-table">
                      <tbody>
                        {[...Array(numRows)].map((_, rowIndex) => (
                          <tr key={`summary-row-${rowIndex}`}>
                            {[...Array(itemsPerRow)].map((_, colIndex) => {
                              const resultIndex =
                                rowIndex * itemsPerRow + colIndex;
                              if (resultIndex < displayedResults.length) {
                                const result = displayedResults[resultIndex];
                                const isScholar = result.is_scholar;

                                let displayText;
                                if (isScholar) {
                                  // FIX START: Use the pre-calculated map for a stable number
                                  const scholarKey = result.scholar_id || JSON.stringify(result);
                                  const scholarNum = scholarNumberMap.get(scholarKey);
                                  displayText = `Scholar Res ${scholarNum}`;
                                  // FIX END
                                } else {
                                  displayText = extractPatentNumber(
                                    result.patent_id || ""
                                  );
                                }

                                const link = isScholar
                                  ? result.scholar_link || "#"
                                  : result.patent_id
                                  ? `https://patents.google.com/${result.patent_id}`
                                  : "#";

                                return (
                                  <td key={`summary-cell-${resultIndex}`}>
                                    {link !== "#" ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="patent-number-link"
                                        title={`View ${
                                          isScholar
                                            ? "Scholar Result"
                                            : "Patent"
                                        }: ${displayText}`}
                                      >
                                        {displayText}
                                      </a>
                                    ) : (
                                      displayText
                                    )}
                                  </td>
                                );
                              } else {
                                // Render empty cell if no more results for this row
                                return (
                                  <td
                                    key={`summary-cell-empty-${resultIndex}`}
                                  ></td>
                                );
                              }
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
// ... rest of the component
                })() // Immediately invoke the function
              ) : (
                <p>No patent results available to summarize.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default InventionAnalyzer;
