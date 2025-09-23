import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Consult from "./Consult";
import "./UserProfileDropdown.css";

const UserProfileDropdown = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConsult, setShowConsult] = useState(false);

  const triggerRef = useRef(null);

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const getInitials = () => {
    if (!user.name) return "U";

    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setShowDropdown(false);
  };

  const handleConsultClick = () => {
    setShowConsult(true);
    setShowDropdown(false);
  };

  const handleContactClick = () => {
    console.log("Contact Us clicked");

    setShowDropdown(false);
  };

  return (
    <div className="profile-dropdown-container">
      <div
        ref={triggerRef}
        className="profile-trigger"
        onClick={toggleDropdown}
      >
        <div className="user-avatar">{getInitials()}</div>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className="dropdown-menu-custom">
          <div className="dropdown-section consult-section">
            <button
              className="dropdown-item-custom consult-item"
              onClick={handleConsultClick}
            >
              Consult anovIP
            </button>
          </div>
          {/* <div className="dropdown-section project-item">
            <button
              className="dropdown-item-custom"
              onClick={() => navigate("/projects")}
            >
              Projects 
            </button>
          </div> */}

          <div className="dropdown-section signout-section">
            <button
              className="dropdown-item-custom text-only-item"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>

          <div className="dropdown-section contact-section">
            <button className="dropdown-item-custom text-only-item">
              Contact Us
            </button>
          </div>
        </div>
      )}

      <Consult show={showConsult} handleClose={() => setShowConsult(false)} />
    </div>
  );
};

export default UserProfileDropdown;
