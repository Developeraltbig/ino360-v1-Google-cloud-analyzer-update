import { useEffect, useState } from "react";
// import { personsImgs } from '../../utils/images';
import LOGO from "../../assets/images/logo/logo-image.png";
// import { navigationLinks } from "../../data/data";
import "./Sidebar.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";

const Sidebar = () => {
  const [activeLinkIdx] = useState(1);
  const [sidebarClass, setSidebarClass] = useState("");
  const { isSidebarOpen } = useContext(SidebarContext);

  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarClass("sidebar-change");
    } else {
      setSidebarClass("");
    }
  }, [isSidebarOpen]);

  const scrollToUploadPDF = () => {
    const UploadPDFSection = document.getElementById("UploadPDF");
    if (UploadPDFSection) {
      UploadPDFSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const ScrollToProvisionalDrafting = () => {
    const ProvisionalDraftingSection = document.getElementById(
      "ProvisionalDrafting"
    );
    if (ProvisionalDraftingSection) {
      ProvisionalDraftingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const ScrollToClaims = () => {
    const ClaimsSection = document.getElementById("Claims");
    if (ClaimsSection) {
      ClaimsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const ScrollToPatentDrafting = () => {
    const PatentDraftingSection = document.getElementById("PatentDrafting");
    if (PatentDraftingSection) {
      PatentDraftingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`sidebar ${sidebarClass}`}>
      <div className="user-info">
        <img src={LOGO} alt="Logo img" style={{ width: "140px" }} />
      </div>

      <nav classname="navigation" style={{ marginTop: "40px" }}>
        <ul className="nav-list">
          <li className="nav-item" onClick={scrollToUploadPDF}>
            <a href="#" className="nav-link active">
              <img
                src="/src/assets/icons/home.svg"
                className="nav-link-icon"
                alt="Dashboard"
              />
              <span className="nav-link-text">IDF</span>
            </a>
          </li>

          <li className="nav-item" onClick={ScrollToProvisionalDrafting}>
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/wallet.svg"
                className="nav-link-icon"
                alt="Provisional Drafting"
              />
              <span className="nav-link-text">Provisional Specifications</span>
            </a>
          </li>
          <li className="nav-item" onClick={ScrollToClaims}>
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/bills.svg"
                className="nav-link-icon"
                alt="Claims Drafting"
              />
              <span className="nav-link-text">Claims</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/bills.svg"
                className="nav-link-icon"
                alt="Claims Drafting"
              />
              <span className="nav-link-text">Abstract</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/bills.svg"
                className="nav-link-icon"
                alt="Claims Drafting"
              />
              <span className="nav-link-text">Drawings</span>
            </a>
          </li>
          <li className="nav-item" onClick={ScrollToPatentDrafting}>
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/report.svg"
                className="nav-link-icon"
                alt="Patent Drafting"
              />
              <span className="nav-link-text">Complete Patent Drafting</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/budget.svg"
                className="nav-link-icon"
                alt="5 Easy Steps"
              />
              <span className="nav-link-text">User Guide</span>
            </a>
          </li>

          <li className="nav-item">
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/wealth.svg"
                className="nav-link-icon"
                alt="What is IDF?"
              />
              <span className="nav-link-text">What is IDF?</span>
            </a>
          </li>

          <li className="nav-item">
            <a href="#" className="nav-link null">
              <img
                src="/src/assets/icons/wallet.svg"
                className="nav-link-icon"
                alt="Contact Us"
              />
              <span className="nav-link-text">Contact Us</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
