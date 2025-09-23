import "../../assets/css/innoCheck.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../components/ContentMainProvisio/InvetionDisclosure/uploadPDF.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPaperclip, FaLock } from "react-icons/fa";
import { OrbitProgress } from "react-loading-indicators";
import SaveSearchReport from "./SaveSearchReport";
import { useToast } from "../../context/ToastContext";

const InnoCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [selectedButtons, setSelectedButtons] = useState([]); // For innoCheck
  const [provisionalSelectedButtons, setProvisionalSelectedButtons] = useState(
    []
  ); // For provisional
  const [draftMasterSelectedButtons, setDraftMasterSelectedButtons] = useState(
    []
  ); // For draftmaster
  const [user, setUser] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Define frozen options for InnoCheck
  const frozenOptions = [
    "Key Features",
    "Listing Of Results + Result Matrix vs Key Features + Relevant Excerpts",
  ];

  const innoCheckButtonValues = [
    "Summary Of Invention",
    "Key Features",
    "Problem Statement",
    "Solution Statement",
    "Novelty Statement",
    "Advantages Of Invention",
    "Industrial Applicability",
    "Inovators In The Field",
    "Listing Of Results + Result Matrix vs Key Features + Relevant Excerpts",
  ];

  const provisionalButtonValues = [
    "Title Of Invention",
    "Background of the Invention",
    "Summary of Invention",
    "Fields of the Invention",
    "Detailed Description",
    "Advantages Of The Invention",
  ];

  const draftMasterButtonValues = [
    "Title Of Invention",
    "Background of Invention",
    "Summary of Invention",
    "Fields of the Invention",
    "Brief Description",
    "Detailed Description",
    "Claims",
    "Abstract",
    "Flowcharts",
    "Sequence Diagram",
    "Block Diagram",
  ];

  // Check if all non-frozen options are selected
  const areAllSelected = (selectedOptions, allOptions, frozenOpts = []) => {
    const selectableOptions = allOptions.filter(
      (opt) => !frozenOpts.includes(opt)
    );
    return selectableOptions.every((opt) => selectedOptions.includes(opt));
  };

  // Handle Select All functionality
  const handleSelectAll = (
    setStateFn,
    allOptions,
    currentSelected,
    frozenOpts = []
  ) => {
    if (areAllSelected(currentSelected, allOptions, frozenOpts)) {
      // Deselect all non-frozen options
      setStateFn(currentSelected.filter((opt) => frozenOpts.includes(opt)));
    } else {
      // Select all options
      setStateFn([
        ...new Set([
          ...currentSelected.filter((opt) => frozenOpts.includes(opt)),
          ...allOptions,
        ]),
      ]);
    }
  };

  useEffect(() => {
  const userData = localStorage.getItem("user");
  if (!userData) {
    navigate("/");
    return;
  }

  let parsedUser;
  try {
    parsedUser = JSON.parse(userData);
  } catch (e) {
    console.error("Error parsing user data from localStorage", e);
    parsedUser = null;
  }

  setUser(parsedUser);

  const storedPdfText = localStorage.getItem("pdfText");
  const storedProjectId = localStorage.getItem("project_id");

  // Check for pdfText first - this should always set the text input if available
  if (storedPdfText) {
    setTextInput(storedPdfText);
    setFileName("Text from IDF Form");
  }

  // Additional project-specific setup if a project ID exists
  if (storedProjectId && storedPdfText) {
    setReportGenerated(true);
  }

  // Define queryParams inside useEffect
  const queryParams = new URLSearchParams(location.search);
  const storedSelectedButtons = localStorage.getItem("selectedButtons");
  let initialSelectedButtons = storedSelectedButtons
    ? JSON.parse(storedSelectedButtons)
    : [];

  // For InnoCheck, ensure frozen options are always selected
  const isInnoCheckMode =
    !queryParams.get("q") ||
    queryParams.get("q").toLowerCase() === "innocheck";
  if (isInnoCheckMode) {
    // Filter to only include valid InnoCheck options
    initialSelectedButtons = initialSelectedButtons.filter(btn => innoCheckButtonValues.includes(btn));
    
    // Ensure frozen options are always included
    frozenOptions.forEach((option) => {
      if (!initialSelectedButtons.includes(option)) {
        initialSelectedButtons = [...initialSelectedButtons, option];
      }
    });
  }

  setSelectedButtons(initialSelectedButtons);
}, [navigate, location.search]); // Add location.search as dependency

  useEffect(() => {
    localStorage.setItem("selectedButtons", JSON.stringify(selectedButtons));
  }, [selectedButtons]);

  const handleButtonClickNew = (value, setStateFn) => {
  // Define queryParams locally
  const queryParams = new URLSearchParams(location.search);
  
  // Check if this is InnoCheck and option is frozen
  const isInnoCheckMode =
    !queryParams.get("q") ||
    queryParams.get("q").toLowerCase() === "innocheck";
  const isOptionFrozen = isInnoCheckMode && frozenOptions.includes(value);

  // If option is frozen, prevent deselection
  if (isOptionFrozen) {
    setStateFn((prev) => {
      if (!prev.includes(value)) {
        return [...prev, value];
      }
      return prev; // If already selected, don't change
    });
    return;
  }

  // Normal toggle behavior for non-frozen options
  setStateFn((prevSelected) =>
    prevSelected.includes(value)
      ? prevSelected.filter((button) => button !== value)
      : [...prevSelected, value]
  );
};

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      console.log("File selected:", selectedFile.name);
    }
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleUpload = async (file = null, textContent = "", keywords) => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const u_id = user ? Number(user.id) : null;
    const storedProjectId = localStorage.getItem("project_id");
    const storedPdfText = localStorage.getItem("pdfText");

    if (!u_id) {
      showError("User not found. Please log in again.");
      return;
    }

    if (!file && !textContent && storedProjectId && storedPdfText) {
      textContent = storedPdfText;
    }

    if (!file && !textContent) {
      showError("Please provide either a file or text input.");
      return;
    }

    // if (keywords.length === 0) {
    //   showError(
    //     "Please select at least one keyword before generating the report."
    //   );
    //   return;
    // }

    if (!file && textInput.length < 50) {
      showWarning("More Description Of Invention Needed.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (textContent) formData.append("text", textContent);
    formData.append("u_id", u_id);
    formData.append("keywords", JSON.stringify(keywords));
    if (storedProjectId) formData.append("project_id", storedProjectId);

    try {
      console.log("Sending request to /upload with FormData:", formData);
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data.project_id) {
        const projectId = storedProjectId || response.data.project_id;
        showSuccess(`Project initiated successfully! Project ID: ${projectId}`);
        localStorage.setItem("project_id", projectId);
        localStorage.setItem("selectedProject", projectId);
        localStorage.setItem("pdfText", response.data.text || textContent);
        localStorage.setItem("pdf_Text", response.data.text || textContent);
        setReportGenerated(true);

        // Dynamic navigation based on 'q' parameter
        const queryParams = new URLSearchParams(location.search);
        const qValue = queryParams.get("q")?.toLowerCase();
        let navigateTo;
        switch (qValue) {
          case "innocheck":
            navigateTo = "/innoCheckNext";
            break;
          case "provisional":
            navigateTo = "/ProvisioDraft";
            break;
          case "draftmaster":
            navigateTo = "/DraftMaster";
            break;
          default:
            navigateTo = "/innoCheckNext"; // Fallback for safety
        }
        navigate(navigateTo);
      } else {
        showError("Failed to process project. Please try again.");
      }
    } catch (error) {
      console.error("Full error object:", error);
      showError(
        `Error: ${
          error.response?.data?.error || error.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSearchReport = () => {
    const queryParams = new URLSearchParams(location.search);
    const qValue = queryParams.get("q")?.toLowerCase();
    let keywords;
    if (qValue === "provisional") {
      keywords = provisionalSelectedButtons;
    } else if (qValue === "draftmaster") {
      keywords = draftMasterSelectedButtons;
    } else {
      keywords = selectedButtons; // Default to innoCheck
    }
    handleUpload(file, textInput, keywords);
  };

  // Dynamic heading based on the 'q' query parameter
  const queryParams = new URLSearchParams(location.search);
  const qValue = queryParams.get("q");
  let headingParam = "InnoCheck";
  let description =
    "Conduct a comprehensive search to assess invention's uniqueness.";

  if (qValue) {
    switch (qValue.toLowerCase()) {
      case "innocheck":
        headingParam = "Search Report";
        description =
          "Conduct a comprehensive search to assess invention's uniqueness.";
        break;
      case "provisional":
        headingParam = "Provisional Draft";
        description =
          "Generate a comprehensive provisional patent specification.";
        break;
      case "draftmaster":
        headingParam = "Non-provisional Draft";
        description =
          "Generate a detailed non-provisional patent application with description and claims.";
        break;
      default:
        headingParam = qValue;
        break;
    }
  }

  const isInnoCheckMode = !qValue || qValue.toLowerCase() === "innocheck";

  return (
    <div className="container-fluid new-padd">
      <p style={{ fontSize: "16px" }}>
        <b>{headingParam}</b> - {description}
      </p>
      <div className="row">
        <div className="col-lg-6 col-md-7 col-sm-12 mar-bott-res">
          <div className="main-content">
            <div className="cont-nit">
              <div
                className="container new-cont-res"
                style={{ padding: "40px 10px 30px 10px" }}
              >
                <textarea
                  className="p-3 w-100 textarea-stl"
                  rows="10"
                  cols="50"
                  placeholder="Please enter the details of your disclosure."
                  value={textInput}
                  onChange={handleTextChange}
                ></textarea>
              </div>
              <div
                id="UploadPDF"
                style={{
                  padding: "10px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="left paper-pin-res">
                  <input
                    type="file"
                    accept=".pdf, .docx"
                    id="fileUpload"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                    <FaPaperclip
                      size={30}
                      color="rgb(5 142 192)"
                      style={{ transform: "rotate(-45deg)" }}
                    />
                  </label>
                  {loading && (
                    <OrbitProgress
                      variant="spokes"
                      color="#32cd32"
                      size="small"
                      text="Processing..."
                      textColor="#bfa7a7"
                    />
                  )}
                  {fileName && (
                    <span
                      style={{
                        color: "#333",
                        fontSize: "14px",
                        marginLeft: "10px",
                      }}
                    >
                      {fileName}
                    </span>
                  )}
                </div>
                <div className="right">
                  <button
                    className="btn-stl-4 w-auto h-auto"
                    onClick={handleGenerateSearchReport}
                    disabled={loading}
                  >
                    Generate {headingParam} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-5 col-sm-12">
          {/* InnoCheck content selection */}
          {(!qValue || qValue.toLowerCase() === "innocheck") && (
            <div>
              <div className="header-with-select-all">
                <h6 style={{ color: "#008CBF", margin: 0 }}>
                  1 - Select contents of the Novelty Search Report
                </h6>
                <div
                  className="select-all-container"
                  onClick={() =>
                    handleSelectAll(
                      setSelectedButtons,
                      innoCheckButtonValues,
                      selectedButtons,
                      frozenOptions
                    )
                  }
                >
                  <div
                    className="select-all-checkbox"
                    style={{
                      backgroundColor: areAllSelected(
                        selectedButtons,
                        innoCheckButtonValues,
                        frozenOptions
                      )
                        ? "#008CBF"
                        : "white",
                    }}
                  >
                    {areAllSelected(
                      selectedButtons,
                      innoCheckButtonValues,
                      frozenOptions
                    ) && (
                      <span style={{ color: "white", fontSize: "10px" }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="select-all-label">
                    {areAllSelected(
                      selectedButtons,
                      innoCheckButtonValues,
                      frozenOptions
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </span>
                </div>
              </div>
              <div>
                {innoCheckButtonValues.map((value) => {
                  const isOptionFrozen = frozenOptions.includes(value);
                  return (
                    <div
                      key={value}
                      className={`innoCheck-btn-res ${
                        isOptionFrozen ? "frozen-option" : ""
                      }`}
                      style={{ display: "inline-block", margin: "5px" }}
                    >
                      <button
                        onClick={() =>
                          handleButtonClickNew(value, setSelectedButtons)
                        }
                        className="btn-stl-3 w-auto"
                        style={{
                          border: selectedButtons.includes(value)
                            ? "2px solid green"
                            : "2px solid gray",
                          background: selectedButtons.includes(value)
                            ? "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)"
                            : "#fff",
                          padding: "5px",
                          cursor: isOptionFrozen ? "default" : "pointer",
                          position: "relative",
                        }}
                      >
                        {value}
                        {isOptionFrozen && (
                          <span
                            className="frozen-indicator"
                            title="Required option"
                          >
                            <FaLock size={8} />
                          </span>
                        )}
                        {selectedButtons.includes(value) && !isOptionFrozen && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleButtonClickNew(value, setSelectedButtons);
                            }}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              cursor: "pointer",
                              color: "#008CBF",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              width: "16px",
                              height: "16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              lineHeight: "1",
                              border: "1.5px solid #008CBF",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            ×
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              <h6 className="mt-5" style={{ color: "#008CBF" }}>
                2 - Select the next action (Available after project creation)
              </h6>
              <SaveSearchReport />
            </div>
          )}

          {/* Provisional Draft content selection */}
          {qValue === "provisional" && (
            <div>
              <div className="header-with-select-all">
                <h6 style={{ color: "#008CBF", margin: 0 }}>
                  Key Fields in the Provisional Draft
                </h6>
              </div>
              <div>
                {provisionalButtonValues.map((value) => (
                  <div
                    key={value}
                    style={{ display: "inline-block", margin: "5px" }}
                  >
                    <button
                      className="btn-stl-3 w-auto"
                      style={{
                        border: "2px solid green",
                        background:
                          "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                        padding: "5px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {value}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Provisional Draft content selection */}
          {qValue === "draftmaster" && (
            <div>
              <div className="header-with-select-all">
                <h6 style={{ color: "#008CBF", margin: 0 }}>
                  Key Fields in the Non-Provisional Draft
                </h6>
              </div>
              <div>
                {draftMasterButtonValues.map((value) => (
                  <div
                    key={value}
                    style={{ display: "inline-block", margin: "5px" }}
                  >
                    <button
                      className="btn-stl-3 w-auto"
                      style={{
                        border: "2px solid green",
                        background:
                          "linear-gradient(90deg, rgba(204, 253, 216, 1) 0%, rgba(177, 220, 236, 1) 35%, rgba(152, 190, 252, 1) 100%)",
                        padding: "5px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {value}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnoCheck;
