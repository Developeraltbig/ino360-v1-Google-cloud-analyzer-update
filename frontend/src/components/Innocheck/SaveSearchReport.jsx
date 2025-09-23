import React, { useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Document, Packer, Paragraph, TextRun } from "docx";
// import "../../components/ContentMainProvisio/InvetionDisclosure/PatentDraftingInno";
// import "../../components/ContentMainProvisio/InvetionDisclosure/PatentDraftingInno.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const SaveSearchReport = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [editorContent, setEditorContent] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectData, setProjectData] = useState(null);
  const [draftData, setDraftData] = useState(null);

  const quillRef = React.createRef();

  // Fetch data from the database
  useEffect(() => {
    const fetchInnocheck = async () => {
      console.log("User data from localStorage:", localStorage.getItem("user"));
      console.log(
        "Project ID from localStorage:",
        localStorage.getItem("project_id")
      );
      console.log(
        "Selected Project from localStorage:",
        localStorage.getItem("selectedProject")
      );

      const userData = localStorage.getItem("user");
      const projectId = localStorage.getItem("project_id");
      const selectedProject = localStorage.getItem("selectedProject");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || (!projectId && !selectedProject)) {
        console.log("Missing data:", { user, projectId, selectedProject });
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const projectIdentifier = projectId || selectedProject;

        if (!projectIdentifier) {
          throw new Error("Both project_id and selectedProject are missing.");
        }

        const u_id = user.id;

        const projectResponse = await axios.get(
          "/getProjectData",
          {
            params: { u_id, project_id: projectIdentifier },
          }
        );

        console.log("Fetched project_id:", projectResponse.data.project_id);
        setProjectData(projectResponse.data);

        if (
          projectResponse.data &&
          String(projectResponse.data.project_id) === String(projectIdentifier)
        ) {
          const innocheckResponse = await axios.get(
            "/api/getInnocheck",
            {
              params: { project_id: projectResponse.data.project_id },
            }
          );

          // Inside the fetchInnocheck function, replace:
if (innocheckResponse.data && innocheckResponse.data.length > 0) {
  const existingInnocheck = innocheckResponse.data[0];
  setDraftData(existingInnocheck);

  const content = [
    existingInnocheck.summary_of_invention || "",
    existingInnocheck.key_features || "",
    existingInnocheck.problem_statement || "",
    existingInnocheck.solution_statement || "",
    existingInnocheck.novelty_statement || "",
    existingInnocheck.advantages_of_invention || "",
    existingInnocheck.industrial_applicability || "",
    existingInnocheck.innovators_in_the_field || "",
  ]
    .filter(Boolean)
    .join("\n\n");

  setEditorContent(content);
  setReportGenerated(!!content.trim());
} else {
  showInfo("No search report found in the database, ready to create a new one.");
  setReportGenerated(false);
}
        } else {
          setError(
            `Project ID mismatch: Expected ${projectIdentifier}, but got ${projectResponse.data.project_id}`
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInnocheck();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReloadFlag((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (html) => {
    setEditorContent(html);
    setReportGenerated(!!html.trim());
  };

  const handlePrint4 = () => {
    if (!editorContent.trim()) {
      showWarning("Please generate a search report first!");
      return;
    }
  
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

  // Update the handleDownload4 function in SaveSearchReport.jsx:
const handleDownload4 = () => {
  if (!editorContent.trim()) {
    showWarning("Please generate a search report first!");
    return;
  }

  const quill = quillRef.current.getEditor();
  const textContent = quill.getText();

  const paragraphs = textContent.split("\n").map((line) => {
    return new Paragraph({
      children: [new TextRun(line)],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  Packer.toBlob(doc)
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "editor-content.docx";
      link.click();
    })
    .catch((error) => {
      console.error("Error creating DOCX file:", error);
    });
};

  const handleSaveAndProceed = () => {
    if (!editorContent.trim()) {
      showWarning("Please generate a search report before proceeding!");
      return;
    }
    navigate("/provisioDraft");
  };  

  return (
    <div>
      {loading && <p>Loading data from database...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="d-flex align-items-center justify-content-start flex-wrap">
        <button className="btn-stl-4 w-auto" onClick={handlePrint4}>
          View Search Report
        </button>
        <button className="btn-stl-4 w-auto" onClick={handleDownload4}>
          Download Search Report
        </button>
        <button className="btn-stl-4 w-auto" onClick={handleSaveAndProceed}>
          Save Search Report + Proceed To Drafting Provisional Specification
        </button>
        {/* <button
          className="btn-stl-4 w-auto"
          onClick={() => navigate("/provisioDraft")}
        >
          GENERATE PROVISIONAL DRAFT
        </button> */}
      </div>
    </div>
  );
};

export default SaveSearchReport;
