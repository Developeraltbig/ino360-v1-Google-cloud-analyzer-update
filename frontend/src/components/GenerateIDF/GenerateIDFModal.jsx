// frontend/src/components/GenerateIDF/GenerateIDFModal.jsx
import React, { useState, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Packer } from 'docx';
import './GenerateIDF.css';

// Import our document generator
import { generateIDFDocument } from './generateIDFDocument';

const GenerateIDFModal = ({ show, onHide }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 2) {
      setError('Please select a maximum of 2 files');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  // New function to remove a file
  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    
    // If we removed the last file, reset the file input
    if (files.length === 1) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setProcessing(true);
    setError('');
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/generateIDF', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // Increase timeout to 2 minutes
      });

      if (response.data && response.data.idfData) {
        setGeneratedData(response.data.idfData);
        await generateDocx(response.data.idfData);
        setSuccess(true);
      } else {
        setError('Failed to generate IDF from documents');
      }
    } catch (err) {
      console.error('Error generating IDF:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Error processing your request';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const generateDocx = async (data) => {
    try {
      // Create document using our utility function
      const doc = generateIDFDocument(data);
      
      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = 'Generated_IDF.docx';
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Error generating document:', err);
      setError('Error generating DOCX file');
      return false;
    }
  };

  const handleUseInModule = (module) => {
    if (!generatedData) return;
    
    // Store data in localStorage for use in other modules
    // Convert to a format similar to what the other modules expect
    let consolidatedText = `INVENTION TITLE: ${generatedData.inventionTitle || ""}\n\n`;
    consolidatedText += `PROBLEM STATEMENT: ${generatedData.problemStatement || ""}\n\n`;
    consolidatedText += `SOLUTION STATEMENT: ${generatedData.solutionStatement || ""}\n\n`;
    consolidatedText += `NOVELTY STATEMENT: ${generatedData.noveltyStatement || ""}\n\n`;
    consolidatedText += `POTENTIAL APPLICATIONS: ${generatedData.potentialApplications || ""}\n\n`;
    
    localStorage.setItem('pdfText', consolidatedText);
    
    // Navigate to appropriate module
    switch(module) {
      case 'innocheck':
        navigate('/innocheck?q=innocheck');
        break;
      case 'provisional':
        navigate('/innocheck?q=provisional');
        break;
      case 'draftmaster':
        navigate('/innocheck?q=draftmaster');
        break;
      default:
        navigate('/innocheck');
    }
  };
  
  const resetModal = () => {
    // Only prevent closing if processing is active
    if (!processing) {
      setFiles([]);
      setError('');
      setSuccess(false);
      setGeneratedData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onHide();
    }
  };

  // User can close modal any time except when processing
  const canClose = !processing;

  return (
    <Modal 
      show={show} 
      onHide={resetModal}
      backdrop={processing ? "static" : true}
      keyboard={canClose}
      centered
      size="lg"
      className="generate-idf-modal"
    >
      <Modal.Header closeButton={canClose}>
        <Modal.Title className="modal-title">Generate IDF from Document</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {!processing && !success ? (
          <div className="upload-section">
            <p className="instruction-text">
              We can generate an Invention Disclosure Form (IDF) from your research documents or publications. 
              Upload 1-2 PDF or DOCX files and we'll extract the key invention details.
            </p>
            
            <div className="file-upload-container">
              <input 
                type="file" 
                className="file-input form-control" 
                onChange={handleFileChange}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                ref={fileInputRef}
                disabled={processing}
              />
              <div className="form-helper-text">Maximum 2 files. Supported formats: PDF, DOCX</div>
            </div>
            
            {files.length > 0 && (
              <div className="selected-files-container">
                <h6 className="selected-files-title">Selected files:</h6>
                <ul className="selected-files-list">
                  {files.map((file, index) => (
                    <li key={index} className="file-item d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-file-earmark-text file-icon"></i>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </div>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFile(index)}
                      >
                        <i className="bi bi-x"></i> Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : processing ? (
          <div className="processing-container">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h5 className="processing-title">Analyzing Your Documents</h5>
            <p className="processing-description">
              We're extracting invention details and generating your IDF. 
              This may take around 30-60 seconds.
            </p>
            <p className="processing-note">
              Please don't close this window until the process is complete.
            </p>
          </div>
        ) : success ? (
          <div className="success-container">
            <div className="success-icon-container">
              <i className="bi bi-check-circle-fill success-icon"></i>
            </div>
            <h5 className="success-title">IDF Generated Successfully!</h5>
            <p className="success-description">
              Your IDF document has been generated and downloaded as "Generated_IDF.docx".
            </p>
            
            <div className="module-selection-container">
              <h6 className="module-title">Use this IDF data in:</h6>
              <div className="module-buttons">
                <button 
                  className="module-button innocheck-btn"
                  onClick={() => handleUseInModule('innocheck')}
                >
                  InnoCheck
                </button>
                <button 
                  className="module-button provisio-btn"
                  onClick={() => handleUseInModule('provisional')}
                >
                  ProvisioDraft
                </button>
                <button 
                  className="module-button draftmaster-btn"
                  onClick={() => handleUseInModule('draftmaster')}
                >
                  DraftMaster
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        {!processing && !success ? (
          <>
            <button 
              className="cancel-btn" 
              onClick={resetModal} 
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              className="generate-btn" 
              onClick={handleSubmit} 
              disabled={files.length === 0 || processing}
            >
              Generate IDF
            </button>
          </>
        ) : success ? (
          <button className="close-btn" onClick={resetModal}>
            Close
          </button>
        ) : null}
      </Modal.Footer>
    </Modal>
  );
};

export default GenerateIDFModal;
