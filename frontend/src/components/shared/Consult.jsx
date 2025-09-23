// frontend/src/components/shared/Consult.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./Consult.css";
import { GrInProgress } from "react-icons/gr";

const Consult = ({ show, handleClose }) => {
  const [projectId, setProjectId] = useState("129083");
  const [selectedReports, setSelectedReports] = useState([]);

  const handleReportSelection = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedReports([...selectedReports, value]);
    } else {
      setSelectedReports(selectedReports.filter((report) => report !== value));
    }
  };

  const handleSend = () => {
    console.log("Sending data:", { projectId, selectedReports });
    alert(
      `Sending request for Project ID: ${projectId} with ${selectedReports.length} report(s) selected.`
    );
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="consult-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Send to AnovIP
          <span style={{ color: "red" }}>
            (Work in progress
            <span style={{ color: "#008cbf" }}>
              <GrInProgress />
            </span>
            )
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="consult-modal-body">
        <p className="text-muted mb-4">
          You can share an AI generated report/draft with our in-house IP
          expert/attorney to get detailed review and further guidance on the
          next steps.
        </p>

        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="form-label-custom">
              Select Project ID
            </Form.Label>
            <Form.Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="form-select-custom"
            >
              <option value="129083">129083 (Current Project)</option>
              <option value="834983">834983</option>
              <option value="983123">983123</option>
              <option value="567890">567890</option>
              <option value="456321">456321</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-custom">
              Select Reports
            </Form.Label>
            <div className="report-options">
              <Form.Check
                type="checkbox"
                id="searchReport"
                label="Search Report"
                value="search"
                className="report-checkbox"
                onChange={handleReportSelection}
              />
              <Form.Check
                type="checkbox"
                id="provisionalDraft"
                label="Provisional Draft"
                value="provisional"
                className="report-checkbox"
                onChange={handleReportSelection}
              />
              <Form.Check
                type="checkbox"
                id="nonProvisionalDraft"
                label="Non-Provisional Draft"
                value="nonprovisional"
                className="report-checkbox"
                onChange={handleReportSelection}
              />
            </div>
          </Form.Group>

          <div className="text-center">
            <Button variant="primary" className="send-btn" onClick={handleSend}>
              Send To AnovIP
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Consult;
