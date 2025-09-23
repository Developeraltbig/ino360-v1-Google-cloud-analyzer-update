import React from "react";
import "./tableComponent.css";
import "./inventionAnalyzer.css"; // Import the new CSS file

export default function TableComponent({ tableData }) {
  if (!tableData || !tableData.headers || !tableData.rows) {
    return <p>No valid table data provided</p>;
  }

  const { headers, rows } = tableData;

  return (
    <table className="analyzer-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
