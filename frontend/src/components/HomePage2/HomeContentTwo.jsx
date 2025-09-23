import React, { useState, useEffect } from "react";
import "../../assets/css/homeContent2.css";
import { useNavigate } from "react-router-dom";
import { MdOutlineHorizontalRule } from "react-icons/md";
import GenerateIDFModal from "../GenerateIDF/GenerateIDFModal";

export default function HomeContentTwo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("User Data:", userData);

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
    setLoading(false);
  }, [navigate]);

  const handleCardClick = (path, queryValue) => {
    const userData = localStorage.getItem("user");
    if (path === "/innoCheck") {
      localStorage.clear();
      if (userData) localStorage.setItem("user", userData);
      console.log("localStorage after update:", localStorage.getItem("user"));
      console.log("projectData:", localStorage.getItem("projectData"));
    }
    navigate(`${path}?q=${queryValue}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const suggestionMessage =
    "This module is not available in the current version. Please contact sales team to upgrade.";

  return (
    <div className="homeContent2 container">
      <div className="upper-head-text">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="head-clr">
            Hello,{" "}
            <span style={{ color: "#38B6FF" }}>
              {user ? user.name : "Guest"}
            </span>
          </h2>
        </div>
        <h2 className="head-clr">What are we working on today?</h2>
      </div>

      <div>
        <div className="row">
          {/* InnoCheck Card */}
          <div className="col-lg-20 col-md-6 col-sm-12 mar-bott-res">
            <div
              className="card-stl-1"
              onClick={() => handleCardClick("/innoCheck", "innocheck")}
              style={{ cursor: "pointer" }}
            >
              <h5>InnoCheck</h5>
              <p className="para-stl">
                Conduct a comprehensive search to assess invention's uniqueness.
              </p>
              <i
                className="bi bi-arrow-right-circle-fill err-icon-stl"
              ></i>
            </div>
          </div>

          {/* ProvisioDraft Card */}
          <div className="col-lg-20 col-md-6 col-sm-12 mar-bott-res">
            <div
              className="card-stl-1"
              onClick={() => handleCardClick("/innoCheck", "provisional")}
              style={{ cursor: "pointer" }}
            >
              <h5>ProvisioDraft</h5>
              <p className="para-stl">
                Generate a comprehensive provisional patent specifications.
              </p>
              <i
                className="bi bi-arrow-right-circle-fill err-icon-stl"
              ></i>
            </div>
          </div>

          {/* DraftMaster Card */}
          <div className="col-lg-20 col-md-6 col-sm-12 mar-bott-res">
            <div
              className="card-stl-1"
              onClick={() => handleCardClick("/innoCheck", "draftmaster")}
              style={{ cursor: "pointer" }}
            >
              <h5>DraftMaster</h5>
              <p className="para-stl">
                Generate a detailed non-provisional patent application. with
                description and claims.
              </p>
              <i
                className="bi bi-arrow-right-circle-fill err-icon-stl"
              ></i>
            </div>
          </div>

          {/* IDS Pro Card - Updated with Hover Effect */}
          <div
            className="col-lg-20 col-md-6 col-sm-12 mar-bott-res blocked-btn"
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredCard("IDSPro")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-stl-1">
              <h5>IDS Pro</h5>
              <p className="para-stl">
                Generate an Information Disclosure Statement with InnoCheck
                references.
              </p>
              <i className="bi bi-arrow-right-circle-fill err-icon-stl"></i>
            </div>
            {hoveredCard === "IDSPro" && (
              <div className="suggestion-box">{suggestionMessage}</div>
            )}
          </div>

          {/* QuickForms Card - Updated with Hover Effect */}
          <div
            className="col-lg-20 col-md-6 col-sm-12 mar-bott-res blocked-btn"
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredCard("QuickForms")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-stl-1">
              <h5>QuickForms</h5>
              <p className="para-stl">
                Generate accurate, ready-to-file USPTO application forms
                seamlessly.
              </p>
              <i className="bi bi-arrow-right-circle-fill err-icon-stl"></i>
            </div>
            {hoveredCard === "QuickForms" && (
              <div className="suggestion-box">{suggestionMessage}</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="bottom-para para-stl-1">
          <span style={{ margin: "0 10px" }}>
            <MdOutlineHorizontalRule />
          </span>
          <a
            className="down-idf"
            href="/documents/IDF_template.docx"
            style={{ textDecoration: "none" }}
            download
          >
            Download Invention Disclosure Form (IDF)
          </a>
          <span style={{ margin: "0 10px" }}>
            <MdOutlineHorizontalRule />
          </span>
          <a
            className="down-idf"
            href="/CreateIDF"
            style={{ textDecoration: "none" }}
          >
            Create IDF
          </a>
          <span style={{ margin: "0 10px" }}>
            <MdOutlineHorizontalRule />
          </span>
          <a 
            className="down-idf"
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setShowGenerateModal(true);
            }}
            style={{ textDecoration: "none" }}
          >
            Generate IDF from any document
          </a>
        </p>
      </div>

      {/* Add the Generate IDF Modal */}
      <GenerateIDFModal 
        show={showGenerateModal} 
        onHide={() => setShowGenerateModal(false)} 
      />
    </div>
  );
}
