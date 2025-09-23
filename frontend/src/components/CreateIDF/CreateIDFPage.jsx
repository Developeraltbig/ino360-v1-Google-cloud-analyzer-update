// frontend/src/components/CreateIDF/CreateIDFPage.jsx
import React from "react";
import NavbarTwo from "../HomePage2/NavbarTwo";
import CreateIDFForm from "./CreateIDFForm";

function CreateIDFPage() {
  return (
    <div>
      <NavbarTwo />
      <div className="container-fluid new-padd">
        <h5 className="dash-head" style={{ color: "rgb(0 140 191)" }}>
          Create Invention Disclosure Form
        </h5>
        <p style={{ fontSize: "16px" }}>
          Fill out the form below to create your Invention Disclosure Form (IDF)
        </p>
        <CreateIDFForm />
      </div>
    </div>
  );
}

export default CreateIDFPage;
