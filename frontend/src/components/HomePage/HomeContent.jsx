import "../../assets/css/homeContent.css";
import L1 from "../../assets/images/logo/ino360-logo-img.png";
import Login from "./Login";

export default function HomeContent() {
  return (
    <div className="home-content-stl">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="pt-4 text-align-res">
              <a href="#" className="logo">
                <img className="logo-stl-2" src={L1} alt="Logo" />
              </a>
              <p>
                An AI-powered, one-stop app providing novelty assessments,
                provisional and non-provisional application drafting,
                ready-to-file USPTO forms, and Information Disclosure Statements
                (IDS).
              </p>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 first-pad-res">
            <Login />
          </div>
        </div>
        <div>
          <p className="bottom-para">
            <span>-</span> privacy policy <span>-</span> terms of use
          </p>
        </div>
      </div>
    </div>
  );
}
