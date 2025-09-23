
import "./ContentMain.css";
import UploadPDF from "./InvetionDisclosure/UploadPDF";
import PatentDrafting from "./PatentDrafting/PatentDrafting";

const ContentMainDraft = () => {
  return (
    <div className="main-content-holder">
      <UploadPDF />
      <PatentDrafting />
    </div>
  );
};

export default ContentMainDraft;
