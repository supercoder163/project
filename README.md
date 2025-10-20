# 🎯 AI Resume Tailor

An intelligent, AI-powered resume tailoring system that automatically customizes your resume for specific job descriptions and generates professional, ATS-friendly PDF outputs.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991)](https://openai.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

### 🤖 AI-Powered Resume Tailoring
- **Single AI Call Optimization**: Streamlined workflow - text extraction + AI generation in one step
- **Intelligent Content Generation**: Uses OpenAI GPT-4o to generate complete HTML resumes
- **ATS Optimization**: Automatically includes keywords and phrases from job descriptions
- **Skills Matching**: Balances JD-specific skills (60%) with related modern technologies (40%)
- **Experience Enhancement**: Generates 7-8 detailed, results-driven bullet points per position
- **Professional Summaries**: Creates compelling 5-6 line summaries tailored to each role

### 📄 PDF Processing & Generation
- **Direct PDF-to-Resume Pipeline**: Upload PDF → Extract text → Generate HTML → Create PDF
- **No Intermediate JSON**: Direct HTML generation for faster processing
- **Professional Design**: Clean, ATS-friendly format optimized for applicant tracking systems
- **Drag & Drop Interface**: Simple, intuitive file upload experience
- **Fast Generation**: Generate tailored PDFs in 30-45 seconds (50% faster!)

### 💼 Smart Filename Management
- **Automatic Naming**: Files named as `Firstname_Lastname_Company.pdf`
- **Proper Capitalization**: Professional formatting with title case
- **Company Integration**: Optional company name in filename for easy organization

### 🎨 User Experience
- **Single-Page Workflow**: Upload PDF → Add job description → Generate tailored resume
- **Real-time Feedback**: Visual indicators for file upload and processing status
- **No Pre-configuration**: Works instantly with any resume PDF

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher)
- **npm** (comes with Node.js)
- **OpenAI API Key** (sign up at [platform.openai.com](https://platform.openai.com))

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/resume-tailor.git
cd resume-tailor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_VERSION=gpt-4o-mini
```

**OpenAI Model Options:**

| Model | Speed | Quality | Cost per Resume | Best For |
|-------|-------|---------|----------------|----------|
| `gpt-4o-mini` | ⚡ Fast | ✅ Good | $0.01-0.02 | Most users |
| `gpt-4o` | ⏱️ Medium | ⭐ Excellent | $0.03-0.05 | High quality |
| `gpt-4-turbo` | 🐌 Slow | 🌟 Best | $0.05-0.10 | Premium quality |

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Usage

### Quick Start (3 Simple Steps)

1. **Upload Your Resume**
   - Drag and drop your PDF resume, or click to browse
   - The system will extract your contact info and work history

2. **Add Job Details**
   - Enter the company name (optional, for filename)
   - Paste the complete job description

3. **Generate Tailored Resume**
   - Click "Generate Tailored Resume PDF"
   - Wait 30-45 seconds for AI processing
   - Your customized resume downloads automatically

### Example Workflow

```
📄 Upload: John_Doe_Resume.pdf
🏢 Company: Google (optional)
📋 Job Description: [Paste full JD]
⬇️ Download: John_Doe_Google.pdf
```

---

## 🏗️ Project Structure

```
resume-tailor/
├── pages/
│   ├── index.js              # Main UI - Upload & generate
│   └── api/
│       ├── generate.js       # AI-powered HTML generation + PDF creation
│       └── extract-text.js   # PDF text extraction (no AI)
├── .env                      # Environment variables (create this)
├── .gitignore
├── package.json
└── README.md
```

**Note:** This project uses direct HTML generation from AI - no templates or JSON intermediates needed!

---

## 📊 How It Works

### The Streamlined Pipeline

```
PDF Upload → Extract Text (instant) → AI: Text + JD → HTML → Puppeteer → PDF Download
                                         ↓
                                    Single AI Call
                                    (30-45 seconds)
```

### What Happens Under the Hood

1. **Text Extraction** (Instant, No AI)
   - Uses `pdf-parse` library to extract raw text from your PDF
   - Identifies name, contact info, job history structure
   - No cost, takes < 1 second

2. **AI Generation** (Single Call, 30-45 seconds)
   - Sends resume text + job description to OpenAI
   - AI analyzes JD and generates complete HTML resume in one step:
     * Extracts contact information
     * Writes tailored 5-6 line professional summary
     * Creates skills section (60% JD + 40% related tech)
     * Rewrites experience with 7-8 detailed bullets per job
     * Includes education and certifications
   - Returns complete, styled HTML document

3. **PDF Generation** (5-10 seconds)
   - Puppeteer renders HTML to PDF
   - Professional, ATS-friendly formatting
   - Automatic filename: `Firstname_Lastname_Company.pdf`

### Why This is Better

✅ **50% Faster**: Single AI call instead of two  
✅ **50% Cheaper**: Half the API calls  
✅ **Simpler**: No JSON intermediate, no templates  
✅ **Same Quality**: Full ATS optimization maintained  
✅ **More Flexible**: AI controls entire layout

---

## 🎨 How AI Generates Your Resume

### Direct HTML Generation

Instead of using templates or JSON intermediates, the AI generates a **complete, styled HTML document** directly from your resume text and job description.

### The AI Prompt Strategy

The AI receives:
- Your **resume text** (extracted from PDF)
- The **job description**
- A **detailed HTML structure template** with:
  - Professional CSS styling (ATS-friendly)
  - Section organization guidelines
  - Content generation instructions

### What Gets Generated

**1. Header Section**
- Candidate name, title, contact info
- Clean, centered layout

**2. Professional Summary**
- 5-6 lines tailored to JD
- Keywords and domain expertise highlighted

**3. Technical Skills**
- Organized by category (Languages, Frontend, Backend, Cloud, etc.)
- 60% JD-specific + 40% related modern tech
- 12-18 skills per category

**4. Professional Experience**
- Each job: 7-8 detailed bullets (25+ words each)
- Metrics, business impact, JD keywords
- Realistic tech stacks for time periods

**5. Education & Certifications**
- Degrees, schools, years
- Relevant certifications

### Output Quality

✅ **ATS-Friendly**: Standard structure, parseable HTML  
✅ **Professional**: Calibri/Arial fonts, proper spacing  
✅ **Print-Ready**: A4 format, optimized margins  
✅ **Keyword-Rich**: JD terminology throughout

---

## 🎨 Customizing Resume Design

### Default Design Features
- ✅ Clean, professional layout
- ✅ ATS-friendly (no colors, standard fonts)
- ✅ Optimized spacing for 1-2 pages
- ✅ Calibri/Arial fonts (industry standard)
- ✅ Clear section hierarchy

### How to Customize

The AI generates HTML based on the structure in `pages/api/generate.js` (lines 45-250).

**To modify the design**, edit the CSS in the prompt:

```javascript
// In pages/api/generate.js, find the HTML template in the prompt

// Change fonts
body {
  font-family: "Georgia", "Times New Roman", serif;  // Professional serif
}

// Adjust spacing
.exp-details {
  margin-left: 20px;  // More indentation
}

// Customize headers
h2 {
  font-size: 14pt;  // Larger headers
  border-bottom: 2px solid #333;  // Thicker border
}

// Modify colors (use sparingly for ATS)
h1 {
  color: #1a1a1a;  // Dark gray instead of black
}
```

**Pro Tip**: Keep changes minimal to maintain ATS compatibility!

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes | `sk-proj-...` |
| `OPENAI_VERSION` | GPT model to use | ✅ Yes | `gpt-4o-mini` |

### Timeout Settings

Adjust AI request timeout in `pages/api/generate.js`:

```javascript
// Line 41: Increase timeout for slower models
async function callOpenAI(prompt, retries = 2, timeoutMs = 90000) {
  // 90000ms = 90 seconds
}
```

### PDF Margins

Customize PDF margins in `pages/api/generate.js`:

```javascript
// Line 182
const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "13mm", bottom: "7mm", left: "0mm", right: "0mm" },
});
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "PDF generation failed" | Missing API key | Check `.env` file exists with valid `OPENAI_API_KEY` |
| "Request timed out" | Slow model or complex resume | Use `gpt-4o-mini` or increase timeout |
| PDF text not extracting | Scanned/image PDF | Use text-based PDF, not scanned images |
| Skills show as empty | Template mismatch | Skills populated during generation, not in base JSON |
| Port 3000 in use | Another app using port | Stop other Node processes or change port |

### Debug Mode

Enable detailed logging:

```javascript
// In pages/api/generate.js
console.log("Resume JSON:", resumeJson);
console.log("AI Response:", aiText);
```

### Testing OpenAI Connection

```bash
# Test your API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 🚀 Production Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` and `OPENAI_VERSION`

4. **Done!**
   - Your app is live at `https://your-project.vercel.app`

### Other Deployment Options

- **Netlify**: Similar to Vercel, supports Next.js
- **AWS Amplify**: Full-stack deployment with AWS services
- **Docker**: Containerize with included Chromium for PDF generation
- **Traditional Hosting**: Build with `npm run build` and deploy static files

---

## 💰 Cost Estimates

With the **new optimized workflow** (single AI call):

| Usage | Model | Monthly Cost* | Per Resume | vs Old Method |
|-------|-------|--------------|------------|---------------|
| 10 resumes/month | gpt-4o-mini | ~$0.15 | $0.015 | **50% cheaper** |
| 50 resumes/month | gpt-4o-mini | ~$0.75 | $0.015 | **50% cheaper** |
| 10 resumes/month | gpt-4o | ~$0.25 | $0.025 | **50% cheaper** |
| 50 resumes/month | gpt-4o | ~$1.25 | $0.025 | **50% cheaper** |

*Estimates based on average resume complexity

**Cost Breakdown:**
- Old method: 2 AI calls (parse + tailor)
- New method: 1 AI call (direct generation)
- **Result: Half the API costs!** 💰

---

## 🛡️ Security & Privacy

### Data Handling
- ✅ **No Data Storage**: Resume data is processed in-memory only
- ✅ **Secure API Keys**: Environment variables never exposed to browser
- ✅ **Server-side Processing**: All AI calls happen on the server
- ✅ **HTTPS Only**: Use HTTPS in production for encrypted transmission

### Best Practices
1. Never commit `.env` file to version control
2. Rotate API keys regularly
3. Set up rate limiting for public deployments
4. Use environment-specific API keys (dev/prod)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Development Setup

```bash
# Fork the repository
git clone https://github.com/yourusername/resume-tailor.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push and create a Pull Request
git push origin feature/amazing-feature
```

### Code Style
- Use ES6+ syntax
- Follow existing code formatting
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |

---

## 🔗 Tech Stack

### Frontend
- **Next.js 14.1.0** - React framework with API routes
- **React 18.2.0** - UI library
- **Vanilla CSS** - No external styling libraries

### Backend
- **Node.js 20.x** - JavaScript runtime
- **OpenAI API** - GPT-4o for AI processing
- **Puppeteer Core** - Headless browser for PDF generation
- **Chromium** - Browser engine for rendering

### Libraries
- **Handlebars** - HTML templating for PDFs
- **pdf-parse** - Extract text from PDF files
- **formidable** - Handle file uploads
- **jsonc-parser** - Parse JSON with comments

---

## 📖 Documentation

### API Endpoints

#### `POST /api/extract-text`
Extracts raw text from PDF resume (no AI, instant).

**Request:**
- Content-Type: `multipart/form-data`
- Body: `resume` (PDF file)

**Response:**
```json
{
  "success": true,
  "text": "Full resume text...",
  "name": "Candidate Name"
}
```

**Time:** < 1 second  
**Cost:** Free (no AI)

---

#### `POST /api/generate`
Generates tailored resume PDF from text.

**Request:**
```json
{
  "resumeText": "Raw resume text from PDF",
  "jd": "Job description text",
  "company": "Company name (optional)"
}
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=Firstname_Lastname_Company.pdf`
- PDF file download

**Time:** 30-45 seconds  
**Cost:** ~$0.015-0.025 per resume

**What It Does:**
1. Sends text + JD to OpenAI
2. AI generates complete HTML resume
3. Puppeteer renders HTML to PDF
4. Returns PDF with proper filename

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Puppeteer Documentation](https://pptr.dev/)
- [Handlebars Guide](https://handlebarsjs.com/guide/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for providing powerful GPT models
- Next.js team for the excellent framework
- The open-source community for amazing tools

---

## 📧 Support

For support, questions, or feedback:

- **Issues**: [GitHub Issues](https://github.com/yourusername/resume-tailor/issues)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Multiple template options
- [ ] Resume history and versioning
- [ ] Batch processing for multiple jobs
- [ ] Custom skill category management
- [ ] LinkedIn profile import
- [ ] Cover letter generation
- [ ] A/B testing for different versions
- [ ] Resume scoring and suggestions

### Future Ideas
- [ ] Browser extension
- [ ] Mobile app
- [ ] Integration with job boards
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

## ⭐ Show Your Support

If this project helped you land your dream job, please consider:

- ⭐ **Starring** the repository
- 🐛 **Reporting** bugs and issues
- 💡 **Suggesting** new features
- 🤝 **Contributing** code improvements
- 📢 **Sharing** with friends and colleagues

---

<div align="center">

**Built with ❤️ for job seekers everywhere**

[⬆ back to top](#-ai-resume-tailor)

</div>

