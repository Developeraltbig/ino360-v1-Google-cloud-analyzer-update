import "./ContentMain.css";
import UploadPDF from "./InvetionDisclosure/UploadPDF";
import PatentDrafting from "./PatentDrafting/PatentDrafting";

const ContentMainProvisio = () => {
  return (
    <div className="main-content-holder">
      <UploadPDF />
      <PatentDrafting />
    </div>
  );
};

export default ContentMainProvisio;
