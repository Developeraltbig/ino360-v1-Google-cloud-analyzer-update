import React, { useState, useEffect } from "react";
import "../IDSPro/idsForm.css"; 


const FEE_SCHEDULE = {

  Individual: {
    basic: 1600,
    pageThreshold: 30,
    extraPageFee: 160,
    claimThreshold: 10,
    extraClaimFee: 320,
    priorityThreshold: 1,
    extraPriorityFee: 1600,
    examination: 4000,
    sequence: {
      pageThreshold: 150,
      perPageFee: 160,
      maxFee: 24000,
    },
  },
  // For 'Other' and 'Small' categories
  Other: {
    basic: 8000,
    pageThreshold: 30,
    extraPageFee: 800,
    claimThreshold: 10,
    extraClaimFee: 1600,
    priorityThreshold: 1,
    extraPriorityFee: 8000,
    examination: 20000,
    sequence: {
      pageThreshold: 150,
      perPageFee: 800,
      maxFee: 120000,
    },
  },
};

// Map applicant categories to the correct fee schedule type
const getFeeCategory = (applicantCategory) => {
    if (["Natural", "Start", "education"].includes(applicantCategory)) {
        return "Individual";
    }
    if (["Other", "Small"].includes(applicantCategory)) {
        return "Other";
    }
    return null; // Return null if no category is selected
};


// --- Helper function to generate unique IDs for keys ---
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// --- PRESENTATIONAL COMPONENTS (No changes here) ---

function BasicDetailsComponent({ docketNo, setDocketNo, jurisdiction, setJurisdiction, applicantCategory, setApplicantCategory, applicationType, interAppliNo, setInterAppliNo, interFilingDate, setInterFilingDate, title, setTitle }) {
    return (
        <div className="ids-section-card">
            <h2>Create India Application</h2>
            <h3>Basic Details</h3>
            <div className="ids-table-container">
                <table>
                    <tbody>
                        <tr>
                            <td>Docket No</td>
                            <td>
                                <input type="text" placeholder="Docket No" value={docketNo} onChange={(e) => setDocketNo(e.target.value)} required />
                            </td>
                        </tr>
                        <tr>
                            <td>Jurisdiction</td>
                            <td>
                                <select class="qf-form-control" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} required>
                                    <option value="">Select Jurisdiction</option>
                                    <option value="New Delhi">NEW DELHI</option>
                                    <option value="Mumbai">MUMBAI</option>
                                    <option value="Kolkata">KOLKATA</option>
                                    <option value="Chennai">CHENNAI</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Applicant Category</td>
                            <td>
                                <select class="qf-form-control" value={applicantCategory} onChange={(e) => setApplicantCategory(e.target.value)} required>
                                    <option value="">Select Applicant Category</option>
                                    <option value="Natural">NATURAL PERSON</option>
                                    <option value="Small">SMALL ENTITY</option>
                                    <option value="Start">STARTUP</option>
                                    <option value="education">EDUCATION</option>
                                    <option value="Other">OTHER</option>
                                </select>
                            </td>
                        </tr>
                        
                        <tr>
                            <td>Title of the Invention</td>
                            <td>
                                <input placeholder="Title of the Invention" class="qf-form-control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DynamicTableComponent({ title, columns, data, setData, addRowText }) {
    const addRow = () => { const newRow = columns.reduce((acc, col) => ({ ...acc, [col.field]: "" }), { id: generateId() }); setData([...data, newRow]); };
    const removeRow = (id) => { setData(data.filter((row) => row.id !== id)); };
    const handleChange = (id, field, value) => { const newData = data.map((row) => (row.id === id ? { ...row, [field]: value } : row)); setData(newData); };
    return (
        <div className="ids-section-card">
            <h3>{title}</h3>
            <div className="ids-table-container">
                <table>
                    <thead>
                        <tr>{columns.map((col) => (<th key={col.field}>{col.header}</th>))}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                        <tr key={row.id}>{columns.map((col) => (
                            <td key={col.field}>
                            <input  type={col.type || "text"} placeholder={col.header} value={row[col.field] || ""} onChange={(e) => handleChange(row.id, col.field, e.target.value)} />
                            </td>
                        ))}
                            <td>
                                <button className="ids-btn ids-btn-remove" onClick={() => removeRow(row.id)} type="button">Remove</button>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
            <button className="ids-btn ids-btn-add" onClick={addRow} type="button">{addRowText || "Add Row"}</button>
        </div>
    );
}

function SpecificationFeesComponent({ descripOfPage, setDescripOfPage, claimsPage, setClaimsPage, drawingPage, setDrawingPage, numberOfDrawing, setNumberOfDrawing, numberOfClaims, setNumberOfClaims, numberOfPriorities, setNumberOfPriorities, totalPages, setTotalPages, requestForExamination, setRequestForExamination, depositDate, setDepositDate, sumNumberOfPage, basicFee, noOfExtraPage, extraPageCharge, noOfExtraClaims, extraClaimsCharge, noOfExtraPriorities, extraPrioritiesCharge, examinationCharge, sequenceCharge, totalDepositFee }) {
    return (
        <div className="ids-section-card">
            <h3>Specification & Fees</h3>
            <div className="ids-table-container">
                <table>
                    <tbody>
                        <tr>
                            <td>Description Pages</td>
                            <td>
                                <input class="qf-form-control" type="number" value={descripOfPage} min="0" onChange={(e) => setDescripOfPage(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>Claims Pages</td>
                            <td>
                                <input class="qf-form-control" type="number" value={claimsPage} min="0" onChange={(e) => setClaimsPage(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>Drawing Pages</td>
                            <td>
                                <input class="qf-form-control" type="number" value={drawingPage} min="0" onChange={(e) => setDrawingPage(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>Abstract Page</td>
                            <td>
                                <input class="qf-form-control" type="text" value="1" readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Form 2</td>
                            <td>
                                <input type="text" value="1" class="qf-form-control" readOnly  />
                            </td>
                        </tr>
                        <tr>
                            <td>Sum of Pages</td>
                            <td>
                                <input type="text" value={sumNumberOfPage} class="qf-form-control" readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>No. of Drawings</td>
                            <td>
                                <input class="qf-form-control" type="number" value={numberOfDrawing} min="0" onChange={(e) => setNumberOfDrawing(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>No. of Claims</td>
                            <td>
                                <input class="qf-form-control" type="number" value={numberOfClaims} min="0" onChange={(e) => setNumberOfClaims(e.target.value)} required />
                            </td>
                        </tr>
                        <tr>
                            <td>No. of Priorities</td>
                            <td>
                                <input class="qf-form-control" type="number" value={numberOfPriorities} min="0" onChange={(e) => setNumberOfPriorities(e.target.value)} required />
                            </td>
                        </tr>
                        <tr>
                            <td>Total Pages in Spec</td>
                            <td>
                                <input class="qf-form-control" type="number" value={totalPages} min="0" onChange={(e) => setTotalPages(e.target.value)} required />
                            </td>
                        </tr>
                        <tr>
                            <td>Basic Filing Fees</td>
                            <td>
                                <input class="qf-form-control" type="text" value={basicFee} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Pages</td>
                            <td>
                                <input class="qf-form-control" type="text" value={noOfExtraPage} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Page Fees</td>
                            <td>
                                <input class="qf-form-control" type="text" value={extraPageCharge} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Claims</td>
                            <td>
                                <input class="qf-form-control" type="text" value={noOfExtraClaims} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Claims Fees</td>
                            <td>
                                <input class="qf-form-control" type="text" value={extraClaimsCharge} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Priority</td>
                            <td>
                                <input class="qf-form-control" type="text" value={noOfExtraPriorities} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Extra Priority Fees</td>
                            <td>
                                <input class="qf-form-control" type="text" value={extraPrioritiesCharge} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Request For Examination?</td>
                            <td>
                                <select class="qf-form-control" value={requestForExamination} onChange={(e) => setRequestForExamination(e.target.value)} required>
                                    <option value="">Select</option>
                                    <option value="yes">YES</option>
                                    <option value="no">NO</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Examination Fees</td>
                            <td>
                                <input class="qf-form-control" type="text" value={examinationCharge} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Deposit Date</td>
                            <td>
                                <input class="qf-form-control" type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>Total Deposit Fee</td>
                            <td>
                                <input class="qf-form-control" type="text" value={totalDepositFee} readOnly style={{ fontWeight: 'bold', color: '#005a9c', fontSize: '1.1em' }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- MAIN CONTAINER COMPONENT ---
const IndiaForms = () => {
    // All state declarations
    const [docketNo, setDocketNo] = useState("");
    const [jurisdiction, setJurisdiction] = useState("");
    const [applicationType, setApplicationType] = useState("");
    const [applicantCategory, setApplicantCategory] = useState("");
    const [interAppliNo, setInterAppliNo] = useState("");
    const [interFilingDate, setInterFilingDate] = useState("");
    const [title, setTitle] = useState("");
    const [applicants, setApplicants] = useState([{ id: generateId(), name: "", nationality: "", residenceCountry: "", address: "" }]);
    const [inventorSameAsApplicant, setInventorSameAsApplicant] = useState("");
    const [inventors, setInventors] = useState([{ id: generateId(), name: "", citizenCountry: "", residenceCountry: "", address: "" }]);
    const [claimingPriority, setClaimingPriority] = useState("");
    const [priorities, setPriorities] = useState([{ id: generateId(), country: "", number: "", date: "", applicantName: "", title: "" }]);
    const [descripOfPage, setDescripOfPage] = useState(0);
    const [claimsPage, setClaimsPage] = useState(0);
    const [drawingPage, setDrawingPage] = useState(0);
    const [numberOfDrawing, setNumberOfDrawing] = useState(0);
    const [numberOfClaims, setNumberOfClaims] = useState(0);
    const [numberOfPriorities, setNumberOfPriorities] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [requestForExamination, setRequestForExamination] = useState("");
    const [sequenceListing, setSequenceListing] = useState("");
    const [sequencePage, setSequencePage] = useState(0);
    const [depositDate, setDepositDate] = useState("");
    // Calculated state
    const [sumNumberOfPage, setSumNumberOfPage] = useState(1);
    const [basicFee, setBasicFee] = useState(0);
    const [noOfExtraPage, setNoOfExtraPage] = useState(0);
    const [extraPageCharge, setExtraPageCharge] = useState(0);
    const [noOfExtraClaims, setNoOfExtraClaims] = useState(0);
    const [extraClaimsCharge, setExtraClaimsCharge] = useState(0);
    const [noOfExtraPriorities, setNoOfExtraPriorities] = useState(0);
    const [extraPrioritiesCharge, setExtraPrioritiesCharge] = useState(0);
    const [examinationCharge, setExaminationCharge] = useState(0);
    const [sequenceCharge, setSequenceCharge] = useState(0);
    const [totalDepositFee, setTotalDepositFee] = useState(0);
    // Table column definitions
    const applicantColumns = [{ header: "Applicant's Name", field: "name" }, { header: "Nationality", field: "nationality" }, { header: "Country of Residence", field: "residenceCountry" }, { header: "Address", field: "address" }];
    const inventorColumns = [{ header: "Inventor's Name", field: "name" }, { header: "Citizen of Country", field: "citizenCountry" }, { header: "Country of Residence", field: "residenceCountry" }, { header: "Inventor Address", field: "address" }];
    const priorityColumns = [{ header: "Priority Country", field: "country" }, { header: "Priority No", field: "number" }, { header: "Priority Date", field: "date", type: "date" }, { header: "Applicant Name", field: "applicantName" }, { header: "Title In Priority", field: "title" }];

    // --- NEW, ROBUST CALCULATION LOGIC ---
    useEffect(() => {
        // 1. Calculate Sum of Pages
        const totalSpecPages = (Number(descripOfPage) || 0) + (Number(claimsPage) || 0) + (Number(drawingPage) || 0) + 1 + 1;
        setSumNumberOfPage(totalSpecPages);

        // 2. Determine the correct fee schedule based on applicant category
        const feeCategory = getFeeCategory(applicantCategory);
        if (!feeCategory) {
            // If no category is selected, reset all fees to 0
            setBasicFee(0); setExtraPageCharge(0); setExtraClaimsCharge(0); setExtraPrioritiesCharge(0);
            setExaminationCharge(0); setSequenceCharge(0); setTotalDepositFee(0);
            setNoOfExtraPage(0); setNoOfExtraClaims(0); setNoOfExtraPriorities(0);
            return;
        }
        const fees = FEE_SCHEDULE[feeCategory];

        // 3. Calculate each fee component
        const baseFee = fees.basic;
        setBasicFee(baseFee);

        const extraPagesCount = Math.max(0, (Number(totalPages) || 0) - fees.pageThreshold);
        const extraPagesFee = extraPagesCount * fees.extraPageFee;
        setNoOfExtraPage(extraPagesCount);
        setExtraPageCharge(extraPagesFee);

        const extraClaimsCount = Math.max(0, (Number(numberOfClaims) || 0) - fees.claimThreshold);
        const extraClaimsFee = extraClaimsCount * fees.extraClaimFee;
        setNoOfExtraClaims(extraClaimsCount);
        setExtraClaimsCharge(extraClaimsFee);

        const extraPrioritiesCount = Math.max(0, (Number(numberOfPriorities) || 0) - fees.priorityThreshold);
        const extraPrioritiesFee = extraPrioritiesCount * fees.extraPriorityFee;
        setNoOfExtraPriorities(extraPrioritiesCount);
        setExtraPrioritiesCharge(extraPrioritiesFee);

        const examFee = requestForExamination === "yes" ? fees.examination : 0;
        setExaminationCharge(examFee);

        let seqFee = 0;
        if (sequenceListing === "yes" && (Number(sequencePage) || 0) > 0) {
            const pages = Number(sequencePage);
            if (pages <= fees.sequence.pageThreshold) {
                seqFee = pages * fees.sequence.perPageFee;
            } else {
                seqFee = fees.sequence.maxFee;
            }
        }
        setSequenceCharge(seqFee);

        // 4. Sum up the total fee
        const total = baseFee + extraPagesFee + extraClaimsFee + extraPrioritiesFee + examFee + seqFee;
        setTotalDepositFee(total);

    }, [
        applicantCategory, descripOfPage, claimsPage, drawingPage,
        totalPages, numberOfClaims, numberOfPriorities,
        requestForExamination, sequenceListing, sequencePage
    ]);


    const handleSubmit = (e) => { e.preventDefault(); /* ... existing submit logic ... */ };

    return (
        <div className="ids-form-container-fluid">
            <form onSubmit={handleSubmit}>
                <BasicDetailsComponent
                    docketNo={docketNo} setDocketNo={setDocketNo}
                    jurisdiction={jurisdiction} setJurisdiction={setJurisdiction}
                    applicantCategory={applicantCategory} setApplicantCategory={setApplicantCategory}
                    applicationType={applicationType}
                    interAppliNo={interAppliNo} setInterAppliNo={setInterAppliNo}
                    interFilingDate={interFilingDate} setInterFilingDate={setInterFilingDate}
                    title={title} setTitle={setTitle}
                />
                <div className="ids-section-card">
                    <h3>Application Type</h3>
                    <select class="qf-form-control" value={applicationType} onChange={(e) => setApplicationType(e.target.value)} required>
                        <option value="">Select Application Type</option>
                        <option value="CONVENTION">CONVENTION</option>
                        <option value="PCT-NATIONAL-PHASE">PCT NATIONAL PHASE</option>
                    </select>
                    {applicationType === "PCT-NATIONAL-PHASE" && (
                            <tr>
                                <td>Intl. App & Filing Date</td>
                                <td>
                                    <div className="india-form-grid-2-col">
                                        <input type="text" placeholder="International Application Number" value={interAppliNo} onChange={(e) => setInterAppliNo(e.target.value)} />
                                        <input type="date" value={interFilingDate} onChange={(e) => setInterFilingDate(e.target.value)} />
                                        </div>
                                </td>
                            </tr>
                        )}
                </div>
                <DynamicTableComponent title="Applicant Details" columns={applicantColumns} data={applicants} setData={setApplicants} addRowText="Add Applicant" />
                <div className="ids-section-card">
                    <h3>Inventor Details</h3>
                    <select class="qf-form-control" value={inventorSameAsApplicant} onChange={(e) => setInventorSameAsApplicant(e.target.value)} required>
                        <option value="">Are inventors same as applicants?</option>
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                    </select>
                </div>
                {inventorSameAsApplicant === "no" && (<DynamicTableComponent title="Inventor Details" columns={inventorColumns} data={inventors} setData={setInventors} addRowText="Add Inventor" />)}
                <div className="ids-section-card">
                    <h3>Priority Details</h3>
                    <select class="qf-form-control" value={claimingPriority} onChange={(e) => setClaimingPriority(e.target.value)} required>
                        <option value="">Are you claiming priority?</option>
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                    </select>
                </div>
                {claimingPriority === "yes" && (<DynamicTableComponent title="Priority Details" columns={priorityColumns} data={priorities} setData={setPriorities} addRowText="Add Priority" />)}
                <SpecificationFeesComponent
                    descripOfPage={descripOfPage} setDescripOfPage={setDescripOfPage}
                    claimsPage={claimsPage} setClaimsPage={setClaimsPage}
                    drawingPage={drawingPage} setDrawingPage={setDrawingPage}
                    numberOfDrawing={numberOfDrawing} setNumberOfDrawing={setNumberOfDrawing}
                    numberOfClaims={numberOfClaims} setNumberOfClaims={setNumberOfClaims}
                    numberOfPriorities={numberOfPriorities} setNumberOfPriorities={setNumberOfPriorities}
                    totalPages={totalPages} setTotalPages={setTotalPages}
                    requestForExamination={requestForExamination} setRequestForExamination={setRequestForExamination}
                    depositDate={depositDate} setDepositDate={setDepositDate}
                    sumNumberOfPage={sumNumberOfPage} basicFee={basicFee} noOfExtraPage={noOfExtraPage}
                    extraPageCharge={extraPageCharge} noOfExtraClaims={noOfExtraClaims} extraClaimsCharge={extraClaimsCharge}
                    noOfExtraPriorities={noOfExtraPriorities} extraPrioritiesCharge={extraPrioritiesCharge}
                    examinationCharge={examinationCharge} sequenceCharge={sequenceCharge} totalDepositFee={totalDepositFee}
                />
                <div className="ids-section-card">
                    <h3>Sequence Listing</h3>
                    <select value={sequenceListing} onChange={(e) => setSequenceListing(e.target.value)} class="qf-form-control" required>
                        <option value="">Is there a Sequence Listing?</option>
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                    </select>
                    {sequenceListing === 'yes' && (
                        <div className="india-form-grid-2-col" style={{ marginTop: '20px' }}>
                            <label>Sequence Pages</label>
                            <input type="number" placeholder="Sequence Pages" class="qf-form-control" value={sequencePage} min="0" onChange={(e) => setSequencePage(e.target.value)} />
                            <label>Sequence Fee</label>
                            <input type="text" placeholder="Sequence Fees" value={sequenceCharge} readOnly />
                        </div>
                    )}
                </div>
                <div style={{ marginTop: "30px", marginBottom: "50px", textAlign: "center" }}>
                    <button className="ids-btn ids-btn-add" type="submit" style={{ minWidth: '200px' }}>Submit Application</button>
                </div>
            </form>
        </div>
    );
};

export default IndiaForms;