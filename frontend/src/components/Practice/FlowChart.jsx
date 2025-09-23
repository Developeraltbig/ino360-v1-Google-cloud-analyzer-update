import React from "react";
import MermaidComponent from "./MermaidComponent.jsx";

export default function FlowChart() {
  const chart = `
        graph TD; 
        A[Start: Identify Patient with Ion Transport Disorder] --> B(Administer Compound of Formula I); 
        B --> C{Assess Ion Channel Function}; 
        C -- Improved Function --> D(Monitor for Side Effects); 
        C -- No Improvement --> E(Adjust Dosage or Combination Therapy); 
        D --> F[End: Continued Treatment and Monitoring]; E --> F; `;

  return (
    <>
      <h1>Flowchart</h1>
      <MermaidComponent chart={chart} />
    </>
  );
}
