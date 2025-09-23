import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const ProvisionalDrafting = () => {
  const [pdfText, setPdfText] = useState("");
  const [question6, setQuestion6] = useState("");
  const [answer6, setAnswer6] = useState("");
  const [generatingAnswer6, setGeneratingAnswer6] = useState(false);

  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  async function generateAnswer6(e) {
    setGeneratingAnswer6(true);
    e.preventDefault();
    setAnswer6("Generating Answer... It may take upto 10 secs...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAUrKHvLgqbCbmWzdQUBGUTcNQq35HuXRQ`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question6 }] }],
        },
      });

      setAnswer6(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer6("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer6(false);
  }

  const handleButtonClick6 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("sixthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion6(`${pdfContent}\n${questionContent}`);
  };

  return (
    <div>
      <h1 className="head-stl" style={{ color: "#36718b" }}>
        Provisional Drafting
      </h1>
      <p style={{ display: "none" }}>{pdfText}</p>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Provisional Patent Drafting</h3>
        <p id="sixthQuestion" style={{ display: "none" }}>
          From above provided content answer these questions i.e <br />
          1. Title of the Invention <br />
          2. Field of the Invention <br />
          3. Background of the Invention <br />
          4. Objects of the Invention <br />
          5. Summary of the Invention <br />
          6. Examples .
          <br /> Provided Content should only contain the answers of the other
          questions and not extra content is required apart from above mentioned
          questions.
          <br />
          And also give the content with proper heading and ordered list with
          proper alignment so that it looks good.
          <br />
          Start the content with first question, no extra content is needed
          <br />
          Don't use numbering in question
          <br />
          Generated answer must have a good & attractive UI
          <br />
          Provided content must be of around 1500 words
          <br />
          All headings must not be very bold.
          <br />
          Provided answer must starts with 1. Title of the Invention
        </p>
        <form
          onSubmit={generateAnswer6}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question6}
            onChange={(e) => setQuestion6(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button1"
            onClick={handleButtonClick6}
            type="submit"
            className="btn btn-primary"
            disabled={generatingAnswer6}
          >
            Generate Provisional Draft
          </button>
        </form>
        <div
          id="sixthAnswer"
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
          style={{ overflowY: "scroll" }}
        >
          <ReactMarkdown className="p-4">{answer6}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ProvisionalDrafting;
