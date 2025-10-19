import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the uploaded file
    const form = formidable({ multiples: false });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.resume;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    // Get the file path (formidable v3 uses array, v2 uses object)
    const filePath = Array.isArray(uploadedFile) ? uploadedFile[0].filepath : uploadedFile.filepath;

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: "Could not extract text from PDF. Please ensure it's a text-based PDF, not a scanned image." });
    }

    // Use OpenAI to convert text to structured JSON
    const prompt = `
You are an expert resume parser. Extract information from the following resume text and convert it to a structured JSON format.

**Required JSON Structure:**
{
  "name": "Full Name",
  "title": "Job Title/Professional Title",
  "email": "email@example.com",
  "phone": "Phone number",
  "location": "City, State/Country",
  "linkedin": "LinkedIn URL (if available)",
  "website": "Personal website URL (if available)",
  "summary": "",
  "skills": {
    "Programming Languages": ["JavaScript (ES6+)", "TypeScript"],
    "Frontend": ["React", "Next.js (including React Server Components, App Router, SSR/SSG)", "Micro-frontends", "Webpack Module Federation", "Single-SPA", "Tailwind CSS", "SCSS", "Styled Components", "CSS Modules", "Redux Toolkit", "Zustand", "Recoil", "Apollo Client", "Material UI", "Radix UI", "Storybook", "WebAssembly integrations", "PWAs", "container queries", "AI-assisted UX"],
    "Backend": ["Node.js (12–20)", "Express.js", "Fastify", "NestJS", "REST APIs", "GraphQL (Apollo Server, Yoga, Mercurius)", "gRPC (grpc-node)", "Kafka", "NATS", "RabbitMQ", "JWT", "OAuth2", "OpenID Connect", "Auth0", "Passport.js"],
    "Databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Elasticsearch"],
    "Testing": ["Jest", "Mocha/Chai", "Supertest", "Pact (contract testing)", "React Testing Library", "Cypress", "Playwright", "RSpec", "Postman", "unit/integration/e2e tests", "TDD", "BDD"],
    "Cloud Platforms": ["AWS (EKS, Lambda, ECS, S3, RDS, CloudWatch, API Gateway)", "Azure (AKS, Cosmos DB, Functions)", "GCP (Cloud Run, Pub/Sub, Firestore)", "Vercel"],
    "DevOps & Infrastructure": ["Docker", "Kubernetes", "Terraform", "Pulumi", "GitHub Actions", "GitLab CI/CD", "Azure DevOps", "Jenkins", "ArgoCD", "GitOps pipelines", "feature flags (LaunchDarkly, Unleash)", "canary/blue-green deployments"],
    "Development Tools": ["ESLint", "Prettier", "Husky", "Lerna", "NX monorepos", "Storybook"],
    "Observability & Monitoring": ["OpenTelemetry", "Winston", "Pino", "Prometheus", "Grafana"],
    "Workflow Automation": ["n8n", "Zapier integration"],
    "Leadership & Collaboration": ["Agile/Scrum", "Jira", "Confluence", "Code Reviews", "Mentorship", "Sprint Planning", "Roadmap Shaping"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "start_date": "Month Year",
      "end_date": "Month Year or Present",
      "details": []
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School/University Name",
      "start_year": "Year",
      "end_year": "Year or empty string"
    }
  ]
}

**Instructions:**
1. Extract the candidate's name, contact info, and professional title
2. Leave "summary" as empty string "" - it will be generated later by AI
3. **IMPORTANT: Use the EXACT skills structure shown above with all the default arrays - DO NOT extract or modify skills from the resume**
4. Extract all work experience with job titles, companies, dates, but leave "details" as empty array []
5. Extract education and certifications with factual information
6. Preserve all dates in "Month Year" or "Year" format
7. If information is missing, use empty string "" but don't omit fields
8. **DO NOT parse or extract skills from the resume text - use the predefined structure exactly as shown**
9. Return ONLY valid JSON, no other text

**Resume Text:**
${resumeText}

**Output:** Return only the JSON object, no markdown code blocks or extra text.
`;

    const aiResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_VERSION || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower temperature for more accurate extraction
    });

    let jsonText = aiResponse.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse to verify it's valid JSON
    const resumeJson = JSON.parse(jsonText);

    // Return the parsed JSON
    return res.status(200).json({
      success: true,
      data: resumeJson,
      message: "Resume parsed successfully"
    });

  } catch (error) {
    console.error("PDF parsing error:", error);
    return res.status(500).json({ 
      error: "Failed to parse resume", 
      details: error.message 
    });
  }
}

