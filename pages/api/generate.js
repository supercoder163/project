import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Call OpenAI with timeout & retries ---
async function callOpenAI(prompt, retries = 2, timeoutMs = 90000) {
  while (retries > 0) {
    try {
      return await Promise.race([
        openai.chat.completions.create({
          model: process.env.OPENAI_VERSION || "gpt-4o-mini",
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
      console.log(`Retrying... (${retries} attempts left)`);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { resumeText, jd, company } = req.body;

    if (!resumeText) return res.status(400).send("Resume text required");
    if (!jd) return res.status(400).send("Job description required");

    // SINGLE AI CALL: Text + JD → Complete HTML Resume
    const prompt = `
You are a world-class professional resume writer, career strategist, and ATS optimization expert.

I will provide:
1. **Raw resume text** (extracted from PDF)
2. **Job description** for a specific role

Your task: Generate a **COMPLETE HTML RESUME** that is:
- **Fully tailored** to the job description
- **ATS-friendly** (clean structure, keyword-rich, parseable)
- **Recruiter-friendly** (professional, scannable, impactful)
- **Print-ready** (proper margins, page breaks, A4 format)

---

## **HTML STRUCTURE REQUIRED:**

Generate a complete, valid HTML document following this exact structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Candidate Name] - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 0;
      max-width: 100%;
      margin: 0;
    }
    header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #000;
    }
    h1 {
      font-size: 22pt;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .title {
      font-size: 12pt;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }
    .contact {
      font-size: 10pt;
      color: #444;
      line-height: 1.5;
    }
    h2 {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1.5px solid #000;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
    }
    section {
      margin-bottom: 18px;
    }
    .summary {
      text-align: justify;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .skills-category {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .skills-category strong {
      font-weight: 600;
      display: inline;
    }
    .skills-list {
      display: inline;
    }
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
      margin-top: 12px;
    }
    .exp-title {
      font-size: 11.5pt;
      font-weight: bold;
    }
    .exp-dates {
      font-size: 10pt;
      font-style: italic;
      white-space: nowrap;
    }
    .exp-company {
      font-size: 10.5pt;
      font-style: italic;
      margin-bottom: 6px;
      color: #333;
    }
    .exp-details {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    .exp-details li {
      margin-bottom: 5px;
      text-align: justify;
      line-height: 1.4;
    }
    .edu-item {
      margin-bottom: 10px;
    }
    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .edu-degree {
      font-weight: 600;
      font-size: 11pt;
    }
    .edu-dates {
      font-size: 10pt;
      font-style: italic;
    }
    .edu-school {
      font-size: 10.5pt;
      color: #333;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>[CANDIDATE FULL NAME]</h1>
    <div class="title">[Professional Title]</div>
    <div class="contact">
      [Email] • [Phone] • [Location]<br>
      [LinkedIn URL if available]
    </div>
  </header>

  <section>
    <h2>Professional Summary</h2>
    <p class="summary">
      [Write 5-6 lines that immediately hook recruiters. Focus on:
       - Top skills aligned with JD
       - Years of experience and domain expertise
       - Leadership and technical achievements
       - Key technologies from JD
       - Business impact and measurable outcomes]
    </p>
  </section>

  <section>
    <h2>Technical Skills</h2>
    <div class="skills-category">
      <strong>Programming Languages:</strong>
      <span class="skills-list">[JD technologies first, then related languages]</span>
    </div>
    <div class="skills-category">
      <strong>Frontend:</strong>
      <span class="skills-list">[If JD mentions React → React, Next.js, Redux + Vue/Angular for breadth]</span>
    </div>
    <div class="skills-category">
      <strong>Backend:</strong>
      <span class="skills-list">[If JD mentions Node.js → Node.js, Express, NestJS + Python/Go for breadth]</span>
    </div>
    <div class="skills-category">
      <strong>Databases:</strong>
      <span class="skills-list">[JD databases + related ones]</span>
    </div>
    <div class="skills-category">
      <strong>Cloud Platforms:</strong>
      <span class="skills-list">[If JD mentions AWS → AWS services + Azure/GCP for breadth]</span>
    </div>
    <div class="skills-category">
      <strong>DevOps & Infrastructure:</strong>
      <span class="skills-list">[Docker, Kubernetes, CI/CD tools from JD + related]</span>
    </div>
    <div class="skills-category">
      <strong>Testing:</strong>
      <span class="skills-list">[Testing frameworks and methodologies]</span>
    </div>
    <div class="skills-category">
      <strong>Tools & Frameworks:</strong>
      <span class="skills-list">[Development and collaboration tools]</span>
    </div>
    [Add more categories as relevant: AI/ML, Security, Monitoring, etc.]
  </section>

  <section>
    <h2>Professional Experience</h2>
    
    [FOR EACH JOB IN RESUME:]
    <div class="exp-header">
      <div class="exp-title">[Job Title]</div>
      <div class="exp-dates">[Start Date] – [End Date]</div>
    </div>
    <div class="exp-company">[Company Name], [Location]</div>
    <ul class="exp-details">
      <li>[Bullet 1: 25+ words, metrics, JD keywords, business impact]</li>
      <li>[Bullet 2: 25+ words, technical leadership, measurable outcome]</li>
      <li>[Bullet 3: 25+ words, system design, scalability, performance]</li>
      <li>[Bullet 4: 25+ words, AI/ML or automation if relevant to JD]</li>
      <li>[Bullet 5: 25+ words, cloud architecture, cost optimization]</li>
      <li>[Bullet 6: 25+ words, team collaboration, mentoring, agile]</li>
      <li>[Bullet 7: 25+ words, testing, CI/CD, quality assurance]</li>
      <li>[Bullet 8: 25+ words, innovation, problem-solving, JD alignment]</li>
    </ul>
    [REPEAT FOR EACH JOB]
  </section>

  <section>
    <h2>Education & Certifications</h2>
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-degree">[Degree Name]</div>
        <div class="edu-dates">[Start Year] – [End Year]</div>
      </div>
      <div class="edu-school">[School/University Name]</div>
    </div>
    [REPEAT FOR EACH DEGREE/CERTIFICATION]
  </section>
</body>
</html>
\`\`\`

---

## **DETAILED INSTRUCTIONS:**

### **1. Extract Information from Resume Text:**
- Parse name, contact info (email, phone, location, LinkedIn)
- Extract professional title/current role
- Extract all job titles, companies, locations, dates
- Extract education (degrees, schools, years)

### **2. Professional Summary (5-6 lines):**
- Write completely NEW summary tailored to JD
- Start with years of experience + domain expertise
- Highlight top 3-4 skills mentioned in JD
- Include leadership qualities if senior role
- Add measurable business impact
- Use action-oriented language

### **3. Technical Skills Section:**
**Strategy: 60% JD-Specific + 40% Related Modern Tech**

For each category:
- **Start with JD technologies** (exact matches first)
- **Add related modern technologies** (show breadth)
- **Include 12-18 skills per category**
- **Examples:**
  - JD has "React" → Include: React, Next.js, Redux Toolkit, React Query + Vue.js, Angular (versatility)
  - JD has "Python" → Include: Python, FastAPI, Django, Flask + Node.js, Go (backend breadth)
  - JD has "AWS" → Include: AWS (Lambda, ECS, S3, RDS, CloudWatch) + Azure, GCP (cloud knowledge)
  - JD has "PostgreSQL" → Include: PostgreSQL, MySQL + MongoDB, Redis, Elasticsearch (database range)

**Key Categories:**
- Programming Languages
- Frontend (frameworks, libraries, UI)
- Backend (servers, APIs, authentication)
- Databases (SQL, NoSQL, caching)
- Cloud Platforms (AWS, Azure, GCP)
- DevOps & Infrastructure (Docker, K8s, CI/CD)
- Testing (unit, integration, e2e)
- Tools & Frameworks (development, collaboration)
- AI/ML (if relevant to JD)
- Leadership & Collaboration (Agile, mentoring)

### **4. Professional Experience (7-8 bullets per job):**
**Each bullet MUST:**
- Be at least 25 words long
- Include specific metrics (%, numbers, time saved, users, revenue)
- Use JD keywords and technologies
- Show business impact, not just tasks
- Follow pattern: "Action + Technology + Outcome + Metric"

**Cover these areas per job:**
1. Backend development (APIs, services, architecture)
2. Frontend development (UI/UX, components, performance)
3. Database optimization (queries, caching, scaling)
4. AI/ML integration (if relevant to JD or original resume)
5. Testing & Quality (unit/integration/e2e tests, TDD)
6. Cloud & Infrastructure (AWS/Azure/GCP, scaling, cost)
7. CI/CD & DevOps (pipelines, automation, deployments)
8. Agile & Leadership (collaboration, mentoring, code reviews)

**Tech stack must be realistic for time period:**
- 2015-2018: React 15-16, Angular.js, Webpack, jQuery
- 2018-2020: React 16-17, Vue 2, Kubernetes adoption
- 2020-2023: React 18, Next.js 12-13, TypeScript mainstream, Microservices
- 2023-2025: Next.js 14, React Server Components, AI integration, Edge computing

### **5. Education:**
- Keep factual information from original resume
- List degrees, schools, years
- Include certifications if relevant to JD

### **6. ATS Optimization:**
- Use **exact JD terminology** for skills and responsibilities
- Repeat JD keywords naturally throughout experience bullets
- Use standard section headers (Professional Summary, Technical Skills, Professional Experience, Education)
- Keep formatting simple and parseable
- Avoid tables, graphics, or complex layouts

### **7. Quality Standards:**
- Professional tone, B2 English level
- No typos or grammatical errors
- Consistent formatting
- Scannable with clear hierarchy
- Human-written feel (not robotic)

---

## **INPUT DATA:**

**Resume Text:**
${resumeText}

**Job Description:**
${jd}

---

## **OUTPUT:**

Return ONLY the complete HTML document. No markdown code blocks, no extra explanation, just pure HTML starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.

The HTML must be:
- Valid and well-formed
- Ready for PDF conversion
- ATS-optimized
- Fully tailored to the job description
- Professional and impressive
`;

    console.log("Calling OpenAI to generate HTML resume...");
    const aiResponse = await callOpenAI(prompt);
    let html = aiResponse.choices[0].message.content.trim();
    
    // Remove markdown code blocks if AI added them
    html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Validate HTML starts correctly
    if (!html.startsWith("<!DOCTYPE html>") && !html.startsWith("<html")) {
      throw new Error("AI did not return valid HTML");
    }

    console.log("HTML generated successfully, creating PDF...");

    // Generate PDF with Puppeteer
    // Production: Use puppeteer-core with @sparticuz/chromium
    // Local dev: Use regular puppeteer (comes with bundled Chromium)
    const browser = process.env.NODE_ENV === 'production'
      ? await puppeteerCore.launch({
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
      margin: { 
        top: "15mm", 
        bottom: "15mm", 
        left: "15mm", 
        right: "15mm" 
      },
    });
    await browser.close();

    console.log("PDF generated successfully!");

    // Extract name from HTML for filename
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const candidateName = nameMatch ? nameMatch[1].trim() : null;

    // Generate filename: Firstname_Lastname_Company.pdf or Firstname_Lastname.pdf
    const capitalize = (str) => {
      return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join("_");
    };
    
    let filename = "Resume.pdf";
    if (candidateName) {
      const nameParts = candidateName.trim().split(/\s+/);
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
