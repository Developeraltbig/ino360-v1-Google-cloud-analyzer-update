import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const MermaidComponent2 = ({ chart, answerLength }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (answerLength > 100) {
      const timer = setTimeout(() => {
        if (mermaidRef.current && chart) {
          mermaid.initialize({ startOnLoad: true });
          try {
            mermaid.contentLoaded();
          } catch (error) {
            console.error("Error rendering Mermaid chart:", error);
          }
        }
      }, 1000); // Delay of 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [chart, answerLength]);

  return (
    <div ref={mermaidRef}>
      <div className="mermaid">{chart}</div>
    </div>
  );
};

export default MermaidComponent2;
