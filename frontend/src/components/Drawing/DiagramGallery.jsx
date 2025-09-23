import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./DiagramGallery.css";
import pako from "pako";
import { extractPlantUmlContent } from "../../utils/plantUmlRenderer";

// Updated encodePlantUml function
const encodePlantUml = (plantUmlCode) => {
  if (!plantUmlCode || plantUmlCode.trim() === "") return null;

  try {
    // Clean and format the PlantUML code
    let formattedCode = plantUmlCode
      .replace(/<[^>]+>/g, "\n")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .trim();

    // Make sure the @startuml and @enduml tags are on their own lines
    formattedCode = formattedCode
      .replace(/@startuml\s+/, "@startuml\n")
      .replace(/\s+@enduml/, "\n@enduml");

    console.log("Encoding PlantUML code:", formattedCode);

    // Use TextEncoder for UTF-8 encoding
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(formattedCode);

    // Use pako for Deflate compression
    const deflated = pako.deflateRaw(bytes, { level: 9 });

    // Convert to base64
    const base64 = btoa(String.fromCharCode.apply(null, deflated));

    // Convert from standard base64 to PlantUML encoding
    const standard =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const plantuml =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

    let plantUmlEncoded = "";
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charAt(i);
      if (char === "=") continue; // Skip padding

      const index = standard.indexOf(char);
      plantUmlEncoded += index >= 0 ? plantuml.charAt(index) : char;
    }

    return plantUmlEncoded;
  } catch (error) {
    console.error("Error encoding PlantUML:", error);
    return null;
  }
};

// Function to generate PlantUML diagram URL
const getPlantUmlImageUrl = (plantUmlCode, format = "svg") => {
  try {
    const encoded = encodePlantUml(plantUmlCode);
    if (!encoded) return null;

    // Use the official PlantUML server
    return `https://www.plantuml.com/plantuml/${format}/${encoded}`;
  } catch (error) {
    console.error("Failed to get PlantUML image URL:", error);
    return null;
  }
};

const cleanPlantUmlCode = (content) => {
  return extractPlantUmlContent(content);
};

// Enhanced validation with better error detection
const validatePlantUmlDiagram = (content) => {
  console.log(
    "Validating diagram with content:",
    content ? content.substring(0, 50) + "..." : "empty"
  );

  if (!content || content.trim() === "") {
    console.debug("PlantUML validation failed: Empty content");
    return false;
  }

  // Check for basic structure
  const hasStartTag = content.includes("@startuml");
  const hasEndTag = content.includes("@enduml");

  if (!hasStartTag || !hasEndTag) {
    console.debug("PlantUML validation failed: Missing start/end tags");
    return false;
  }

  // Check for problematic syntax that would cause render issues
  const problematicPatterns = [
    /\}\s*\[/, // Stray braces before components
    /\[([^\]]*\([^)]*\)[^\]]*)\]/, // Components with parentheses in names (often malformed)
    /\[\s*\]/, // Empty component names
    /\[\s*\n\s*\]/, // Components split across lines
  ];

  for (const pattern of problematicPatterns) {
    if (pattern.test(content)) {
      console.debug(
        "PlantUML validation failed: Problematic syntax detected:",
        pattern
      );
      return false;
    }
  }

  // Additional validation for component diagrams
  const isComponentDiagram = /\[.*?\]/.test(content);
  if (isComponentDiagram) {
    return validateComponentDiagramStructure(content);
  }

  return true;
};

// Specific component diagram structure validation
const validateComponentDiagramStructure = (content) => {
  // Extract components
  const componentMatches = content.match(/\[([^\]]+)\]/g);
  if (!componentMatches || componentMatches.length === 0) {
    console.debug(
      "Component diagram validation failed: No valid components found"
    );
    return false;
  }

  // Check for reasonable component names (not just numbers or whitespace)
  const validComponents = componentMatches.filter((comp) => {
    const name = comp.replace(/[\[\]]/g, "").trim();
    return name.length > 0 && !/^\s*\d+\s*$/.test(name);
  });

  if (validComponents.length === 0) {
    console.debug(
      "Component diagram validation failed: No components with valid names"
    );
    return false;
  }

  // Check for excessive duplicate components (sign of bad cleaning)
  const componentNames = componentMatches.map((comp) =>
    comp.replace(/[\[\]]/g, "").trim()
  );
  const uniqueNames = new Set(componentNames);

  if (componentNames.length > uniqueNames.size * 2) {
    console.debug(
      "Component diagram validation warning: Too many duplicate components detected"
    );
    // Still allow it, but log the warning
  }

  return true;
};

// Activity diagram specific validation
const validateActivityDiagram = (content) => {
  const hasStart = /start/i.test(content);
  const hasStop = /stop/i.test(content);
  const hasSteps = /:Step\s+\d+/i.test(content);

  if (!hasSteps) {
    console.debug("Activity diagram validation failed: No steps found");
    return false;
  }

  return hasStart || hasStop; // Should have at least start or stop
};

// Simple diagram thumbnail that shows PlantUML content
const DiagramThumbnail = ({ diagram, onClick, index, displayIndex }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Clean and fix the PlantUML code
      const cleanContent = cleanPlantUmlCode(diagram.content);

      console.log(`DiagramThumbnail ${displayIndex} - Processing content`);

      // Generate the image URL
      const url = getPlantUmlImageUrl(cleanContent);
      if (url) {
        console.log(
          `DiagramThumbnail ${displayIndex} - Image URL generated:`,
          url
        );
        setImageUrl(url);
      } else {
        console.error(
          `DiagramThumbnail ${displayIndex} - Failed to generate image URL`
        );
        setError("Failed to generate diagram");
      }
    } catch (err) {
      console.error(`DiagramThumbnail ${displayIndex} - Error:`, err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [diagram.content, displayIndex]);

  if (loading) {
    return (
      <div className="diagram-thumbnail">
        <div className="diagram-title">
          {diagram.title || `Drawing ${displayIndex + 1}`}
        </div>
        <div className="diagram-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diagram-thumbnail">
        <div className="diagram-title">
          {diagram.title || `Drawing ${displayIndex + 1}`}
        </div>
        <div className="diagram-error">{error}</div>
      </div>
    );
  }

  if (!imageUrl) {
    console.warn(`DiagramThumbnail ${displayIndex} - No image URL available`);
    return (
      <div className="diagram-thumbnail">
        <div className="diagram-title">
          {diagram.title || `Drawing ${displayIndex + 1}`}
        </div>
        <div className="diagram-error">Unable to render diagram</div>
      </div>
    );
  }

  return (
    <div className="diagram-thumbnail" onClick={() => onClick(index)}>
      <div className="diagram-title">
        {diagram.title || `Drawing ${displayIndex + 1}`}
      </div>
      <div
        className="plantuml-container"
        style={{
          height: "calc(100% - 36px)",
          marginTop: "36px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={imageUrl}
          alt={diagram.title || `Drawing ${displayIndex + 1}`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          onError={(e) => {
            console.error(`Image failed to load for diagram ${displayIndex}`);
            setError("Failed to load diagram image");
          }}
        />
      </div>
    </div>
  );
};

// Modal with PlantUML image
const DiagramModal = ({ diagram, onClose, onPrev, onNext, displayIndex }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawCode, setRawCode] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Clean and fix the PlantUML code
      const cleanContent = cleanPlantUmlCode(diagram.content);
      setRawCode(cleanContent);

      console.log(
        `DiagramModal ${displayIndex} - Processing content for modal view`
      );

      // Generate a larger image for the modal view
      const url = getPlantUmlImageUrl(cleanContent, "svg");
      if (url) {
        console.log(
          `DiagramModal ${displayIndex} - Image URL generated successfully for modal:`,
          url
        );
        setImageUrl(url);
      } else {
        console.error(
          `DiagramModal ${displayIndex} - Failed to generate image URL for modal`
        );
        setError("Failed to generate diagram");
      }
    } catch (err) {
      console.error(`DiagramModal ${displayIndex} - Error:`, err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [diagram.content, displayIndex]);

  if (loading) {
    return (
      <div className="diagram-modal-overlay" onClick={onClose}>
        <div
          className="diagram-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="diagram-modal-close" onClick={onClose}>
            ×
          </button>
          <h3 className="diagram-modal-title">
            {diagram.title || `Drawing ${displayIndex + 1}`}
          </h3>
          <div className="diagram-loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diagram-modal-overlay" onClick={onClose}>
        <div
          className="diagram-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="diagram-modal-close" onClick={onClose}>
            ×
          </button>
          <h3 className="diagram-modal-title">
            {diagram.title || `Drawing ${displayIndex + 1}`}
          </h3>
          <div className="diagram-error">{error}</div>
          <div>
            <h4>Raw PlantUML Code:</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                color: "#666",
                marginTop: "20px",
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "5px",
                overflow: "auto",
              }}
            >
              {rawCode}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="diagram-modal-overlay" onClick={onClose}>
        <div
          className="diagram-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="diagram-modal-close" onClick={onClose}>
            ×
          </button>
          <h3 className="diagram-modal-title">
            {diagram.title || `Drawing ${displayIndex + 1}`}
          </h3>
          <div className="diagram-error">Unable to render diagram</div>
          <div>
            <h4>Raw PlantUML Code:</h4>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                color: "#666",
                marginTop: "20px",
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "5px",
                overflow: "auto",
              }}
            >
              {rawCode}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-modal-overlay" onClick={onClose}>
      <div
        className="diagram-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="diagram-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="diagram-modal-title">
          {diagram.title || `Drawing ${displayIndex + 1}`}
        </h3>

        <button
          className="diagram-modal-nav diagram-modal-prev"
          onClick={onPrev}
          type="button"
          aria-label="Previous diagram"
        >
          <FaChevronLeft />
        </button>

        <button
          className="diagram-modal-nav diagram-modal-next"
          onClick={onNext}
          type="button"
          aria-label="Next diagram"
        >
          <FaChevronRight />
        </button>

        <div className="plantuml-modal-container">
          <img
            src={imageUrl}
            alt={diagram.title || `Drawing ${displayIndex + 1}`}
            style={{ maxWidth: "100%", maxHeight: "70vh" }} // Ensure image fits in viewport
            onError={() => setError("Failed to load diagram image")}
          />
        </div>

        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
            display: "none",
          }}
        >
          <details>
            <summary
              style={{ cursor: "pointer", color: "#666", fontSize: "14px" }}
            >
              Debug: View PlantUML code
            </summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                color: "#666",
                marginTop: "10px",
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "5px",
                overflow: "auto",
              }}
            >
              {rawCode}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

// The main gallery component
const DiagramGallery = ({ diagrams, title }) => {
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [validDiagrams, setValidDiagrams] = useState([]);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAndFilterDiagrams = () => {
      setIsValidating(true);
      console.log(
        "DiagramGallery - Validating diagrams:",
        diagrams?.length || 0
      );

      if (!diagrams || diagrams.length === 0) {
        console.log("DiagramGallery - No diagrams provided");
        setValidDiagrams([]);
        setIsValidating(false);
        return;
      }

      // Filter out empty diagrams
      const nonEmptyDiagrams = diagrams.filter(
        (d) => d && d.content && d.content.trim() !== ""
      );
      console.log(
        "DiagramGallery - Non-empty diagrams:",
        nonEmptyDiagrams.length
      );

      // Log each diagram's content for debugging
      nonEmptyDiagrams.forEach((d, i) => {
        console.log(
          `Diagram ${i} (${d.title}) content:`,
          d.content.length > 50 ? d.content.substring(0, 50) + "..." : d.content
        );
      });

      // Process each diagram
      const processedDiagrams = nonEmptyDiagrams.map((d) => ({
        ...d,
        content: cleanPlantUmlCode(d.content), // Clean each diagram's content
      }));

      // Validate diagrams
      const filtered = [];
      processedDiagrams.forEach((d) => {
        const isValid = validatePlantUmlDiagram(d.content);
        console.log(
          `DiagramGallery - Diagram "${d.title}" validation:`,
          isValid
        );
        if (isValid) {
          filtered.push(d);
        } else {
          console.log(
            `DiagramGallery - Diagram "${d.title}" failed validation`
          );
        }
      });

      console.log("DiagramGallery - Valid diagrams:", filtered.length);
      setValidDiagrams(filtered);
      setIsValidating(false);
    };

    validateAndFilterDiagrams();
  }, [diagrams]);

  const handlePrevDiagram = () => {
    setSelectedDiagram((prev) =>
      prev === 0 ? validDiagrams.length - 1 : prev - 1
    );
  };

  const handleNextDiagram = () => {
    setSelectedDiagram((prev) =>
      prev === validDiagrams.length - 1 ? 0 : prev + 1
    );
  };

  if (isValidating) {
    return (
      <div className="diagram-gallery">
        <h3 className="diagram-gallery-title">{title || "Drawings"}</h3>
        <div className="p-4 text-center">
          <p>Validating diagrams...</p>
        </div>
      </div>
    );
  }

  // Even if no valid diagrams are found, render with a message
  if (!validDiagrams || validDiagrams.length === 0) {
    return (
      <div className="diagram-gallery">
        <h3 className="diagram-gallery-title">{title || "Drawings"}</h3>
        <div className="p-4 text-center bg-yellow-100 rounded">
          <p>No valid diagrams found to display.</p>
          <p className="text-sm mt-2">
            Total diagrams provided: {diagrams?.length || 0}
          </p>
        </div>
      </div>
    );
  }

  // Render the gallery with valid diagrams
  return (
    <div className="diagram-gallery">
      <h3 className="diagram-gallery-title">{title || "Drawings"}</h3>
      <div className="diagram-gallery-container">
        {validDiagrams.map((diagram, index) => (
          <DiagramThumbnail
            key={`diagram-${index}`}
            diagram={diagram}
            index={index}
            displayIndex={index}
            onClick={() => setSelectedDiagram(index)}
          />
        ))}
      </div>

      {selectedDiagram !== null && validDiagrams[selectedDiagram] && (
        <DiagramModal
          diagram={validDiagrams[selectedDiagram]}
          onClose={() => setSelectedDiagram(null)}
          onPrev={handlePrevDiagram}
          onNext={handleNextDiagram}
          displayIndex={selectedDiagram}
        />
      )}
    </div>
  );
};

export default DiagramGallery;
