import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../QuickForms/wipoForm.css";

// ********************

const Content = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answerJson, setAnswerJson] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const value = typeof answerJson;

  const [formSections, setFormSections] = useState([{}]);

  const [pdfText, setPdfText] = useState("");

  const handleAddSection = () => {
    setFormSections([...formSections, {}]);
  };

  const handleRemoveSection = (index) => {
    let j = i + 1;
    setFormSections(formSections.filter((_, i) => i !== index));
  };

  // Load pdfText from local storage when the component mounts
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText");
    if (storedPdfText) {
      setPdfText(storedPdfText);
    }
  }, []);

  // *********************New Code start************

  // *********************New Code Ends************

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
    localStorage.setItem("answerJson", answerJson);
  }, [answerJson]);

  // *************************

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswerJson("Generating Answer... Wait for a while...");
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAH_FfuPV1O3rx37YHVBw2c_fV3CTvE-RM`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      setAnswerJson(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswerJson("Sorry - Something went wrong. Please try again!");
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
    setAnswerJson(html);
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
    console.log("I am button 1");
    const pdfContent = document.getElementById("pdfText").innerText;
    const questionContent = document.getElementById("firstQuestion").innerText;

    // Combine content and set it in the textarea
    setQuestion(`${pdfContent}\n${questionContent}`);
    console.log(value);
  };

  return (
    <div className="container-fluid" style={{ padding: "150px 50px 0px 50px" }}>
      <div
        className="main-content"
        style={{
          background: "#E7EFFA",
          padding: "15px 5px 30px 5px",
          borderRadius: "20px",
        }}
      >
        <div className="main-content-holder">
          <div>
            <div className="pdf-text-container" style={{ display: "none" }}>
              <h2 className="text-xl font-bold">PDF Text Content:</h2>
              <p id="pdfText" value={pdfText} onChange={handleChange}>
                {pdfText}
              </p>
            </div>
            <form onSubmit={generateAnswer} style={{ display: "block" }}>
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
                className="btn-stl-3 w-auto"
                disabled={generatingAnswer}
              >
                Auto Fill Form
              </button>
            </form>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
              <h3 style={{ color: "#36718b" }}>IDF Form Data</h3>

              {/* <p style={{ fontSize: "18px" }}>
                        What is the tentative title for your invention?
                      </p> */}
              <p id="firstQuestion" style={{ display: "none" }}>
                Provide me the Applicants data and Inventors data in JSON format
                from the above provided content. Provided content should only
                contain a JSON i.e JSON containing all the Applicants data and
                all the Inventors data.
                <br />
                Apart from JSON, I don't want even a single word in the answer.
                Only want a JSON starting with the curly brackets in the
                answers.
                <br />
                Answer must start with the curly brackets and words like JSON
                must not be used in the answer.
                <br />
                Don't use any html tags in the answer.
              </p>

              <div
                id="firstAnswer"
                className="w-full md:w-3/3 lg:w-2/2 xl:w-3/3  rounded-lg bg-white shadow-lg transition-all duration-500 transform hover:scale-105"
                style={{
                  // overflowY: "scroll",
                  borderRadius: "15px",
                  border: "none !important",
                }}
              >
                <p style={{ display: "none" }}>{answerJson}</p>

                <ReactQuill
                  value={answerJson}
                  onChange={handleChanges1}
                  modules={modules}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <form>
          <div className="container form-parent">
            <h1
              style={{
                fontSize: "30px",
                color: "#008cbf",
              }}
            >
              WIPO Form
            </h1>

            <hr style={{ color: "#008cbf" }} />
            <div className="row mb-2 mt-4">
              <div className="col-md-3 mb-2">
                <label for="residence" className="form-label">
                  Docket_Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="Docket_Number"
                  placeholder="Enter Docket Number"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="residence" className="form-label">
                  Application_No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="Application_No"
                  placeholder="Enter Application_No"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="titleOfInvention" className="form-label">
                  Title of the Invention
                </label>
                <textarea
                  className="form-control"
                  name="title"
                  rows="1"
                  placeholder="Enter the title"
                ></textarea>
              </div>
              <div className="col-md-3 mb-2">
                <label for="titleOfInvention" className="form-label">
                  Subject Matter
                </label>
                <textarea
                  className="form-control"
                  name="subject"
                  rows="1"
                  placeholder="Enter the Subject Matter"
                  style={{ height: "17px" }}
                ></textarea>
              </div>
              <div className="col-md-3 mb-2">
                <label for="titleOfInvention" className="form-label">
                  Application Type
                </label>
                <textarea
                  className="form-control"
                  name="application"
                  rows="1"
                  placeholder="Enter the Application Type"
                  style={{ height: "17px" }}
                ></textarea>
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  color: "#008cbf",
                  padding: "20px 10px 5px 10px",
                }}
              >
                Applicant Details
              </h2>
              <div>
                {formSections.map((_, index) => (
                  <div className="repeat mt-3" key={index}>
                    <div className="row">
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`firstName-${index}`}
                          className="form-label"
                        >
                          Applicant Name
                        </label>
                        <div>
                          <div className="applicant-field mb-2">
                            <input
                              type="text"
                              className="form-control"
                              name={`applicants[${index}]`}
                              placeholder="Enter Applicant Name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <label htmlFor={`city-${index}`} className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`city[${index}]`}
                          placeholder="Enter City"
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`state-${index}`}
                          className="form-label"
                        >
                          State
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`state[${index}]`}
                          placeholder="Enter State name"
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`country-${index}`}
                          className="form-label"
                        >
                          Country
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`country[${index}]`}
                          placeholder="Enter Country Name"
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`address-${index}`}
                          className="form-label"
                        >
                          Address
                        </label>
                        <textarea
                          className="form-control"
                          name={`address[${index}]`}
                          rows="1"
                          placeholder="Enter address"
                        ></textarea>
                      </div>
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`zipcode-${index}`}
                          className="form-label"
                        >
                          Zip Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`i_zipcodes[${index}]`}
                          placeholder="Enter Zip Code"
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`email-${index}`}
                          className="form-label"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name={`i_emails[${index}]`}
                          placeholder="Enter email"
                        />
                      </div>

                      <div className="col-md-3 mb-2">
                        <label
                          htmlFor={`phone-${index}`}
                          className="form-label"
                        >
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`i_phones[${index}]`}
                          placeholder="Enter Phone Number"
                        />
                      </div>

                      <div className="col-md-3 mb-2">
                        <label htmlFor={`date-${index}`} className="form-label">
                          Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name={`i_dates[${index}]`}
                          placeholder="Enter Date"
                        />
                      </div>
                    </div>
                    <button
                      className="btn btn-danger mt-2"
                      onClick={() => handleRemoveSection(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  className="btn btn-success mt-3"
                  onClick={handleAddSection}
                >
                  Add
                </button>
              </div>

              {/* ***************** */}
              <h2
                style={{
                  fontSize: "18px",
                  color: "#008cbf",
                  padding: "20px 10px 5px 10px",
                }}
              >
                Inventor Details
              </h2>
              <div className="col-md-3 mb-2">
                <label for="residence" className="form-label">
                  Inventor Name
                </label>
                <div>
                  <div className="inventor-field mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="inventors[]"
                      placeholder="Enter inventor name"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondenceEmail" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="i_city"
                  placeholder="Enter City"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondencePhone" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="i_state"
                  placeholder="Enter State name"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondencePhone" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="i_country"
                  placeholder="Enter Country Name"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondenceAddress" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  name="i_address"
                  rows="1"
                  placeholder="Enter address"
                ></textarea>
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondencePhone" className="form-label">
                  Zip Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="i_zipcode"
                  placeholder="Enter Zip Code"
                />
              </div>
              <div className="col-md-3 mb-2">
                <label for="correspondenceEmail" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="i_email"
                  placeholder="Enter email"
                />
              </div>

              <div className="col-md-3 mb-2">
                <label for="residence" className="form-label">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="i_phone"
                  placeholder="Enter Phone Number"
                />
              </div>

              <div className="col-md-3 mb-2">
                <label for="residence" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="i_date"
                  placeholder="Enter Date"
                />
              </div>

              {/* ****************** */}

              <div class="col-md-12 mb-2">
                <label for="residence" class="form-label">
                  Create IDS
                </label>
                <select
                  class="form-control"
                  id="create-ids-select"
                  name="create_ids"
                >
                  <option>Please Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <button
              className="btn-stl-4 w-auto"
              type="submit"
              style={{
                padding: "5px 15px",
                fontSize: "13px",
                color: "rgb(80, 79, 79)",
                height: "40px",
              }}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Content;
