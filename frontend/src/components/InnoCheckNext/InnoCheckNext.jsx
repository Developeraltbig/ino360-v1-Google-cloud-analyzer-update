import React, { useEffect, useState } from "react";
import axios from "axios"; // axios for HTTP requests
import Navbar from "../HomePage/Navbar";
import ContentMainInno from "../ContentMainProvisio/ContentMainInno";

export default function InnoCheckNext() {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user ID and project ID from localStorage
    const userData = localStorage.getItem("user");
    const projectId = localStorage.getItem("project_id"); // Get project_id from localStorage
    const selectedProject = localStorage.getItem("selectedProject"); // Get selectedProject from localStorage

    if (!userData || (!projectId && !selectedProject)) {
      setError("User or Project ID not found in localStorage");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userData); // Parse user data from localStorage
    const u_id = user.id; // Get u_id from user

    // Use projectId or selectedProject to fetch project data
    const projectIdentifier = projectId || selectedProject;

    // Make API call to fetch full project data for the given u_id and project_id
    axios
      .get("/getProjectData", {
        params: { u_id, project_id: projectIdentifier }, // Send both u_id and project_id as query params
      })
      .then((response) => {
        setProjectData(response.data); // Set the full project data from the response
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data");
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs once on component mount

  return (
    <div>
      <Navbar />
      <div className="container-fluid new-padd">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && projectData && (
          <>
            <h5 className="dash-head" style={{ color: "rgb(0 140 191)" }}>
              Project ID - <b>{projectData.project_id}</b>
            </h5>
            <p style={{ fontSize: "16px" }}>
              <b>1 - </b> Select contents of the Novelty Search Report
            </p>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <p style={{ fontSize: "16px", display: "none" }}>
                  Project ID: <b>{projectData.project_id}</b>
                </p>
                <p style={{ fontSize: "16px", display: "none" }}>
                  <b>PDF Text:</b> <br />
                  {projectData.pdf_text}
                </p>
                <ContentMainInno />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
