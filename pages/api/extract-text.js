import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple text extraction - NO AI needed (instant, free)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.resume;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = Array.isArray(uploadedFile) ? uploadedFile[0].filepath : uploadedFile.filepath;

    // Extract text from PDF (no AI, just simple parsing)
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    // Clean up
    fs.unlinkSync(filePath);

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ 
        error: "Could not extract text from PDF" 
      });
    }

    // Extract name for filename (simple regex)
    const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l);
    const name = lines[0] || "Resume"; // First non-empty line is usually the name

    // Return raw text only (instant, no AI processing)
    return res.status(200).json({
      success: true,
      text: resumeText,
      name: name
    });

  } catch (error) {
    console.error("Text extraction error:", error);
    return res.status(500).json({ 
      error: "Failed to extract text", 
      details: error.message 
    });
  }
}

