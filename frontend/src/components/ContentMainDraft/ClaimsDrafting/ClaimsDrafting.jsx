import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
// ***************************
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// ***************************

const ClaimsDrafting = () => {
  const [pdfText, setPdfText] = useState("");
  const [question7, setQuestion7] = useState("");
  const [answer7, setAnswer7] = useState("");
  const [generatingAnswer7, setGeneratingAnswer7] = useState(false);

  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  //   ***************************ClaimsText****************

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedClaimsText = localStorage.getItem("answer7");
    if (storedClaimsText) {
      setAnswer7(storedClaimsText);
    }
  }, []);

  // Save ClaimsText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("answer7", answer7);
  }, [answer7]);

  // Example function to update ClaimsText
  const handleChange3 = (event) => {
    setAnswer7(event.target.value);
  };

  // *********************************************************************

  async function generateAnswer7(e) {
    setGeneratingAnswer7(true);
    e.preventDefault();
    setAnswer7("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question7 }] }],
        },
      });

      setAnswer7(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer7("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer7(false);
  }

  const handleButtonClick7 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("seventhQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion7(`${pdfContent}\n${questionContent}`);
  };

  const handleChange = (html) => {
    setAnswer7(html);
  };

  const handleDownload = () => {
    const blob = new Blob([answer7], { type: "text/html" });
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
  //               <body>${answer7}</body>
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
    <div id="Claims">
      <h1 className="head-stl" style={{ color: "#36718b" }}>
        Claims/Abstract Drafting
      </h1>
      <p style={{ display: "none" }}>{pdfText}</p>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Claims/Abstract</h3>
        <p id="seventhQuestion" style={{ display: "none" }}>
          From above provided content generate 1.claims And 2.Abstract for
          drafting the patent for above invention. And provided content should
          only give complete answer using proper html tags & not even single
          word is written without tag. And Abstract should be between 120 to 145
          words not more than that.
          <br />
          Don't use html word in the answer.
          <br />
          Don't use images & tables.
          <br />
          Provided content should be using proper tags. And proper inline css
          must be used to make the UI good looking. Proper margin padding must
          be used.
          <br />
          Provided content should be very must accurate.
        </p>
        <form
          onSubmit={generateAnswer7}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question7}
            onChange={(e) => setQuestion7(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button1"
            onClick={handleButtonClick7}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer7}
          >
            Generate Claims/Abstract
          </button>
        </form>
        <div
          id="seventhAnswer"
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
          style={{ overflowY: "scroll" }}
        >
          {/* <ReactMarkdown
            className="p-4"
            value={answer7}
            onChange={handleChange3}
          >
            {answer7}
          </ReactMarkdown> */}

          {/* ****************** */}
          <ReactQuill
            value={answer7}
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

export default ClaimsDrafting;
