// frontend/src/components/Drawing/SafeDiagramDisplay.jsx
import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
});

const SafeDiagramDisplay = ({ chart, className = "" }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chart || chart.trim() === "") {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    const renderToString = async () => {
      try {
        // Generate a unique ID for this render
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Use the renderToString method to avoid DOM manipulation conflicts
        const { svg } = await mermaid.render(id, chart);

        if (isMounted) {
          setSvg(svg);
          setError(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error rendering diagram:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderToString();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (loading) {
    return (
      <div className={`safe-diagram-loading ${className}`}>
        Loading diagram...
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!svg) {
    return null;
  }

  return (
    <div
      className={`safe-diagram ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default SafeDiagramDisplay;
