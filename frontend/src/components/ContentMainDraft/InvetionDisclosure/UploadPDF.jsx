import React, { useState, useEffect } from "react";
import axios from "axios";
// import ReactMarkdown from "react-markdown";
import "./uploadPDF.css";
import ReactQuill from "react-quill";

// ********************
import { OrbitProgress } from "react-loading-indicators";
// ********************

function UploadPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");
  const [question4, setQuestion4] = useState("");
  const [question5, setQuestion5] = useState("");
  const [question6, setQuestion6] = useState("");
  const [question7, setQuestion7] = useState("");
  const [question8, setQuestion8] = useState("");
  const [question9, setQuestion9] = useState("");
  const [answer, setAnswer] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [answer4, setAnswer4] = useState("");
  const [answer5, setAnswer5] = useState("");
  const [answer6, setAnswer6] = useState("");
  const [answer7, setAnswer7] = useState("");
  const [answer8, setAnswer8] = useState("");
  const [answer9, setAnswer9] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [generatingAnswer2, setGeneratingAnswer2] = useState(false);
  const [generatingAnswer3, setGeneratingAnswer3] = useState(false);
  const [generatingAnswer4, setGeneratingAnswer4] = useState(false);
  const [generatingAnswer5, setGeneratingAnswer5] = useState(false);
  const [generatingAnswer6, setGeneratingAnswer6] = useState(false);
  const [generatingAnswer7, setGeneratingAnswer7] = useState(false);
  const [generatingAnswer8, setGeneratingAnswer8] = useState(false);
  const [generatingAnswer9, setGeneratingAnswer9] = useState(false);
  const [pdfText, setPdfText] = useState("");

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  // Set All the answers to Local Storage
  useEffect(() => {
    localStorage.setItem("answerDraft", answer);
  }, [answer]);

  useEffect(() => {
    localStorage.setItem("answerDraft2", answer2);
  }, [answer2]);

  useEffect(() => {
    localStorage.setItem("answerDraft3", answer3);
  }, [answer3]);

  useEffect(() => {
    localStorage.setItem("answerDraft4", answer4);
  }, [answer4]);

  useEffect(() => {
    localStorage.setItem("answerDraft5", answer5);
  }, [answer5]);

  useEffect(() => {
    localStorage.setItem("answerDraft6", answer6);
  }, [answer6]);

  useEffect(() => {
    localStorage.setItem("answerDraft7", answer7);
  }, [answer7]);

  useEffect(() => {
    localStorage.setItem("answerDraft8", answer8);
  }, [answer8]);

  useEffect(() => {
    localStorage.setItem("answerDraft9", answer9);
  }, [answer9]);

  // Save pdfText to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("pdfText", pdfText);
  }, [pdfText]);

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
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
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

  async function generateAnswer2(e) {
    setGeneratingAnswer2(true);
    e.preventDefault();
    setAnswer2("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question2 }] }],
        },
      });

      setAnswer2(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer2("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer2(false);
  }

  async function generateAnswer3(e) {
    setGeneratingAnswer3(true);
    e.preventDefault();
    setAnswer3("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question3 }] }],
        },
      });

      setAnswer3(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer3("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer3(false);
  }

  async function generateAnswer4(e) {
    setGeneratingAnswer4(true);
    e.preventDefault();
    setAnswer4("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question4 }] }],
        },
      });

      setAnswer4(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer4("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer4(false);
  }

  async function generateAnswer5(e) {
    setGeneratingAnswer5(true);
    e.preventDefault();
    setAnswer5("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question5 }] }],
        },
      });

      setAnswer5(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer5("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer5(false);
  }

  async function generateAnswer6(e) {
    setGeneratingAnswer6(true);
    e.preventDefault();
    setAnswer6("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
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

  async function generateAnswer8(e) {
    setGeneratingAnswer8(true);
    e.preventDefault();
    setAnswer8("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
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

  async function generateAnswer9(e) {
    setGeneratingAnswer9(true);
    e.preventDefault();
    setAnswer9("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDNyQ0nrCUGkZs60tGTsi7PxpNldEjBdcM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question9 }] }],
        },
      });

      setAnswer9(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer9("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer9(false);
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

  const handleChanges2 = (html) => {
    setAnswer2(html);
  };

  const handleChanges3 = (html) => {
    setAnswer3(html);
  };

  const handleChanges4 = (html) => {
    setAnswer4(html);
  };

  const handleChanges5 = (html) => {
    setAnswer5(html);
  };

  const handleChanges6 = (html) => {
    setAnswer6(html);
  };

  const handleChanges7 = (html) => {
    setAnswer7(html);
  };

  const handleChanges8 = (html) => {
    setAnswer8(html);
  };

  const handleChanges9 = (html) => {
    setAnswer9(html);
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

  const handleButtonClick2 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("secondQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion2(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick3 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("thirdQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion3(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick4 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("fourthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion4(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick5 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("fifthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion5(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick6 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("sixthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion6(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick7 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent =
      document.getElementById("seventhQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion7(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick8 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("eighthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion8(`${pdfContent}\n${questionContent}`);
  };

  const handleButtonClick9 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("ninthQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion9(`${pdfContent}\n${questionContent}`);
  };

  function handleAllButtonClick(e) {
    e.preventDefault();

    handleButtonClick();
    generateAnswer(e);
    handleChanges1();

    handleButtonClick2();
    generateAnswer2(e);
    handleChanges2();

    handleButtonClick3();
    generateAnswer3(e);
    handleChanges3();

    handleButtonClick4();
    generateAnswer4(e);
    handleChanges4();

    handleButtonClick5();
    generateAnswer5(e);
    handleChanges5();

    handleButtonClick6();
    generateAnswer6(e);
    handleChanges6();

    handleButtonClick7();
    generateAnswer7(e);
    handleChanges7();

    handleButtonClick8();
    generateAnswer8(e);
    handleChanges8();

    handleButtonClick9();
    generateAnswer9(e);
    handleChanges9();
  }

  return (
    <>
      <div className="pdf-text-container" style={{ display: "none" }}>
        <h2 className="text-xl font-bold">PDF Text Content:</h2>
        <p id="pdfText" value={pdfText} onChange={handleChange}>
          {pdfText}
        </p>
      </div>

      <div>
        <button
          className="btn-stl-4 w-auto"
          onClick={handleAllButtonClick}
          style={{
            padding: "13px",
            height: "43px",
            fontSize: "13px",
            color: "#504f4f",
          }}
        >
          <b>Generate All answers</b>
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Title of the Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          What is the tentative title for your invention?
        </p> */}
        <p id="firstQuestion" style={{ display: "none" }}>
          Provide me the title of the invention of the above provided content.
          Provided content should only contain the Title of the invention in
          bold letters and nothing else.
          <br />
          Don't use html word in the answer.
          <br />
          Provide me one title of the invention from above provided content & no
          extra content other that the title is required. Start with a heading
          of "Title of Invention" in the first line & inside h1 tag.
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
          style={{ display: "block" }}
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
            Generate Answer
          </button>
        </form>
        <div
          id="firstAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer}</ReactMarkdown> */}
          <ReactQuill
            value={answer}
            onChange={handleChanges1}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for second question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Background of the Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          Please indicate the occasion for making this invention. Describe the
          general problem statement and which prior art, already known to you
          that forms the starting of your invention?
        </p> */}
        <p id="secondQuestion" style={{ display: "none" }}>
          From above provided content generate detailed content for 1.What is
          the problem or challenge that this invention addresses? And 2. How are
          current solutions inadequate or problematic? And 3. Provide details on
          existing technologies or methods in this area. Don't use html word.
          <br />
          Answer Must start with a heading of "Background of the Invention" in
          h1 tag. And keep the headings in bold letters.
          <br />
          Don't use html word.
          <br />
          What is the problem or challenge that this invention addresses? How
          are current solutions inadequate or problematic? Provide details on
          existing technologies or methods in this area.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And provided text must align to the left side.
          And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer2}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question2}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button2"
            onClick={handleButtonClick2}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer2}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="secondAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer2}</ReactMarkdown> */}
          <ReactQuill
            value={answer2}
            onChange={handleChanges2}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for third question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Summary Of Invention</h3>
        {/* <p style={{ fontSize: "18px", display: "none" }}>
          Summarize the key aspects of the invention. What is its purpose, and
          how does it solve the problem identified in the background? Highlight
          the novel features.
        </p> */}
        <p id="thirdQuestion" style={{ display: "none" }}>
          Provide me the Summary Of Invention of the above provided content.
          Provided content should contain a concise overview of the invention,
          including its purpose, function, and primary application. Describe
          what the invention is and what it aims to achieve. Don't use html
          word.
          <br />
          First line must start with the heading "Summary Of The Invention" in
          h1 tag.
          <br />
          Don't use html word.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And provided text must align to the left side.
          And the provided content must be left aligned.
        </p>

        <form
          onSubmit={generateAnswer3}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question3}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button3"
            onClick={handleButtonClick3}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer3}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="thirdAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          <ReactQuill
            value={answer3}
            onChange={handleChanges3}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for fourth question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Field of the Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          What is the novel aspect of your invention and how is it solving the
          drawbacks found in existing prior art?
        </p> */}
        <p id="fourthQuestion" style={{ display: "none" }}>
          Provide me the Field of the Invention of the above provided content.
          Provided content should only contain the Field of the Invention in
          bold letters and nothing else. Don't use html word.
          <br />
          Don't use html word.
          <br />
          In which technical field or industry does this invention apply?
          Describe the general category or technology the invention relates to."
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And provided text must align to the left side.
          And the provided content must be left aligned.
        </p>

        <form
          onSubmit={generateAnswer4}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question4}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button4"
            onClick={handleButtonClick4}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer4}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="fourthAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer4}</ReactMarkdown> */}
          <ReactQuill
            value={answer4}
            onChange={handleChanges4}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for fifth question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Brief Description of the Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          List and briefly describe each drawing or figure included in the patent application. What does each figure show and how does it relate to the invention?
        </p> */}
        <p id="fifthQuestion" style={{ display: "none" }}>
          Provide me the Brief Description of the Invention of the above
          provided content. Don't use html word.
          <br />
          Answer must start with a heading of "Brief Description of the
          Invention" in h1 tag.
          <br />
          Don't use Tables and images in the answer.
          <br />
          Don't use html word.
          <br />
          List and briefly describe each drawing or figure included in the
          patent application. What does each figure show and how does it relate
          to the invention? Explain each part in detail.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer5}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question5}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button5"
            onClick={handleButtonClick5}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer5}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="fifthAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
          <ReactQuill
            value={answer5}
            onChange={handleChanges5}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for sixth question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>
          Detailed Description of the Invention
        </h3>
        {/* <p style={{ fontSize: "18px" }}>
          Provide a comprehensive description of the invention. What are the components or steps involved? How does each part work? Use references to any relevant drawings to explain the invention in detail
        </p> */}
        <p id="sixthQuestion" style={{ display: "none" }}>
          Provide me the Detailed Description of the Invention of the above
          provided content. Don't use html word.
          <br />
          Answer must start with a heading of "Detailed Description of the
          Invention" in h1 tag.
          <br />
          Don't use Tables and images in the answer.
          <br />
          Don't use html word.
          <br />
          Provide a comprehensive description of the invention. How does it
          work? What are its components or steps? Refer to any drawings where
          necessary, explaining each part in detail.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer6}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question6}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button6"
            onClick={handleButtonClick6}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer6}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="sixthAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
          <ReactQuill
            value={answer6}
            onChange={handleChanges6}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for seventh question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Claims Of Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          What are the key elements or features of the invention for which legal protection is being sought? Define the scope of protection through clear and specific claims.
        </p> */}
        <p id="seventhQuestion" style={{ display: "none" }}>
          Provide me the Claims for the of the above provided Invention content.
          Don't use html word.
          <br />
          Answer must start with a heading of "Claims Of The Invention" in h1
          tag.
          <br />
          Don't use Tables and images in the answer.
          <br />
          Don't use html word.
          <br />
          What are the key elements or features of the invention for which legal
          protection is being sought? Define the scope of protection through
          clear and specific claims.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer7}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question7}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button7"
            onClick={handleButtonClick7}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer7}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="seventhAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
          <ReactQuill
            value={answer7}
            onChange={handleChanges7}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for eighth question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Abstract Of Invention</h3>
        {/* <p style={{ fontSize: "18px" }}>
          What are the key elements or features of the invention for which legal protection is being sought? Define the scope of protection through clear and specific claims.
        </p> */}
        <p id="eighthQuestion" style={{ display: "none" }}>
          Provide me the Abstract for the of the above provided Invention
          content. Don't use html word.
          <br />
          Answer must start with a heading of "Abstract Of Invention" in h1 tag.
          <br />
          Don't use Tables and images in the answer.
          <br />
          Don't use html word.
          <br />
          Write a brief summary of the invention, around 150 words. Focus on the
          technical aspects and the core innovation being described.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer8}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question8}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button8"
            onClick={handleButtonClick8}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer8}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="eighthAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
          <ReactQuill
            value={answer8}
            onChange={handleChanges8}
            modules={modules}
          />
        </div>
      </div>

      {/* Example structure for ninth question */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
        <h3 style={{ color: "#36718b" }}>Drawings</h3>
        {/* <p style={{ fontSize: "18px" }}>
          Provide detailed drawings or diagrams that illustrate the invention. Include labels and explanations where necessary to clarify specific features or components.
        </p> */}
        <p id="ninthQuestion" style={{ display: "none" }}>
          Provide me the Drawings for the of the above provided Invention
          content. Don't use html word.
          <br />
          Answer must start with a heading of "Drawings" in h1 tag.
          <br />
          Don't use Tables and images in the answer.
          <br />
          Don't use html word.
          <br />
          Provide detailed drawings or diagrams that illustrate the invention.
          Include labels and explanations where necessary to clarify specific
          features or components.
          <br />
          And provided content should only give complete answer using proper
          html tags & not even single word is written without tag. And also give
          the content with proper heading and ordered list with proper alignment
          so that it looks good. And the provided content must be left aligned.
        </p>
        <form
          onSubmit={generateAnswer9}
          className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          style={{ display: "block" }}
        >
          <textarea
            id="passQuery"
            required
            className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
            value={question9}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
            style={{ display: "none" }}
          ></textarea>
          <button
            id="button9"
            onClick={handleButtonClick9}
            type="submit"
            className="btn btn-primary w-auto"
            disabled={generatingAnswer9}
          >
            Generate Answer
          </button>
        </form>
        <div
          id="ninthAnswer"
          style={{ borderRadius: "15px" }}
          className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
        >
          {/* <ReactMarkdown className="p-4">{answer5}</ReactMarkdown> */}
          <ReactQuill
            value={answer9}
            onChange={handleChanges9}
            modules={modules}
          />
        </div>
      </div>
    </>
  );
}

export default UploadPDF;
