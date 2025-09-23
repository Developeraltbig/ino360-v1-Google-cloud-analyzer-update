// frontend/src/components/CreateIDF/CreateIDFForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType, 
  HeadingLevel,
  Media,
  ImageRun
} from "docx";
import "./CreateIDF.css";

const CreateIDFForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    inventionTitle: "",
    inventors: [
      { name: "", position: "", institution: "", address: "", phone: "", email: "", citizenship: "" }
    ],
    applicants: [
      { name: "", position: "", institution: "", address: "", phone: "", email: "" }
    ],
    problemStatement: "",
    solutionStatement: "",
    briefDescription: "",
    detailedDescription: "",
    keyFeatures: "",
    potentialApplications: "",
    knownPatents: "",
    novelty: "",
    additionalDetails: ""
  });

  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const handleChange = (e, section, index, field) => {
    if (section) {
      // Handle nested objects (inventors, applicants)
      const updatedItems = [...formData[section]];
      updatedItems[index][field] = e.target.value;
      setFormData({ ...formData, [section]: updatedItems });
    } else {
      // Handle simple fields
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [...images];
    const newImageUrls = [...imagePreviewUrls];

    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        newImages.push(file);
        newImageUrls.push(reader.result);
        setImages(newImages);
        setImagePreviewUrls(newImageUrls);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newImageUrls = [...imagePreviewUrls];
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newImageUrls);
  };

  const addItem = (section) => {
    if (section === "inventors") {
      setFormData({
        ...formData,
        inventors: [...formData.inventors, { name: "", position: "", institution: "", address: "", phone: "", email: "", citizenship: "" }]
      });
    } else if (section === "applicants") {
      setFormData({
        ...formData,
        applicants: [...formData.applicants, { name: "", position: "", institution: "", address: "", phone: "", email: "" }]
      });
    }
  };

  const removeItem = (section, index) => {
    if (formData[section].length > 1) {
      const updatedItems = [...formData[section]];
      updatedItems.splice(index, 1);
      setFormData({ ...formData, [section]: updatedItems });
    }
  };

  const generateTableRows = (data, headers) => {
    const rows = [];
    
    // Header row
    const headerRow = new TableRow({
      children: headers.map(header => 
        new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ 
              text: header, 
              bold: true,
              font: "Calibri",
              color: "000000"
            })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        })
      )
    });
    rows.push(headerRow);
    
    // Data rows
    data.forEach((item, i) => {
      // Extract values in the same order as headers
      const values = [];
      values.push(`Inventor ${i+1}`); // Inventor number
      values.push(item.name || "");
      values.push(item.position || "");
      values.push(item.institution || "");
      values.push(item.address || "");
      values.push(item.phone || "");
      values.push(item.email || "");
      values.push(item.citizenship || "");
      
      const cells = values.map(value => 
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: value,
              font: "Calibri",
              color: "000000"
            })]
          })],
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        })
      );
      
      rows.push(new TableRow({ children: cells }));
    });
    
    return rows;
  };

  // New function to consolidate form data into text format
  const consolidateFormData = () => {
    let consolidatedText = "";
    
    // Add Invention Title
    consolidatedText += `INVENTION TITLE: ${formData.inventionTitle || "N/A"}\n\n`;
    
    // Add Inventors Information
    consolidatedText += "INVENTORS INFORMATION:\n";
    formData.inventors.forEach((inventor, index) => {
      consolidatedText += `Inventor ${index + 1}:\n`;
      consolidatedText += `Name: ${inventor.name || "N/A"}\n`;
      consolidatedText += `Position: ${inventor.position || "N/A"}\n`;
      consolidatedText += `Institution: ${inventor.institution || "N/A"}\n`;
      consolidatedText += `Address: ${inventor.address || "N/A"}\n`;
      consolidatedText += `Phone: ${inventor.phone || "N/A"}\n`;
      consolidatedText += `Email: ${inventor.email || "N/A"}\n`;
      consolidatedText += `Citizenship: ${inventor.citizenship || "N/A"}\n\n`;
    });
    
    // Add Applicants Information
    consolidatedText += "APPLICANTS INFORMATION:\n";
    formData.applicants.forEach((applicant, index) => {
      consolidatedText += `Applicant ${index + 1}:\n`;
      consolidatedText += `Name: ${applicant.name || "N/A"}\n`;
      consolidatedText += `Position: ${applicant.position || "N/A"}\n`;
      consolidatedText += `Institution: ${applicant.institution || "N/A"}\n`;
      consolidatedText += `Address: ${applicant.address || "N/A"}\n`;
      consolidatedText += `Phone: ${applicant.phone || "N/A"}\n`;
      consolidatedText += `Email: ${applicant.email || "N/A"}\n\n`;
    });
    
    // Add Problem Statement
    consolidatedText += "PROBLEM STATEMENT:\n";
    consolidatedText += `${formData.problemStatement || "N/A"}\n\n`;
    
    // Add Solution Statement
    consolidatedText += "SOLUTION STATEMENT:\n";
    consolidatedText += `${formData.solutionStatement || "N/A"}\n\n`;
    
    // Add Brief Description
    consolidatedText += "BRIEF DESCRIPTION OF THE INVENTION:\n";
    consolidatedText += `${formData.briefDescription || "N/A"}\n\n`;
    
    // Add Detailed Description
    consolidatedText += "DETAILED TECHNICAL DESCRIPTION:\n";
    consolidatedText += `${formData.detailedDescription || "N/A"}\n\n`;
    
    // Add Key Features
    consolidatedText += "KEY FEATURES AND NOVEL ASPECTS:\n";
    consolidatedText += `${formData.keyFeatures || "N/A"}\n\n`;
    
    // Add Potential Applications
    consolidatedText += "POTENTIAL APPLICATIONS AND USES:\n";
    consolidatedText += `${formData.potentialApplications || "N/A"}\n\n`;
    
    // Add Known Related Patents
    consolidatedText += "KNOWN RELATED PATENTS OR PUBLICATIONS:\n";
    consolidatedText += `${formData.knownPatents || "N/A"}\n\n`;
    
    // Add Novelty
    consolidatedText += "HOW IS THE INVENTION NOVEL:\n";
    consolidatedText += `${formData.novelty || "N/A"}\n\n`;
    
    // Add Additional Details
    consolidatedText += "ADDITIONAL DETAILS:\n";
    consolidatedText += `${formData.additionalDetails || "N/A"}\n\n`;
    
    return consolidatedText;
  };

  // Handlers for the new buttons
  const handleGenerateSearchReport = () => {
    const consolidatedText = consolidateFormData();
    localStorage.setItem("pdfText", consolidatedText);
    navigate("/innocheck?q=innocheck");
  };

  const handleGenerateProvisionalDraft = () => {
    const consolidatedText = consolidateFormData();
    localStorage.setItem("pdfText", consolidatedText);
    navigate("/innocheck?q=provisional");
  };

  const handleGenerateNonProvisionalDraft = () => {
    const consolidatedText = consolidateFormData();
    localStorage.setItem("pdfText", consolidatedText);
    navigate("/innocheck?q=draftmaster");
  };

  const handleDownload = async () => {
    // Prepare all images for inclusion in the document
    const imageRuns = [];
    
    if (images.length > 0) {
      for (const image of images) {
        try {
          const buffer = await readFileAsArrayBuffer(image);
          
          imageRuns.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: {
                    width: 400,
                    height: 300
                  }
                })
              ],
              spacing: { before: 200, after: 200 }
            })
          );
          
          // Add a caption for the image
          imageRuns.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Figure: ${image.name}`,
                  italics: true,
                  font: "Calibri",
                  color: "000000"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
          );
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }
    }
    
    // Create document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
            },
            paragraph: {
              spacing: { line: 276 }
            }
          }
        }
      },
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Invention Disclosure Form",
                bold: true,
                size: 60, // Size 30 (doubled because docx uses half-points)
                font: "Calibri",
                color: "000000"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Invention Title
          new Paragraph({
            children: [
              new TextRun({
                text: "1. Invention Title",
                bold: true,
                size: 20, // Size 10 (doubled because docx uses half-points)
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.inventionTitle || "[Please provide the title of Invention]",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Inventor Information
          new Paragraph({
            children: [
              new TextRun({
                text: "2. Inventor Information",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Please provide the following information for each inventor:",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: generateTableRows(
              formData.inventors, 
              ["Inventor #", "Name", "Position/Title", "Institution/Company", "Address", "Phone", "Email", "Citizenship"]
            ),
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 }
            }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Add additional rows as necessary)",
                italics: true,
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Applicant/Assignee Information
          new Paragraph({
            children: [
              new TextRun({
                text: "3. Applicant/Assignee Information (If Different from Inventors)",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Organization or individual that will own the patent rights)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          
          ...formData.applicants.flatMap((applicant, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Applicant ${index + 1}:`,
                  bold: true,
                  font: "Calibri",
                  color: "000000"
                })
              ],
              spacing: { before: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `a)\tName: ${applicant.name || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `b)\tPosition/Title: ${applicant.position || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `c)\tInstitution/Company: ${applicant.institution || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `d)\tAddress: ${applicant.address || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `e)\tPhone: ${applicant.phone || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `f)\tEmail: ${applicant.email || "_______________"}`,
                  font: "Calibri",
                  color: "000000"
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "",
                  font: "Calibri",
                  color: "000000"
                })
              ],
              spacing: { after: 200 }
            })
          ]),
          
          // Problem Statement
          new Paragraph({
            children: [
              new TextRun({
                text: "4. Problem Statement:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Provide an overview of the problem or challenge in the existing art/technology)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.problemStatement || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Solution Statement
          new Paragraph({
            children: [
              new TextRun({
                text: "5. Solution Statement:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(describe how the proposed solution effectively addresses the problem or challenge outlined above)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.solutionStatement || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Brief Description
          new Paragraph({
            children: [
              new TextRun({
                text: "6. Brief Description of the Invention:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Provide a brief overview of the invention, including its purpose and key benefits.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.briefDescription || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Detailed Technical Description
          new Paragraph({
            children: [
              new TextRun({
                text: "7. Detailed Technical Description:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Describe the technical details of the invention, how it works, and the problem it solves. Include diagrams if necessary.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.detailedDescription || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 200 }
          }),
          
          // Insert images here
          ...imageRuns,
          
          // Key Features
          new Paragraph({
            children: [
              new TextRun({
                text: "8. Key Features and Novel Aspects:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Identify the unique and novel aspects of the invention that distinguish it from existing technology.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.keyFeatures || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Potential Applications
          new Paragraph({
            children: [
              new TextRun({
                text: "9. Potential Applications and Uses:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Describe potential industries, applications, and uses for the invention.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.potentialApplications || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Known Related Patents
          new Paragraph({
            children: [
              new TextRun({
                text: "10. Known Related Patents or Publications:",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(List any known patents, publications, or technologies that are relevant to the invention.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.knownPatents || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Novelty
          new Paragraph({
            children: [
              new TextRun({
                text: "11. How is the Invention Novel?",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "(Explain how your invention is different from the prior art.)",
                font: "Calibri",
                color: "000000"
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.novelty || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Additional Details
          new Paragraph({
            children: [
              new TextRun({
                text: "12. Any other detail you wish to provide.",
                bold: true,
                size: 20, // Size 10
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.additionalDetails || "",
                font: "Calibri",
                color: "000000"
              })
            ],
            spacing: { after: 400 }
          })
        ]
      }]
    });

    // Generate and download the document
    Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "Invention_Disclosure_Form.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // Helper function to read file as ArrayBuffer (for image processing)
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="create-idf-form">
      <div className="card">
        <div className="card-body">
          <form>
            {/* Invention Title */}
            <div className="form-section">
              <h5 className="section-title">1. Invention Title</h5>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter the title of your invention"
                  name="inventionTitle"
                  value={formData.inventionTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Inventor Information */}
            <div className="form-section">
              <h5 className="section-title">2. Inventor Information</h5>
              {formData.inventors.map((inventor, index) => (
                <div key={`inventor-${index}`} className="inventor-section">
                  <h6>Inventor {index + 1}</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.name}
                          onChange={(e) => handleChange(e, "inventors", index, "name")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Position/Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.position}
                          onChange={(e) => handleChange(e, "inventors", index, "position")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Institution/Company</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.institution}
                          onChange={(e) => handleChange(e, "inventors", index, "institution")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.address}
                          onChange={(e) => handleChange(e, "inventors", index, "address")}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.phone}
                          onChange={(e) => handleChange(e, "inventors", index, "phone")}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={inventor.email}
                          onChange={(e) => handleChange(e, "inventors", index, "email")}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Citizenship</label>
                        <input
                          type="text"
                          className="form-control"
                          value={inventor.citizenship}
                          onChange={(e) => handleChange(e, "inventors", index, "citizenship")}
                        />
                      </div>
                    </div>
                  </div>
                  {formData.inventors.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => removeItem("inventors", index)}
                    >
                      Remove Inventor
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-3"
                onClick={() => addItem("inventors")}
              >
                Add Another Inventor
              </button>
            </div>

            {/* Applicant/Assignee Information */}
            <div className="form-section">
              <h5 className="section-title">3. Applicant/Assignee Information (If Different from Inventors)</h5>
              <p className="form-text text-muted">(Organization or individual that will own the patent rights)</p>
              
              {formData.applicants.map((applicant, index) => (
                <div key={`applicant-${index}`} className="applicant-section">
                  <h6>Applicant {index + 1}</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={applicant.name}
                          onChange={(e) => handleChange(e, "applicants", index, "name")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Position/Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={applicant.position}
                          onChange={(e) => handleChange(e, "applicants", index, "position")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Institution/Company</label>
                        <input
                          type="text"
                          className="form-control"
                          value={applicant.institution}
                          onChange={(e) => handleChange(e, "applicants", index, "institution")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={applicant.address}
                          onChange={(e) => handleChange(e, "applicants", index, "address")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={applicant.phone}
                          onChange={(e) => handleChange(e, "applicants", index, "phone")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={applicant.email}
                          onChange={(e) => handleChange(e, "applicants", index, "email")}
                        />
                      </div>
                    </div>
                  </div>
                  {formData.applicants.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => removeItem("applicants", index)}
                    >
                      Remove Applicant
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-3"
                onClick={() => addItem("applicants")}
              >
                Add Another Applicant
              </button>
            </div>

            {/* Problem Statement */}
            <div className="form-section">
              <h5 className="section-title">4. Problem Statement</h5>
              <p className="form-text text-muted">(Provide an overview of the problem or challenge in the existing art/technology)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Solution Statement */}
            <div className="form-section">
              <h5 className="section-title">5. Solution Statement</h5>
              <p className="form-text text-muted">(Describe how the proposed solution effectively addresses the problem or challenge outlined above)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="solutionStatement"
                  value={formData.solutionStatement}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Brief Description */}
            <div className="form-section">
              <h5 className="section-title">6. Brief Description of the Invention</h5>
              <p className="form-text text-muted">(Provide a brief overview of the invention, including its purpose and key benefits.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="briefDescription"
                  value={formData.briefDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Detailed Technical Description */}
            <div className="form-section">
              <h5 className="section-title">7. Detailed Technical Description</h5>
              <p className="form-text text-muted">(Describe the technical details of the invention, how it works, and the problem it solves.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="6"
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              {/* Image Upload Section */}
              <div className="image-upload-section mt-3">
                <label className="d-block mb-2">Upload Diagrams or Images</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control-file"
                  onChange={handleImageUpload}
                  multiple
                />
                
                {imagePreviewUrls.length > 0 && (
                  <div className="image-previews mt-3">
                    <h6>Uploaded Images:</h6>
                    <div className="row">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-3">
                          <div className="image-preview-container">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="img-thumbnail" 
                            />
                            <div className="image-preview-overlay">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeImage(index)}
                              >
                                Remove
                              </button>
                            </div>
                            <p className="image-name mt-1">{images[index].name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="form-section">
              <h5 className="section-title">8. Key Features and Novel Aspects</h5>
              <p className="form-text text-muted">(Identify the unique and novel aspects of the invention that distinguish it from existing technology.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Potential Applications */}
            <div className="form-section">
              <h5 className="section-title">9. Potential Applications and Uses</h5>
              <p className="form-text text-muted">(Describe potential industries, applications, and uses for the invention.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="potentialApplications"
                  value={formData.potentialApplications}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Known Related Patents */}
            <div className="form-section">
              <h5 className="section-title">10. Known Related Patents or Publications</h5>
              <p className="form-text text-muted">(List any known patents, publications, or technologies that are relevant to the invention.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="knownPatents"
                  value={formData.knownPatents}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Novelty */}
            <div className="form-section">
              <h5 className="section-title">11. How is the Invention Novel?</h5>
              <p className="form-text text-muted">(Explain how your invention is different from the prior art.)</p>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="novelty"
                  value={formData.novelty}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section">
              <h5 className="section-title">12. Any other detail you wish to provide</h5>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="4"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Download and Generate Buttons */}
<div className="form-actions-container">
  {/* Primary Action - Download */}
  <div className="primary-action-container">
    <button
      type="button"
      className="btn btn-lg download-btn"
      onClick={handleDownload}
    >
      Download IDF
    </button>
  </div>
  
  {/* Secondary Actions - Generate Options */}
  <div className="secondary-actions-container">
    <h6 className="secondary-actions-heading">
      Use the submitted IDF details to <span className="generate-emphasis">Generate...</span>
    </h6>
    <div className="generate-buttons-container">
      <button
        type="button"
        className="btn btn-lg generate-btn"
        onClick={handleGenerateSearchReport}
      >
        Search Report
      </button>
      <button
        type="button"
        className="btn btn-lg generate-btn"
        onClick={handleGenerateProvisionalDraft}
      >
        Provisional Draft
      </button>
      <button
        type="button"
        className="btn btn-lg generate-btn"
        onClick={handleGenerateNonProvisionalDraft}
      >
        Non-Provisional Draft
      </button>
    </div>
  </div>
</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIDFForm;
