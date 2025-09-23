import React from "react";
import MermaidComponent from "./MermaidComponent.jsx";

export default function FlowChart() {
  const matches = [
    "graph TD; A[Start] --> B(Design drug molecule using SWISS ADME); B --> C{Does it follow Lipinskis rule of five?}; C -- Yes --> D[Proceed to docking studies]; C -- No --> B; D --> E(Evaluate binding affinity and interactions); E --> F[End];",
    "graph TD; A[Start: Design Drug Molecule using SWISS ADME]; A --> B{Check Lipinski's Rule of Five}; B -- Yes --> C[Perform Docking with CB-DOCK2]; C --> D(Analyze Docking Score and Amino Acid Interactions); D --> E{Confirm High Affinity Binding to ER}; E --> F[Drug Candidate Identified]",
  ];
  const chart1 = matches[0];
  const chart2 = matches[1];

  return (
    <>
      <h1>Flowchart1</h1>
      <MermaidComponent chart={chart1} />
      <h1>Flowchart2</h1>
      <MermaidComponent chart={chart2} />
    </>
  );
}
