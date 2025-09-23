// frontend/src/components/HomePage/Navbar.jsx
import React, { useState } from "react";
import "../../assets/css/navbar.css";
import logo1 from "../../assets/images/logo/ino360-logo-new.png";
import { Link, useNavigate } from "react-router-dom";
import { MyVerticallyCenteredModal } from "./Login";
import UserProfileDropdown from "../shared/UserProfileDropdown";
import axios from "axios";
import { MdLogin } from "react-icons/md";
import { useToast } from "../../context/ToastContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const { showSuccess, showError } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  // Check if the user is logged in
  const user = JSON.parse(localStorage.getItem("user"));

  const handlePage = () => {
    if (user) {
      navigate("/homeTwo");
    } else {
      navigate("/");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
  
    setLoginErrorMessage(""); // Clear previous login error messages
  
    if (!loginEmail || !loginPassword) {
      setLoginErrorMessage("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });
  
      if (response.status === 200) {
        showSuccess("Login successful!");
        const { user } = response.data;
        localStorage.setItem("user", JSON.stringify(user)); // Save user info only
        navigate("/homeTwo");
      }
    } catch (error) {
      if (error.response) {
        setLoginErrorMessage(error.response.data.message);
      } else {
        setLoginErrorMessage("An error occurred, please try again later.");
      }
    }
  };
  

  const handleCardClick = (path, queryValue) => {
    return (e) => {
      e.preventDefault(); // Prevent default Link behavior
      const userData = localStorage.getItem("user");
      const projectData = localStorage.getItem("projectData");
      const project_id = localStorage.getItem("project_id");
      // Check if projectData exists in localStorage
      if (projectData || project_id) {
        // If projectData exists, redirect to a specific route based on queryValue
        if (queryValue === "provisional") {
          navigate("/provisioDraft"); // Redirect to ProvisioDraft route
        } else if (queryValue === "innocheck") {
          navigate("/innoCheckNext"); // Redirect to InnoCheck route
        } else if (queryValue === "draftmaster") {
          navigate("/draftMaster"); // Redirect to DraftMaster route
        }
      } else {
        // If projectData doesn't exist, proceed with original handleCardClick logic
        if (path === "/innoCheck") {
          localStorage.clear();
          if (userData) localStorage.setItem("user", userData);
          console.log(
            "localStorage after update:",
            localStorage.getItem("user")
          );
          console.log("projectData:", localStorage.getItem("projectData"));
        }
        navigate(`${path}?q=${queryValue}`);
      }
    };
  };

  return (
    <>
      <header className="header">
        <a href="#" className="logo">
          <img
            className="logo-stl"
            src={logo1}
            alt="Logo"
            onClick={handlePage}
          />
        </a>

        <input className="menu-btn" type="checkbox" id="menu-btn" />
        <label className="menu-icon" htmlFor="menu-btn">
          <span className="navicon"></span>
        </label>
        <ul className="menu">
          <li>
            <Link
              to="/innoCheck"
              onClick={handleCardClick("/innoCheck", "innocheck")}
            >
              InnoCheck
            </Link>
          </li>
          <li>
            <Link
              to="/innoCheck"
              onClick={handleCardClick("/innoCheck", "provisional")}
            >
              ProvisioDraft
            </Link>
          </li>
          <li>
            <Link
              to="/innoCheck"
              onClick={handleCardClick("/innoCheck", "draftmaster")}
            >
              DraftMaster
            </Link>
          </li>
          {user ? (
            <li className="pad-right">
              <Link to="/projects" onClick={() => navigate("/projects")}>
                Projects
              </Link>
            </li>
          ) : (
            <li className="pad-right">
              <Link>
                Projects
              </Link>
            </li>
          )}

          {/* Conditionally render Login button or UserProfileDropdown */}
          {!user ? (
            <li>
              <a className="history-button" onClick={() => setModalShow(true)}>
                <MdLogin className="history-icon" />
                Login
              </a>
            </li>
          ) : (
            <li className="user-dropdown-container">
              <UserProfileDropdown />
            </li>
          )}
        </ul>
      </header>

      {/* Login Modal */}
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        handleLoginSubmit={handleLoginSubmit}
        loginErrorMessage={loginErrorMessage}
      />
    </>
  );
}
