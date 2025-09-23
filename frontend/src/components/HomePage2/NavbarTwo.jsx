import React from "react";
import "../../assets/css/navbar.css";
import logo1 from "../../assets/images/logo/ino360-logo-new.png";
import { useNavigate } from "react-router-dom";
import UserProfileDropdown from "../shared/UserProfileDropdown";
import { FaTasks } from "react-icons/fa";

export default function NavbarTwo() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handlePage = () => {
    if (user) {
      navigate("/homeTwo");
    } else {
      navigate("/");
    }
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
            <a className="history-button" onClick={() => navigate("/projects")}>
              <FaTasks className="history-icon" /> {/* Updated icon */}
              Projects {/* Changed from "History" to "Projects" */}
            </a>
          </li>

          {!user ? (
            <li className="btn-stl-2 left-btn">
              <button onClick={() => navigate("/homeTwo")}>Login</button>
            </li>
          ) : (
            <li className="user-dropdown-container">
              <UserProfileDropdown />
            </li>
          )}
        </ul>
      </header>
    </>
  );
}