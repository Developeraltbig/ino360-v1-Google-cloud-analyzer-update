import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./uploadPDF.css";

function UploadPDFToShow() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [pdfText, setPdfText] = useState("");

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Loading your answer... \n It might take up to 10 seconds");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAUrKHvLgqbCbmWzdQUBGUTcNQq35HuXRQ`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      setAnswer(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer(false);
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/upload", formData);
      alert(response.data.message);
      setPdfText(response.data.text);
    } catch (error) {
      console.error(error);
      alert("Error uploading PDF");
    }
  };

  const handleButtonClick = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("firstQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion(`${pdfContent}\n${questionContent}`);
  };

  return (
    <>
      <div>
        <h1 style={{ color: "Blue" }}>Upload Your Invention PDF</h1>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button className="btn btn-primary" onClick={handleUpload}>
          Upload PDF
        </button>
      </div>

      <div className="pdf-text-container" style={{ display: "none" }}>
        <h2 className="text-xl font-bold">PDF Text Content:</h2>
        <p id="pdfText">{pdfText}</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        {/* <h1
          className="text-4xl font-bold text-blue-500 mb-4 animate-bounce"
          style={{ color: "red" }}
        >
          Talk To PDF
        </h1> */}
        {/* <h2 className="text-2xl font-bold mb-4">Questions 1</h2> */}
        <p id="firstQuestion" style={{ fontSize: "20px", fontWeight: "600" }}>
          Purpose of the invention ?
        </p>
        <form
          onSubmit={generateAnswer}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3 text-center rounded-lg shadow-lg bg-white py-6 px-4 transition-all duration-500 transform hover:scale-105"
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button1"
            onClick={handleButtonClick}
            type="submit"
            className="btn btn-primary"
            disabled={generatingAnswer}
          >
            Generate AI answer
          </button>
        </form>
        <div
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3 text-center rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
          style={{ overflowY: "scroll" }}
        >
          <ReactMarkdown className="p-4">{answer}</ReactMarkdown>
        </div>
      </div>

      {/* <div className="questions-list">
        <div className="question1">
          <h2 className="text-2xl font-bold mb-4">Questions 1</h2>
          <p id="firstQuestion" style={{ fontSize: "20px", fontWeight: "600" }}>
            Title of the Invention ?
          </p>
          <p id="answer1"></p>
          <button id="button1" onClick={handleButtonClick}>
            Generate AI Answer
          </button>
        </div>
      </div> */}
    </>
  );
}

export default UploadPDFToShow;
