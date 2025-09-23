import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../components/ContentMain/InvetionDisclosure/uploadPDF.css";
import ReactQuill from "react-quill";

// ********************
import { OrbitProgress } from "react-loading-indicators";
// ********************

function UploadPdfIno() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [pdfText, setPdfText] = useState("");

  // Save pdfText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pdfText", pdfText);
  }, [pdfText]);

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  // Example function to update pdfText
  const handleChange = (event) => {
    setPdfText(event.target.value);
  };

  // *************************

  // Save ClaimsText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("answer", answer);
  }, [answer]);

  // *************************

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Generating Answer... Wait for a while...");
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChanges1 = (html) => {
    setAnswer(html);
    console.log(`This is answer One ${answer}`);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); // Start loading
    try {
      const response = await axios.post("/upload", formData);
      alert(response.data.message);

      setPdfText(response.data.text);
    } catch (error) {
      console.error(error);
      alert("Error uploading PDF");
    } finally {
      setLoading(false); // Stop loading
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
      <div id="UploadPDF">
        {/* <h1 className="head-stl" style={{ color: "#36718b" }}>
          Invention Disclosure Form
        </h1> */}

        <input type="file" accept=".pdf, .docx" onChange={handleFileChange} />

        <button className="btn btn-primary" onClick={handleUpload}>
          Upload
        </button>

        {loading && (
          <OrbitProgress
            variant="spokes"
            color="#32cd32"
            size="small"
            text="Uploading "
            textColor="#bfa7a7"
          />
        )}
      </div>

      <div className="pdf-text-container" style={{ display: "none" }}>
        <h2 className="text-xl font-bold">PDF Text Content:</h2>
        <p id="pdfText" value={pdfText} onChange={handleChange}>
          {pdfText}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        {/* <h3 style={{ color: "#36718b" }}>Title of the Invention</h3> */}
        <p id="firstQuestion" style={{ display: "none" }}>
          Provide me the title of the invention of the above provided content.
          Provided content should only contain the Title of the invention in
          bold letters and nothing else.
          <br />
          Provide me four options of title of the invention from above provided
          content & no extra content other that the titles is required. Start
          with a heading of "Title of Invention" in the first line & inside h1
          tag.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And provided text must align to the left side.
          And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
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
            className="btn btn-primary w-auto"
            disabled={generatingAnswer}
          >
            Generate AI answer
          </button>
        </form>
        <div
          id="firstAnswer"
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
          style={{ overflowY: "scroll" }}
        >
          {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
          <ReactQuill
            value={answer}
            onChange={handleChanges1}
            modules={modules}
          />
        </div>
      </div>
    </>
  );
}

export default UploadPdfIno;
