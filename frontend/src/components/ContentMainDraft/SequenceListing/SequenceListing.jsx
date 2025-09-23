import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
// ***************************
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// ***************************

const SequenceListing = () => {
  const [pdfText, setPdfText] = useState("");
  const [question8, setQuestion8] = useState("");
  const [answer8, setAnswer8] = useState("");
  const [generatingAnswer8, setGeneratingAnswer8] = useState(false);

  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  //   ***************************ClaimsText****************

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedClaimsText = localStorage.getItem("answer8");
    if (storedClaimsText) {
      setAnswer8(storedClaimsText);
    }
  }, []);

  // Save ClaimsText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("answer8", answer8);
  }, [answer8]);

  // Example function to update ClaimsText
  const handleChange3 = (event) => {
    setAnswer8(event.target.value);
  };

  // *********************************************************************

  async function generateAnswer8(e) {
    setGeneratingAnswer8(true);
    e.preventDefault();
    setAnswer8("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question8 }] }],
        },
      });

      setAnswer8(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer8("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer8(false);
  }

  const handleButtonClick8 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("eighthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion8(`${pdfContent}\n${questionContent}`);
  };

  const handleChange = (html) => {
    setAnswer8(html);
  };

  const handleDownload = () => {
    const blob = new Blob([answer8], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "editor-content.html";
    link.click();
  };

  // const handlePrint2 = () => {
  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.write(`
  //           <html>
  //               <head>
  //                   <title>Print</title>
  //                   <style>
  //                       body { font-family: Arial, sans-serif; }
  //                   </style>
  //               </head>
  //               <body>${answer8}</body>
  //           </html>
  //       `);
  //   printWindow.document.close();
  //   setTimeout(() => {
  //     printWindow.print();
  //   }, 2000);
  // };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"], // Additional text formatting
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ align: [] }], // Text alignment
      ["link", "image", "video"], // Links, Images, and Videos
      [{ color: [] }, { background: [] }], // Text and background color
      ["clean"], // Remove formatting
    ],
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const range = this.quill.getSelection();
      this.quill.insertEmbed(range.index, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1 className="head-stl" style={{ color: "#36718b" }}>
        Sequence Listing
      </h1>
      <p style={{ display: "none" }}>{pdfText}</p>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Sequence Listing</h3>
        <p id="eighthQuestion" style={{ display: "none" }}>
          Just Write "Sequence Listing" in h1 tag and don't write anything else.
          <br />
          Don't use html word in the answer.
        </p>
        <form
          onSubmit={generateAnswer8}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question8}
            onChange={(e) => setQuestion8(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button1"
            onClick={handleButtonClick8}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer8}
          >
            Generate Sequence
          </button>
        </form>
        <div
          id="eighthAnswer"
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
          style={{ overflowY: "scroll" }}
        >
          {/* <ReactMarkdown
            className="p-4"
            value={answer8}
            onChange={handleChange3}
          >
            {answer8}
          </ReactMarkdown> */}

          {/* ****************** */}
          <ReactQuill
            value={answer8}
            onChange={handleChange}
            modules={modules}
          />
          {/* <button onClick={handleDownload}>Download</button> */}
          {/* <button
            className="btn btn-primary"
            onClick={handlePrint2}
            style={{
              margin: "10px",
              padding: "5px",
              width: "200px",
            }}
          >
            Print
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default SequenceListing;
