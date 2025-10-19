import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
//import chromium from "@sparticuz/chromium";
//import puppeteer from "puppeteer-core";

import puppeteer from "puppeteer";
import OpenAI from "openai";
import { parse } from "jsonc-parser";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Handlebars helpers ---
Handlebars.registerHelper("join", function (array, separator) {
  if (Array.isArray(array)) {
    return array.join(separator);
  }
  // If it's a string, return as-is (for empty defaults like "")
  return typeof array === 'string' ? array : "";
});

Handlebars.registerHelper("formatKey", function (key) {
  if (!key) return "";
  const words = key.split("_").map(word => {
    if (["ai", "ml", "nlp", "ci", "cd"].includes(word.toLowerCase())) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return words.join(" ");
});

// --- Robust JSON parse ---
function robustJsonParse(text) {
  try {
    return parse(text);
  } catch (err) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI did not return valid JSON.");
  }
}

// --- Call OpenAI with timeout & retries ---
async function callOpenAI(prompt, retries = 2, timeoutMs = 90000) {
  while (retries > 0) {
    try {
      return await Promise.race([
        openai.chat.completions.create({
          model: process.env.OPENAI_VERSION,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("OpenAI request timed out")), timeoutMs)
        )
      ]);
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { selected, resumeJson: providedResumeJson, jd, company } = req.body;
    if (!jd) return res.status(400).send("Job description required");

    // Get resume JSON - either from provided JSON or load from file
    let resumeJson;
    if (providedResumeJson) {
      // New flow: Resume JSON provided directly (from PDF upload)
      resumeJson = providedResumeJson;
    } else if (selected) {
      // Old flow: Load from file
      const resumePath = path.join(process.cwd(), "resumes", `${selected}.json`);
      resumeJson = JSON.parse(fs.readFileSync(resumePath, "utf-8"));
    } else {
      return res.status(400).send("Resume JSON or selected resume required");
    }

    // OpenAI prompt
    const prompt = `
You are a world-class professional resume writer, career strategist, and ATS expert. I will provide:  

1. A candidate’s **existing resume in JSON format**.  
2. A **job description (JD)** for a specific role.  

Your task is to **create a completely new resume** in JSON format that is **fully tailored to the JD**, using the existing resume only as a source of factual information (experience, roles, education, dates, locations). Do NOT simply rewrite or paraphrase the old resume—reconstruct the resume from scratch so that it:  

1. **Professional Summary:** Write a new 5–6 line summary that immediately hooks recruiters. Focus on top skills, leadership, domain expertise, and alignment with the JD.  
2. **Skills Section:**  
   - **Start with JD-mentioned technologies** - list exact skills, frameworks, and tools from the job description first.
   - **Show breadth as an experienced engineer** - add related modern technologies that demonstrate adaptability:
     * If JD mentions React → include React ecosystem (Next.js, Redux) PLUS Vue.js or Angular to show frontend versatility
     * If JD mentions Python → include Python stack (FastAPI, Django) PLUS Node.js or Go to show backend breadth
     * If JD mentions AWS → include AWS services PLUS Azure or GCP to show cloud platform knowledge
   - **Include up-to-date, in-demand technologies** (2023-2024) even if not in JD, to show you stay current
   - **Balance depth and breadth**: 60% JD-specific skills, 40% related modern technologies
   - Organize skills logically (Languages, Frontend, Backend, Cloud/DevOps, AI/ML, Databases, Software Practices, Tools & Frameworks, etc.).
   - Aim for 12-18 skills per category:
     * 7-10 skills directly from JD or closely related
     * 5-8 skills showing broader expertise and modern stack knowledge
   - For senior roles: emphasize architecture patterns, system design, and leadership tools
   - Show you're not just experienced in JD tech, but have the foundation to quickly learn related technologies.
3. **Experience Section:**  
   - Each job must have **7–8 very long, detailed, results-driven bullets**.  
   - Bullets must show measurable outcomes, business impact, and technical leadership.  
   - Emphasize **JD keywords and required skills**: technologies, frameworks, cloud, AI/ML, automation, security, performance, scalability, mentoring, CI/CD, serverless, APIs, etc.  
   - I want to make my experience with 8 sentences related to backend, frontend, db optimization, AI integration, testing, Cloud, CI/CD, Agile methodology for each company.
   - The tech stack of each company must be aligned with something widely used in that period.
   - All kinds of experience must be the Metrix method, rich, detailed, and each sentence must have at least 25 words.
   - Include **AI/ML, cloud, and automation achievements** wherever relevant.  
   - Ensure **technology stacks are realistic for the time period** of each role.  
4. **Education Section:** Keep factual details from the original resume unless the JD highlights certifications or degrees.  
5. **ATS Optimization:** Use exact terminology from the JD for skills, technologies, and responsibilities. Avoid listing unrelated or outdated tech unless highly relevant.  
6. **Formatting:** Output **valid JSON only**, maintaining the same structure as the original resume. Do NOT include any extra text outside JSON.  
7. **Key Difference:** This must result in a **fully new resume**, not just a rewritten version. Every section (summary, skills, experience) must be reconstructed to **maximize alignment with the JD** and **showcase measurable impact**.  

**Input:**  
Resume JSON: ${JSON.stringify(resumeJson)}
Job Description: ${jd}


**Output:**  
Return the **fully new, ATS-optimized resume JSON**, including:  
- A brand-new professional summary aligned with the JD that showcases versatility (populate the empty "summary" field)
- A balanced skills section (12-18 per category): 60% JD-specific + 40% related modern tech to show breadth and adaptability
  * IMPORTANT: Skills must be returned as ARRAYS of strings, not empty strings
  * Example: "Frontend": ["React", "Next.js", "TypeScript"] NOT "Frontend": ""
- Each job rewritten with **7–8 long, detailed bullets** (populate empty "details" arrays)
- Full alignment with JD, measurable achievements, and optimized for ATS
- Make resume human-written, technical, ATS-friendly and B2 English level
- Showcase deep expertise in JD tech while demonstrating ability to work with related technologies and modern frameworks
- Return valid JSON with skills as arrays, summary as string, and experience details as arrays of strings
`;

    const aiResponse = await callOpenAI(prompt);
    let aiText = aiResponse.choices[0].message.content;
    aiText = aiText.replace(/```json|```/g, "").trim();
    const tailoredResume = robustJsonParse(aiText);

    // Compile HTML with Handlebars
    // Try to use template matching the selected resume, fallback to generic template
    let templatePath;
    if (selected) {
      templatePath = path.join(process.cwd(), "templates", `${selected}.html`);
      if (!fs.existsSync(templatePath)) {
        // Fallback to first available template
        const templates = fs.readdirSync(path.join(process.cwd(), "templates")).filter(f => f.endsWith(".html"));
        templatePath = path.join(process.cwd(), "templates", templates[0]);
      }
    } else {
      // Use first available template for PDF uploads
      const templates = fs.readdirSync(path.join(process.cwd(), "templates")).filter(f => f.endsWith(".html"));
      templatePath = path.join(process.cwd(), "templates", templates[0]);
    }
    
    const templateHtml = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateHtml);
    const html = template(tailoredResume);

    // Generate PDF
    // For production (Render, Vercel, etc.), use chromium. For local dev, use puppeteer
    const browser = process.env.NODE_ENV === 'production'
      ? await puppeteer.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        })
      : await puppeteer.launch({ headless: "new" });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "13mm", bottom: "7mm", left: "0mm", right: "0mm" },
    });
    await browser.close();

    // Send PDF with proper filename (Firstname_Lastname_Company.pdf or Firstname_Lastname.pdf)
    const capitalize = (str) => {
      return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join("_");
    };
    
    let filename = "Resume.pdf";
    if (tailoredResume.name) {
      const nameParts = tailoredResume.name.trim().split(/\s+/);
      const companyPart = company ? `_${capitalize(company)}` : "";
      
      if (nameParts.length >= 2) {
        const firstName = capitalize(nameParts[0]);
        const lastName = capitalize(nameParts[nameParts.length - 1]);
        filename = `${firstName}_${lastName}${companyPart}.pdf`;
      } else if (nameParts.length === 1) {
        const firstName = capitalize(nameParts[0]);
        filename = `${firstName}${companyPart}.pdf`;
      }
    }
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}`
    );
    res.send(pdfBuffer);

  } catch (err) {
    console.error("PDF generation or AI error:", err);
    res.status(500).send("PDF generation failed: " + err.message);
  }
}