// frontend/src/components/Projects/Projects.jsx

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import Navbar from "../HomePage2/NavbarTwo";

// --- Styled Components Definitions ---
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  h1 {
    color: #333;
    margin: 0;
    margin-right: 10px;
    font-size: 1.8em;
  }
  span {
    background: #e0f7fa;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 14px;
    color: #006064;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-top: 10px;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 700px;
  padding: 10px;
`;

const ProjectRow = styled.div`
  display: grid;
  grid-template-columns: 40px minmax(250px, 2fr) 110px repeat(
      3,
      minmax(110px, 1fr)
    );
  align-items: center;
  gap: 15px;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer; // Make row clickable
  transition: background-color 0.15s ease-in-out; // Optional hover effect

  &:hover {
    background-color: #f8f9fa; // Optional hover background
  }

  &:last-child {
    border-bottom: none;
  }
  &.header-row {
    border-bottom: 2px solid #ccc;
    font-weight: bold;
    color: #333;
    padding-bottom: 10px;
    margin-bottom: 5px;
    background-color: #f8f9fa;
    grid-template-columns: 40px minmax(250px, 2fr) 110px repeat(
        3,
        minmax(110px, 1fr)
      );
    cursor: default; // Header row shouldn't be clickable
     &:hover {
        background-color: #f8f9fa; // Keep header background consistent
     }
  }
`;

const ProjectTitleDisplay = styled.div`
  font-weight: 500;
  color: #555;
  font-size: 0.9em;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Step = styled.div`
  text-align: center;
  color: ${(props) => (props.hasAnyModuleData ? "#1976d2" : "#999")};
  font-size: 0.9em;
  position: relative;
  padding: 6px 5px;
  border-radius: 15px;
  font-weight: ${(props) => (props.hasAnyModuleData ? "600" : "normal")};
  background: ${(props) => (props.hasAnyModuleData ? "#e3f2fd" : "transparent")};
  box-shadow: none;
  transition: all 0.2s ease;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UpdatedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color:rgb(33, 183, 127);
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  z-index: 1;
`;

const InitiationDate = styled.div`
  border: 1px solid #ccc;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 12px;
  text-align: center;
  background-color: #f8f9fa;
  white-space: nowrap;
`;

const ProjectId = styled.div`
  color: #2196f3;
  font-weight: bold;
  /* cursor: pointer; // Removed - row is clickable */
  text-decoration: none;
  white-space: nowrap;
  /* &:hover { // Removed - row handles hover
    text-decoration: underline;
  } */
`;

const ProjectIdentifier = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 30px;
`;

const Button = styled.button`
  width: auto;
  border-radius: 20px;
  border: 1px solid #008cbf;
  background: white;
  color: #008cbf;
  cursor: pointer;
  padding: 8px 18px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: #e0f7fa;
    color: #007aae;
  }
`;

const ShowMoreButton = styled(Button)`
  margin: 20px auto 0;
  display: block;
  width: 200px;
  background: #f0f8ff;

  &:hover {
    background: #e0f7fa;
  }
`;

const NoProjects = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #777;
  font-size: 1.1em;
  border: 1px dashed #ccc;
  border-radius: 8px;
  margin-top: 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #555;
`;

const ErrorMessage = styled.div`
  color: red;
  background-color: #ffebee;
  border: 1px solid #e57373;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
`;

// --- Component Logic ---
export default function Projects() {
  const [allProjects, setAllProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0); // Keep if using fetched count
  const [page, setPage] = useState(1);
  const projectsPerPage = 5;

  const navigate = useNavigate();
  const location = useLocation();
  const steps = ["InnoCheck", "ProvisioDraft", "DraftMaster"];

  // Get User Data
  const getUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }, []);

  const user = getUserData();
  const u_id = user?.id;

  // Fetch Project Count
  useEffect(() => {
    const fetchCount = async () => {
       if (!u_id) return;
      try {
        const response = await axios.get(`/count?u_id=${u_id}`);
        setCount(response.data.count);
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };
    if (u_id) { // Only fetch if u_id is available
        fetchCount();
    }
  }, [u_id]);

  // Fetch Projects List
  useEffect(() => {
    if (!u_id) {
      setError("User not logged in or user data is missing.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    axios.get(`/inventions?u_id=${u_id}`)
      .then(response => {
        if (!isMounted) return;
        if (Array.isArray(response.data)) {
          setAllProjects(response.data);
          setDisplayedProjects(response.data.slice(0, projectsPerPage));
        } else {
          console.error("API returned non-array data:", response.data);
          throw new Error("Received invalid data format from the server.");
        }
      })
      .catch(error => {
        if (!isMounted) return;
        console.error("Error fetching projects:", error);
        setAllProjects([]);
        setDisplayedProjects([]);
        let errorMessage = "Could not fetch projects. Please try again.";
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = error.response.data?.message || null; // Use backend message or null for 404
          } else {
            errorMessage = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
          }
        } else if (error.request) {
            errorMessage = "Network error. Could not reach the server.";
        } else {
            errorMessage = error.message; // Use generic error message if no response/request info
        }
        if (errorMessage) {
            setError(errorMessage);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [u_id, projectsPerPage]); // Add projectsPerPage dependency

  // Handle "Show More" Button
  const handleShowMore = () => {
    const nextPage = page + 1;
    const startIndex = page * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const nextBatch = allProjects.slice(startIndex, endIndex);

    if (nextBatch.length === 0) return;

    setDisplayedProjects((prev) => [...prev, ...nextBatch]);
    setPage(nextPage);
  };

  // Format Date Utility
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  // Handle "New Project" Button Click
 const handleNewProjectClick = () => {
    try {
      const preserveKeys = ["user", "activeTabs"]; // Keep user and tab history
       Object.keys(localStorage).forEach((key) => {
          if (!preserveKeys.includes(key)) {
              localStorage.removeItem(key);
          }
      });
      navigate("/innocheck");
    } catch (error) {
      console.error("Error preparing for new project:", error);
       setError("Failed to clear previous project data. Please refresh.")
      navigate("/innocheck"); // Still attempt navigation
    }
  };

  // Save Active Tab Utility
  const saveActiveTab = useCallback((projectId, tab) => {
      if (!projectId || !tab) return;
        try {
            let activeTabs = {};
            const storedTabs = localStorage.getItem("activeTabs");
            if (storedTabs) {
                try {
                 activeTabs = JSON.parse(storedTabs);
                 if (typeof activeTabs !== 'object' || activeTabs === null) activeTabs = {};
                } catch (e) { activeTabs = {}; } // Reset on parse error
            }
            activeTabs[projectId] = tab;
            localStorage.setItem("activeTabs", JSON.stringify(activeTabs));
        } catch (e) {
            console.error("Error saving active tab:", e);
        }
  }, []); // No dependencies needed

  // Effect to Save Active Tab on Location Change
  useEffect(() => {
    const currentProjectId = localStorage.getItem("project_id");
    if (currentProjectId) {
      const currentPath = location.pathname.toLowerCase();
      let currentTab = "InnoCheck"; // Default
      if (currentPath.includes("/provisiodraft")) currentTab = "ProvisioDraft";
      else if (currentPath.includes("/draftmaster")) currentTab = "DraftMaster";
      else if (currentPath.includes("/innocheck")) currentTab = "InnoCheck";

      // Only save if not on the projects page itself
      if (!currentPath.endsWith('/projects')) {
         saveActiveTab(currentProjectId, currentTab);
      }
    }
  }, [location.pathname, saveActiveTab]); // Depend on location and the save function


  // Unified Project Row Click Handler for Navigation
  const handleProjectNavigation = useCallback(async (project) => {
  if (!project || !project.project_id || !u_id) {
    setError("Cannot load project: Missing essential data.");
    console.error("Missing data for navigation:", { project, u_id });
    return;
  }

  const targetModule = project.lastWorkedModule || "InnoCheck"; // Default to InnoCheck if null/undefined
  let targetPath = "/innocheck";

  switch (targetModule) {
    case "ProvisioDraft": 
      targetPath = "/provisiodraft"; 
      break;
    case "DraftMaster":   
      targetPath = "/draftmaster";   
      break;
    case "InnoCheck":     
      targetPath = "/innoCheckNext"; // Changed from /innocheck to /innoCheckNext
      break;
    default:              
      targetPath = "/innocheck";     
      break; // Default case for new projects
  }

  console.log(`Navigating Project ID: ${project.project_id} to ${targetPath} (Last Worked: ${project.lastWorkedModule || 'None'})`);
  setLoading(true);
  setError(null);

  try {
    // Set localStorage context
    const preserveKeys = ["user", "activeTabs"];
    Object.keys(localStorage).forEach((key) => {
      if (!preserveKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem("selectedProject", project.project_id);
    localStorage.setItem("project_id", project.project_id);
    localStorage.setItem("projectData", JSON.stringify(project));
    if (project?.pdf_text) {
      localStorage.setItem("pdfText", project.pdf_text);
    } else {
      localStorage.removeItem("pdfText");
    }

    // IMPORTANT: New code for InnoCheck Next
    // If navigating to InnoCheckNext, fetch InnoCheck data to set required localStorage values
    if (targetPath === "/innoCheckNext") {
      try {
        const innoCheckResponse = await axios.get("/api/getInnocheck", {
          params: { project_id: project.project_id }
        });
        
        if (innoCheckResponse.data && innoCheckResponse.data.length > 0) {
          const innoCheckData = innoCheckResponse.data[0];
          
          // Set selected_buttons in localStorage
          if (innoCheckData.selected_buttons && Array.isArray(innoCheckData.selected_buttons)) {
            localStorage.setItem("selectedButtons", JSON.stringify(innoCheckData.selected_buttons));
          }
          
          // REMOVE THE FOLLOWING LINE. IT IS THE SOURCE OF THE BUG.
          // localStorage.setItem("generateButtonClicked_innoCheckNext", "true");
        }
      } catch (innoCheckError) {
        console.warn("Error fetching InnoCheck data:", innoCheckError);
        // Continue navigation even if fetch fails
      }
    }


    // Set flag to indicate navigation from Projects page
localStorage.setItem("navigatedFromProjects", "true");

// Save the tab we are navigating *to* as the last active one
saveActiveTab(project.project_id, targetModule);

navigate(targetPath);

  } catch (error) {
    console.error("Error setting up project context or navigating:", error);
    setError("Failed to load the selected project module.");
    setLoading(false);
  }
}, [u_id, navigate, saveActiveTab, setLoading, setError]);

  // --- JSX Rendering ---
  return (
    <>
      <Navbar />
      <Container style={{ marginTop: "100px" }}>
        <Header>
          <h1>PROJECTS</h1>
        </Header>

        {loading && <LoadingMessage>Loading your Projects...</LoadingMessage>}
        {error && !loading && <ErrorMessage>{error}</ErrorMessage>}

        {!loading && !error && (
          <>
            <TableWrapper>
              <ProjectList>
                {/* Header Row */}
                <ProjectRow className="header-row">
                   <div>#</div>
                   <div>Project</div>
                   <div>Created</div>
                   {steps.map((step) => (
                     <div key={step} style={{ textAlign: "center" }}>{step}</div>
                   ))}
                 </ProjectRow>

                {/* Project Data Rows */}
                {displayedProjects.map((project, index) => {
                   if (!project || !project.project_id) return null; // Skip if no project_id
                   const lastWorked = project.lastWorkedModule;
                   const hasAnyModuleData = !!lastWorked;

                   return (
                    <ProjectRow
                      key={project._id || project.project_id}
                      onClick={() => handleProjectNavigation(project)} // Attach click handler here
                      title={`Open project ${project.project_id} (Last worked: ${lastWorked || 'None'})`}
                    >
                       <div style={{ textAlign: "center", color: "#777" }}>{index + 1}</div>
                       <ProjectIdentifier>
                         <ProjectId>{/* No onClick needed here */}
                           ID: {project.project_id}
                         </ProjectId>
                         <ProjectTitleDisplay title={project.project_title || "Untitled Project"}>
                           {project.project_title || "Untitled Project"}
                         </ProjectTitleDisplay>
                       </ProjectIdentifier>
                       <InitiationDate>{formatDate(project.createdAt)}</InitiationDate>

                       {/* Steps and Badge */}
                       {steps.map((step) => {
                         const isLastUpdated = lastWorked === step;
                         return (
                           <Step
                             key={`${project.project_id}-${step}`}
                             hasAnyModuleData={hasAnyModuleData}
                           >
                             {isLastUpdated && <UpdatedBadge>Last Worked</UpdatedBadge>}
                             {step}
                           </Step>
                         );
                       })}
                    </ProjectRow>
                   );
                 })}
              </ProjectList>
            </TableWrapper>

            {/* No Projects Message */}
            {displayedProjects.length === 0 && (
              <NoProjects>
                You haven't started any projects yet. Click "NEW PROJECT" below to begin!
              </NoProjects>
            )}

            {/* Show More Button */}
            {displayedProjects.length > 0 && displayedProjects.length < allProjects.length && (
              <ShowMoreButton onClick={handleShowMore}>Show More Projects</ShowMoreButton>
            )}
          </>
        )}

        {/* Buttons Group */}
        <ButtonGroup>
          <Button onClick={handleNewProjectClick}>+ NEW PROJECT</Button>
        </ButtonGroup>
      </Container>
    </>
  );
}