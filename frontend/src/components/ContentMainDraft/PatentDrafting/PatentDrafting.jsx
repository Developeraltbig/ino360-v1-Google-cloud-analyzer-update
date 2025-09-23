import React, { useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Document, Packer, Paragraph, TextRun } from "docx";

const PatentDrafting = () => {
  const [editorContent, setEditorContent] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);

  const quillRef = React.createRef();

  useEffect(() => {
    const storedAnswer1 = localStorage.getItem("answerDraft");
    const storedAnswer2 = localStorage.getItem("answerDraft2");
    const storedAnswer3 = localStorage.getItem("answerDraft3");
    const storedAnswer4 = localStorage.getItem("answerDraft4");
    const storedAnswer5 = localStorage.getItem("answerDraft5");
    const storedAnswer6 = localStorage.getItem("answerDraft6");
    const storedAnswer7 = localStorage.getItem("answerDraft7");
    const storedAnswer8 = localStorage.getItem("answerDraft8");
    const storedAnswer9 = localStorage.getItem("answerDraft9");
    if (
      storedAnswer1 &&
      storedAnswer2 &&
      storedAnswer3 &&
      storedAnswer4 &&
      storedAnswer5 &&
      storedAnswer6 &&
      storedAnswer7 &&
      storedAnswer8 &&
      storedAnswer9
    ) {
      setEditorContent(
        `${storedAnswer1}\n\n${storedAnswer2}\n\n${storedAnswer3}\n\n${storedAnswer4}\n\n${storedAnswer5}\n\n${storedAnswer6}\n\n${storedAnswer7}\n\n${storedAnswer8}\n\n${storedAnswer9}`
      );
      console.log(editorContent);
    }
  }, [reloadFlag]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReloadFlag((prev) => !prev); // Toggle the flag to trigger re-render
    }, 2000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const handleChange = (html) => {
    setEditorContent(html);
  };

  const handlePrint4 = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Patent Draft</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>${editorContent}</body>
            </html>
        `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 2000);
  };

  const handleDownload4 = () => {
    const quill = quillRef.current.getEditor();
    const textContent = quill.getText();

    const paragraphs = textContent.split("\n").map((line) => {
      return new Paragraph({
        children: [new TextRun(line)],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // Pack the document and trigger download
    Packer.toBlob(doc)
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "editor-content.docx"; // Change extension to .docx
        link.click();
      })
      .catch((error) => {
        console.error("Error creating DOCX file:", error);
      });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  return (
    <div id="PatentDrafting">
      <ReactQuill
        ref={quillRef}
        value={editorContent}
        onChange={handleChange}
        modules={modules}
        style={{ display: "none" }}
      />
      {/* <button
        className="btn btn-success"
        onClick={handleDownload4}
        style={{
          margin: "10px",
          padding: "5px",
          width: "200px",
        }}
      >
        Download as DOCX
      </button>  */}
      <button
        className="btn-stl-4 w-auto"
        onClick={handlePrint4}
        style={{
          margin: "10px",
          padding: "13px",
          height: "43px",
          marginBottom: "50px",
          width: "200px",
          color: "rgb(80, 79, 79)",
        }}
      >
        <b>Download Draft Master</b>
      </button>
    </div>
  );
};

export default PatentDrafting;
