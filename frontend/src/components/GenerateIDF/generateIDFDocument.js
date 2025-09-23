// frontend/src/components/GenerateIDF/generateIDFDocument.js
import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType
} from "docx";

// Function to generate table rows for inventors (simplified version)
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
  
  // Data rows - in this case we'll just show placeholders
  const placeholderRow = new TableRow({
    children: headers.map((header, index) => 
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: index === 0 ? "Inventor 1" : "_______________",
            font: "Calibri",
            color: "000000"
          })]
        })],
        width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
      })
    )
  });
  
  rows.push(placeholderRow);
  
  return rows;
};

export const generateIDFDocument = (data) => {
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
              text: data.inventionTitle || "[Please provide the title of Invention]",
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
            [], // No data for inventors
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
          ],
          spacing: { after: 400 }
        }),
        
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
              text: data.problemStatement || "",
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
              text: data.solutionStatement || "",
              font: "Calibri",
              color: "000000"
            })
          ],
          spacing: { after: 400 }
        }),
        
        // Brief Description - using part of novelty statement if available
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
              text: "", // Left empty
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
              text: "", // Left empty
              font: "Calibri",
              color: "000000"
            })
          ],
          spacing: { after: 400 }
        }),
        
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
              text: data.noveltyStatement || "",
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
              text: data.potentialApplications || "",
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
              text: "", // Left empty
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
              text: data.noveltyStatement || "", // Using novelty statement again
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
              text: "", // Left empty
              font: "Calibri",
              color: "000000"
            })
          ],
          spacing: { after: 400 }
        })
      ]
    }]
  });
  
  return doc;
};
