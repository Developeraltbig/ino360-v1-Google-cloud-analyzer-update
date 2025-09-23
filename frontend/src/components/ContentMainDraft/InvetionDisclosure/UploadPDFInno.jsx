import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import ReactMarkdown from "react-markdown";
import "./uploadPDF.css";
import ReactQuill from "react-quill";

// ********************
import { OrbitProgress } from "react-loading-indicators";
// ********************

function UploadPDFInno() {
  const [file, setFile] = useState(null);
  const buttonRef = useRef(null);
  //   const [loading, setLoading] = useState(false);
  //   const [query, setQuery] = useState("");
  //   const [response, setResponse] = useState("");
  const [questionInno, setQuestionInno] = useState("");
  const [questionInno2, setQuestionInno2] = useState("");
  const [questionInno4, setQuestionInno4] = useState("");
  const [questionInno5, setQuestionInno5] = useState("");
  const [questionInno6, setQuestionInno6] = useState("");
  const [questionInno7, setQuestionInno7] = useState("");
  const [questionInno8, setQuestionInno8] = useState("");
  const [questionInno9, setQuestionInno9] = useState("");
  const [questionInno10, setQuestionInno10] = useState("");
  const [questionInno11, setQuestionInno11] = useState("");
  const [questionInno12, setQuestionInno12] = useState("");
  const [questionInno13, setQuestionInno13] = useState("");
  const [questionInno14, setQuestionInno14] = useState("");
  const [answerInno, setanswerInno] = useState("");
  const [answerInno2, setanswerInno2] = useState("");
  const [answerInno4, setanswerInno4] = useState("");
  const [answerInno5, setanswerInno5] = useState("");
  const [answerInno6, setanswerInno6] = useState("");
  const [answerInno7, setanswerInno7] = useState("");
  const [answerInno8, setanswerInno8] = useState("");
  const [answerInno9, setanswerInno9] = useState("");
  const [answerInno10, setanswerInno10] = useState("");
  const [answerInno11, setanswerInno11] = useState("");
  const [answerInno12, setanswerInno12] = useState("");
  const [answerInno13, setanswerInno13] = useState("");
  const [answerInno14, setanswerInno14] = useState("");
  const [generatinganswerInno, setGeneratinganswerInno] = useState(false);
  const [generatinganswerInno2, setGeneratinganswerInno2] = useState(false);
  const [generatinganswerInno4, setGeneratinganswerInno4] = useState(false);
  const [generatinganswerInno5, setGeneratinganswerInno5] = useState(false);
  const [generatinganswerInno6, setGeneratinganswerInno6] = useState(false);
  const [generatinganswerInno7, setGeneratinganswerInno7] = useState(false);
  const [generatinganswerInno8, setGeneratinganswerInno8] = useState(false);
  const [generatinganswerInno9, setGeneratinganswerInno9] = useState(false);
  const [generatinganswerInno10, setGeneratinganswerInno10] = useState(false);
  const [generatinganswerInno11, setGeneratinganswerInno11] = useState(false);
  const [generatinganswerInno12, setGeneratinganswerInno12] = useState(false);
  const [generatinganswerInno13, setGeneratinganswerInno13] = useState(false);
  const [generatinganswerInno14, setGeneratinganswerInno14] = useState(false);
  const [pdfText, setPdfText] = useState("");

  // ***************************************************

  const [shouldGenerate, setShouldGenerate] = useState(false);

  useEffect(() => {
    setShouldGenerate(true);
  }, []);

  useEffect(() => {
    if (shouldGenerate && buttonRef.current) {
      buttonRef.current.click();
      setShouldGenerate(false); // Reset the state
    }
  }, [shouldGenerate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }, 100); // Adjust the timeout as necessary
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // ******************************************************

  const [selectedButtons, setSelectedButtons] = useState([]);
  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  // Load selectedButtons from local storage when the component mounts
  useEffect(() => {
    const selectedBtns = localStorage.getItem("selectedButtons");
    if (selectedBtns) {
      setSelectedButtons(selectedBtns);
    }
  }, []);

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
    localStorage.setItem("answerInno", answerInno);
  }, [answerInno]);

  useEffect(() => {
    localStorage.setItem("answerInno2", answerInno2);
  }, [answerInno2]);

  useEffect(() => {
    localStorage.setItem("answerInno4", answerInno4);
  }, [answerInno4]);

  useEffect(() => {
    localStorage.setItem("answerInno5", answerInno5);
  }, [answerInno5]);

  useEffect(() => {
    localStorage.setItem("answerInno6", answerInno6);
  }, [answerInno6]);

  useEffect(() => {
    localStorage.setItem("answerInno7", answerInno7);
  }, [answerInno7]);

  useEffect(() => {
    localStorage.setItem("answerInno8", answerInno8);
  }, [answerInno8]);

  useEffect(() => {
    localStorage.setItem("answerInno9", answerInno9);
  }, [answerInno9]);

  useEffect(() => {
    localStorage.setItem("answerInno10", answerInno10);
  }, [answerInno10]);

  useEffect(() => {
    localStorage.setItem("answerInno11", answerInno11);
  }, [answerInno11]);

  useEffect(() => {
    localStorage.setItem("answerInno12", answerInno12);
  }, [answerInno12]);

  useEffect(() => {
    localStorage.setItem("answerInno13", answerInno13);
  }, [answerInno13]);

  useEffect(() => {
    localStorage.setItem("answerInno14", answerInno14);
  }, [answerInno14]);

  // *************************

  async function generateanswerInno(e) {
    setGeneratinganswerInno(true);
    e.preventDefault();
    setanswerInno("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno }] }],
        },
      });

      setanswerInno(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno(false);
  }

  async function generateanswerInno2(e) {
    setGeneratinganswerInno2(true);
    e.preventDefault();
    setanswerInno2("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno2 }] }],
        },
      });

      setanswerInno2(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno2("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno2(false);
  }

  async function generateanswerInno4(e) {
    setGeneratinganswerInno4(true);
    e.preventDefault();
    setanswerInno4("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno4 }] }],
        },
      });

      setanswerInno4(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno4("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno4(false);
  }

  async function generateanswerInno5(e) {
    setGeneratinganswerInno5(true);
    e.preventDefault();
    setanswerInno5("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno5 }] }],
        },
      });

      setanswerInno5(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno5("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno5(false);
  }

  async function generateanswerInno6(e) {
    setGeneratinganswerInno6(true);
    e.preventDefault();
    setanswerInno6("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno6 }] }],
        },
      });

      setanswerInno6(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno6("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno6(false);
  }

  async function generateanswerInno7(e) {
    setGeneratinganswerInno7(true);
    e.preventDefault();
    setanswerInno7("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno7 }] }],
        },
      });

      setanswerInno7(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno7("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno7(false);
  }

  async function generateanswerInno8(e) {
    setGeneratinganswerInno8(true);
    e.preventDefault();
    setanswerInno8("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno8 }] }],
        },
      });

      setanswerInno8(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno8("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno8(false);
  }

  async function generateanswerInno9(e) {
    setGeneratinganswerInno9(true);
    e.preventDefault();
    setanswerInno9("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno9 }] }],
        },
      });

      setanswerInno9(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno9("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno9(false);
  }

  async function generateanswerInno10(e) {
    setGeneratinganswerInno10(true);
    e.preventDefault();
    setanswerInno10("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno10 }] }],
        },
      });

      setanswerInno10(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno10("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno10(false);
  }

  async function generateanswerInno11(e) {
    setGeneratinganswerInno11(true);
    e.preventDefault();
    setanswerInno11("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno11 }] }],
        },
      });

      setanswerInno11(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno11("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno11(false);
  }

  async function generateanswerInno12(e) {
    setGeneratinganswerInno12(true);
    e.preventDefault();
    setanswerInno12("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno12 }] }],
        },
      });

      setanswerInno12(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno12("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno12(false);
  }

  async function generateanswerInno13(e) {
    setGeneratinganswerInno13(true);
    e.preventDefault();
    setanswerInno13("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno13 }] }],
        },
      });

      setanswerInno13(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno13("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno13(false);
  }

  async function generateanswerInno14(e) {
    setGeneratinganswerInno14(true);
    e.preventDefault();
    setanswerInno14("Generating answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: questionInno14 }] }],
        },
      });

      setanswerInno14(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setanswerInno14("Sorry - Something went wrong. Please try again!");
    }

    setGeneratinganswerInno14(false);
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

  const handleChangesInno1 = (html) => {
    setanswerInno(html);
    console.log(`This is answerInno One ${answerInno}`);
  };

  const handleChangesInno2 = (html) => {
    setanswerInno2(html);
  };

  const handleChangesInno4 = (html) => {
    setanswerInno4(html);
  };

  const handleChangesInno5 = (html) => {
    setanswerInno5(html);
  };

  const handleChangesInno6 = (html) => {
    setanswerInno6(html);
  };

  const handleChangesInno7 = (html) => {
    setanswerInno7(html);
  };

  const handleChangesInno8 = (html) => {
    setanswerInno8(html);
  };

  const handleChangesInno9 = (html) => {
    setanswerInno9(html);
  };

  const handleChangesInno10 = (html) => {
    setanswerInno10(html);
  };

  const handleChangesInno11 = (html) => {
    setanswerInno11(html);
  };

  const handleChangesInno12 = (html) => {
    setanswerInno12(html);
  };

  const handleChangesInno13 = (html) => {
    setanswerInno13(html);
  };

  const handleChangesInno14 = (html) => {
    setanswerInno14(html);
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

  const handleButtonClickInno = () => {
    console.log("Button1 clicked");
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("firstQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno2 = () => {
    console.log("Button2 clicked");
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("secondQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno2(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno4 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("fourthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno4(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno5 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("fifthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno5(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno6 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("sixthQuestionInno").innerText;

    // Combine Content and set it in the textarea
    setQuestionInno6(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno7 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent = document.getElementById(
      "seventhQuestionInno"
    ).innerText;

    // Combine content and set it in the textarea
    setQuestionInno7(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno8 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("eighthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno8(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno9 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("ninthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno9(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno10 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("tenthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno10(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno11 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent = document.getElementById(
      "eleventhQuestionInno"
    ).innerText;

    // Combine content and set it in the textarea
    setQuestionInno11(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno12 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent =
      document.getElementById("twelthQuestionInno").innerText;

    // Combine content and set it in the textarea
    setQuestionInno12(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno13 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent = document.getElementById(
      "thirteenthQuestionInno"
    ).innerText;

    // Combine content and set it in the textarea
    setQuestionInno13(`${pdfContent}\n${questionInnoContent}`);
  };

  const handleButtonClickInno14 = () => {
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionInnoContent = document.getElementById(
      "fourteenthQuestionInno"
    ).innerText;

    // Combine content and set it in the textarea
    setQuestionInno14(`${pdfContent}\n${questionInnoContent}`);
  };

  return (
    <>
      {/* <div id="UploadPDF">
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
      </div> */}

      <div className="pdf-text-container" style={{ display: "none" }}>
        <h2 className="text-xl font-bold">PDF Text Content:</h2>
        <p id="pdfText" value={pdfText} onChange={handleChange}>
          {pdfText}
        </p>
      </div>

      {selectedButtons.includes("Summary Of Invention") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Summary Of Invention</h3>
          {/* <p style={{ fontSize: "18px" }}>
          What is the tentative title for your invention?
        </p> */}
          <p id="firstQuestionInno" style={{ display: "none" }}>
            Provide me the Summary Of Invention of the above provided content.
            Provided content should only contain the Summary Of The Invention in
            bold letters and nothing else. Don't use html word.
            <br />
            Provide a concise overview of the invention, including its purpose,
            function, and primary application. Describe what the invention is
            and what it aims to achieve.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno}
              onChange={(e) => setQuestionInno(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button1"
              ref={buttonRef}
              onClick={handleButtonClickInno}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno}
            >
              Regenerate Answer
            </button>
          </form>
          <div
            id="firstanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno}
              onChange={handleChangesInno1}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example structure for second question */}
      {selectedButtons.includes("Key Features") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Key Features</h3>
          {/* <p style={{ fontSize: "18px" }}>
            Please indicate the occasion for making this invention. Describe the
            general problem statement and which prior art, already known to you
            that forms the starting of your invention?
          </p> */}
          <p id="secondQuestionInno" style={{ display: "none" }}>
            Provide me the Key Features of the above provided content. Provided
            content should only contain the Key Features in bold letters and
            nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Provide me the List and explain the key features or components that
            make up the invention. Highlight the aspects that are most crucial
            to its functionality and uniqueness.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno2}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno2}
              onChange={(e) => setQuestionInno2(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button2"
              onClick={handleButtonClickInno2}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno2}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="secondanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno2}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno2}
              onChange={handleChangesInno2}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example structure for fourth question */}
      {selectedButtons.includes("Problem Statement") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Problem Statement</h3>
          {/* <p style={{ fontSize: "18px" }}>
            What is the novel aspect of your invention and how is it solving the
            drawbacks found in existing prior art?
          </p> */}
          <p id="fourthQuestionInno" style={{ display: "none" }}>
            Provide me the Problem Statement of the above provided content.
            Provided content should only contain the Problem Statement in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Describe the problem or challenge that the invention is designed to
            address. Why is this problem significant, and what are the current
            limitations or issues with existing solutions?
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno4}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno4}
              onChange={(e) => setQuestionInno4(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button4"
              onClick={handleButtonClickInno4}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno4}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="fourthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno4}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno4}
              onChange={handleChangesInno4}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example structure for fifth question */}
      {selectedButtons.includes("Solution Statement") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Solution Statement</h3>

          <p id="fifthQuestionInno" style={{ display: "none" }}>
            Provide me the Solution Statement of the above provided content.
            Provided content should only contain the Solution Statement in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Explain how the invention provides a solution to the identified
            problem. Describe the mechanisms, processes, or innovations that
            offer a better or new approach to solving the issue.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno5}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno5}
              onChange={(e) => setQuestionInno5(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button5"
              onClick={handleButtonClickInno5}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno5}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="fifthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno5}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno5}
              onChange={handleChangesInno5}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for sixth question */}
      {selectedButtons.includes("Novelty Statement") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Novelty Statement</h3>

          <p id="sixthQuestionInno" style={{ display: "none" }}>
            Provide me the Novelty Statement of the above provided content.
            Provided content should only contain the Novelty Statement in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            What makes this invention novel or unique compared to existing
            technologies? Highlight any distinctive features or improvements
            that differentiate it from prior art.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno6}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno6}
              onChange={(e) => setQuestionInno6(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button6"
              onClick={handleButtonClickInno6}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno6}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="sixthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno6}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno6}
              onChange={handleChangesInno6}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Seventh question */}
      {selectedButtons.includes("Listing Of Results") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Listing of Results</h3>

          <p id="seventhQuestionInno" style={{ display: "none" }}>
            Provide me the Listing of Results of the above provided content.
            Provided content should only contain the Listing of Results in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Provide a detailed listing of the 20 search results, including
            relevant patents, applications, and non-patent literature that
            closely relate to the invention. Include key details like patent
            numbers, titles, abstract and publication dates.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno7}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno7}
              onChange={(e) => setQuestionInno7(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button7"
              onClick={handleButtonClickInno7}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno7}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="seventhanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno7}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno7}
              onChange={handleChangesInno7}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Eighth question */}
      {selectedButtons.includes("Key Feature vs Result Matrix") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Relevant Excerpts</h3>

          <p id="eighthQuestionInno" style={{ display: "none" }}>
            Provide me the Key Feature vs Result Matrix of the above provided
            content. Provided content should only contain the Key Feature vs
            Result Matrix in bold letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Create a matrix comparing the key features of the invention with the
            relevant prior art. For each feature, indicate whether a similar
            feature exists in the prior art, and explain any differences.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno8}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno8}
              onChange={(e) => setQuestionInno8(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button8"
              onClick={handleButtonClickInno8}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno8}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="eighthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno8}
              onChange={handleChangesInno8}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Ninth question */}
      {selectedButtons.includes("Advantages Of Invention") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Advantages of Invention</h3>

          <p id="ninthQuestionInno" style={{ display: "none" }}>
            Provide me the Advantages of Invention of the above provided
            content. Provided content should only contain the Advantages of
            Invention in bold letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Describe the advantages the invention offers over existing
            technologies. How does it improve performance, efficiency, cost, or
            usability compared to the prior art?
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno9}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno9}
              onChange={(e) => setQuestionInno9(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button9"
              onClick={handleButtonClickInno9}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno9}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="ninthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno9}
              onChange={handleChangesInno9}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Tenth question */}
      {selectedButtons.includes("Comparative Analysis") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Comparative Analysis</h3>

          <p id="tenthQuestionInno" style={{ display: "none" }}>
            Provide me the Comparative Analysis of the above provided content.
            Provided content should only contain the Comparative Analysis in
            bold letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Conduct a detailed comparison between the invention and the most
            relevant prior art. Focus on similarities, differences, and why the
            invention stands out in terms of novelty and improvement.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno10}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno10}
              onChange={(e) => setQuestionInno10(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button10"
              onClick={handleButtonClickInno10}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno10}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="tenthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno8}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno10}
              onChange={handleChangesInno10}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Eleventh question */}
      {selectedButtons.includes("Industrial Applicability") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Industrial Applicability</h3>

          <p id="eleventhQuestionInno" style={{ display: "none" }}>
            Provide me the Industrial Applicability of the above provided
            content. Provided content should only contain the Industrial
            Applicability in bold letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Identify the potential industrial applications of the invention.
            Where and how could this invention be applied in industry or
            commercial products?
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno11}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno11}
              onChange={(e) => setQuestionInno11(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button11"
              onClick={handleButtonClickInno11}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno11}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="eleventhanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno11}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno11}
              onChange={handleChangesInno11}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Twelth question */}
      {selectedButtons.includes("Relevant Excerpts") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Relevant Excerpts</h3>

          <p id="twelthQuestionInno" style={{ display: "none" }}>
            Provide me the Relevant Excerpts of the above provided content.
            Provided content should only contain the Relevant Excerpts in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Extract and list the most relevant excerpts or sections from the
            identified prior art that relate directly to the key features of the
            invention.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno12}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno12}
              onChange={(e) => setQuestionInno12(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button12"
              onClick={handleButtonClickInno12}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno12}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="twelthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno12}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno12}
              onChange={handleChangesInno12}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Thirteenth question */}
      {selectedButtons.includes("Inovators In The Field") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Inovators In The Field</h3>

          <p id="thirteenthQuestionInno" style={{ display: "none" }}>
            Provide me the Inovators In The Field of the above provided content.
            Provided content should only contain the Inovators In The Field in
            bold letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Identify key innovators or companies in the relevant field.
            Categorize them into small, medium, and large entities based on
            their market presence, and describe their role or contributions in
            similar technologies.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno13}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno13}
              onChange={(e) => setQuestionInno13(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button13"
              onClick={handleButtonClickInno13}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno13}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="thirteenthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno13}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno13}
              onChange={handleChangesInno13}
              modules={modules}
            />
          </div>
        </div>
      )}

      {/* Example Structure for Fourteenth question */}
      {selectedButtons.includes("Recommendation") && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
          <h3 style={{ color: "#36718b" }}>Recommendation</h3>

          <p id="fourteenthQuestionInno" style={{ display: "none" }}>
            Provide me the Recommendation of the above provided content.
            Provided content should only contain the Recommendation in bold
            letters and nothing else.
            <br />
            Don't use html word in the answer.
            <br />
            Based on the search results, provide recommendations on whether to
            proceed with a patent application, refine the invention, or explore
            alternative strategies. Include any actionable steps for further
            development.
            <br />
            And provided content should only give complete answer using proper
            html tags & not even single word is written without tag. And also
            give the content with proper heading and ordered list with proper
            alignment so that it looks good. And provided text must align to the
            left side. And the provided content must be left aligned.
          </p>
          <form
            onSubmit={generateanswerInno14}
            className="bg-white-new w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg shadow-lg bg-white py-2 px-4 transition-all duration-500 transform hover:scale-105"
          >
            <textarea
              id="passQuery"
              required
              className="border border-gray-300 rounded w-full my-2 min-h-fit p-3 transition-all duration-300 focus:border-blue-400 focus:shadow-lg"
              value={questionInno14}
              onChange={(e) => setQuestionInno14(e.target.value)}
              placeholder="Ask anything"
              style={{ display: "none" }}
            ></textarea>
            <button
              id="button14"
              onClick={handleButtonClickInno14}
              type="submit"
              className="btn btn-primary w-auto"
              disabled={generatinganswerInno14}
            >
              Generate Answer
            </button>
          </form>
          <div
            id="fourteenthanswerInno"
            className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
            style={{ overflowY: "scroll" }}
          >
            {/* <ReactMarkdown className="p-4">{answerInno6}</ReactMarkdown> */}
            <ReactQuill
              value={answerInno14}
              onChange={handleChangesInno14}
              modules={modules}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default UploadPDFInno;
