import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const MermaidComponent = ({ chart }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div ref={mermaidRef}>
      <div className="mermaid">{chart}</div>
    </div>
  );
};

export default MermaidComponent;
