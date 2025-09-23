import React, { useState } from "react";
import axios from "axios";

const UsptoAPI = () => {
  const [searchTerm, setSearchTerm] = useState("car");
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState(""); // New state to store raw JSON response

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://developer.uspto.gov/ibd-api/v1/application/publications?abstractText=%22Bus%22",
        {
          params: {
            searchText: searchTerm,
            start: 0,
            rows: 10,
          },
        }
      );

      console.log(response.data); // Log the full response
      setPatents(response.data.response.docs);
      setRawJson(JSON.stringify(response.data, null, 2)); // Set the raw JSON response
    } catch (err) {
      console.error(err); // Log the error
      setError("An error occurred while fetching the data.");
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <h1>USPTO Patent Search</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter search term"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {patents.map((patent) => (
          <li key={patent.patentNumber}>
            <h3>{patent.title}</h3>
            <p>Patent Number: {patent.patentNumber}</p>
            <p>Abstract: {patent.abstract}</p>
          </li>
        ))}
      </ul>

      {/* Display the full API JSON response in a paragraph tag */}
      {rawJson && (
        <div>
          <h2>Raw API Response</h2>
          <pre>
            <code>{rawJson}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default UsptoAPI;
