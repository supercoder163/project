import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [disable, setDisable] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please select a PDF file");
      }
    }
  };

  const generatePDF = async () => {
    if (disable) return;
    if (!file) return alert("Please upload your resume PDF");
    if (!jd) return alert("Please enter the Job Description");

    setDisable(true);

    try {
      // Step 1: Parse the PDF to get resume JSON
      const formData = new FormData();
      formData.append("resume", file);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const parseData = await parseRes.json();
      const resumeJson = parseData.data;

      // Step 2: Generate tailored resume
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeJson: resumeJson,
          jd: jd,
          company: company 
        })
      });

      if (!genRes.ok) {
        const errorText = await genRes.text();
        console.error('Error response:', errorText);
        throw new Error("Failed to generate PDF");
      }

      const blob = await genRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Generate filename: Firstname_Lastname_Company.pdf or Firstname_Lastname.pdf
      const capitalize = (str) => {
        return str.split(/\s+/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join("_");
      };
      
      let fileName = "Resume.pdf";
      if (resumeJson.name) {
        const nameParts = resumeJson.name.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          const firstName = capitalize(nameParts[0]);
          const lastName = capitalize(nameParts[nameParts.length - 1]);
          const companyPart = company ? `_${capitalize(company)}` : "";
          fileName = `${firstName}_${lastName}${companyPart}.pdf`;
        } else if (nameParts.length === 1) {
          const firstName = capitalize(nameParts[0]);
          const companyPart = company ? `_${capitalize(company)}` : "";
          fileName = `${firstName}${companyPart}.pdf`;
        }
      }
      
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Generate PDF failed:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDisable(false);
    }
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: "40px auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#f9f9f9",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
        AI Resume Tailor
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "14px" }}>
        Upload your resume PDF and paste a job description to generate a tailored resume
      </p>

      {/* PDF Upload Section */}
      <div style={{ margin: "20px 0" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          Upload Your Resume PDF:
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragActive ? "3px dashed #4CAF50" : "2px dashed #ccc",
            borderRadius: "8px",
            padding: "40px 20px",
            textAlign: "center",
            background: dragActive ? "#f0f8f0" : "#fff",
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative"
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          
          {!file ? (
            <>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📄</div>
              <p style={{ margin: "10px 0", color: "#333", fontWeight: "500" }}>
                Drag & Drop your resume PDF here
              </p>
              <p style={{ margin: "5px 0", color: "#999", fontSize: "14px" }}>
                or click to browse
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>✅</div>
              <p style={{ margin: "10px 0", color: "#4CAF50", fontWeight: "bold" }}>
                {file.name}
              </p>
              <p style={{ margin: "5px 0", color: "#666", fontSize: "13px" }}>
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Company Name Section */}
      <div style={{ margin: "20px 0" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          Company Name (Optional):
        </label>
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="e.g., Google, Microsoft, Amazon..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "2px solid #ccc",
            fontFamily: "inherit",
            fontSize: "14px",
            transition: "border-color 0.2s",
            outline: "none"
          }}
          onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
          onBlur={(e) => e.target.style.borderColor = "#ccc"}
        />
        {company && (
          <p style={{ 
            fontSize: "12px", 
            color: "#666", 
            marginTop: "5px",
            fontStyle: "italic" 
          }}>
            PDF will be named: {(() => {
              const capitalize = (str) => {
                return str.split(/\s+/).map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join("_");
              };
              return `Firstname_Lastname_${capitalize(company)}.pdf`;
            })()}
          </p>
        )}
      </div>

      {/* Job Description Section */}
      <div style={{ margin: "20px 0" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          Job Description:
        </label>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          rows={10}
          placeholder="Paste the complete job description here..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "2px solid #ccc",
            fontFamily: "inherit",
            fontSize: "14px",
            resize: "vertical",
            transition: "border-color 0.2s",
            outline: "none"
          }}
          onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
          onBlur={(e) => e.target.style.borderColor = "#ccc"}
        />
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={generatePDF}
          disabled={disable}
          onMouseEnter={e => {
            if (!disable) e.currentTarget.style.background = "#45a049";
          }}
          onMouseLeave={e => {
            if (!disable) e.currentTarget.style.background = "#4CAF50";
          }}
          style={{
            background: disable ? "#9e9e9e" : "#4CAF50",
            color: "#fff",
            border: "none",
            padding: "14px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            cursor: disable ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            opacity: disable ? 0.8 : 1,
            width: "100%",
            marginTop: "10px"
          }}
        >
          {disable ? '⏳ Generating Tailored Resume...' : '🚀 Generate Tailored Resume PDF'}
        </button>
      </div>

      {disable && (
        <div style={{
          marginTop: "15px",
          padding: "12px",
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#856404",
          textAlign: "center"
        }}>
          ⚡ This may take 30-90 seconds. Please wait...
        </div>
      )}
    </div>
  );
}
