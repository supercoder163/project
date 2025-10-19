# 🚀 Deploy to Render.com

This guide will walk you through deploying your AI Resume Tailor to Render.com.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ A [Render.com](https://render.com) account (free tier available)
- ✅ Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ An OpenAI API key from [platform.openai.com](https://platform.openai.com)

---

## 🎯 Quick Deploy

### Option 1: Using render.yaml (Recommended)

Your project already includes a `render.yaml` file for easy deployment.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your repository
   - Render will automatically detect `render.yaml`

3. **Add Environment Variables**
   - In the Render dashboard, go to your service
   - Navigate to **"Environment"** tab
   - Add your `OPENAI_API_KEY`:
     ```
     Key: OPENAI_API_KEY
     Value: sk-your-actual-api-key-here
     ```
   - Click **"Save Changes"**

4. **Deploy!**
   - Render will automatically build and deploy
   - Wait 5-10 minutes for the first deployment
   - Your app will be live at: `https://your-app-name.onrender.com`

---

### Option 2: Manual Setup

If you prefer manual configuration:

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your repository

2. **Configure Service**
   ```
   Name: resume-tailor
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free (or paid for better performance)
   ```

3. **Add Environment Variables**
   ```
   NODE_VERSION = 20.11.0
   OPENAI_API_KEY = sk-your-actual-api-key-here
   OPENAI_VERSION = gpt-4o-mini
   NODE_ENV = production
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy automatically

---

## ⚙️ Configuration Details

### Build Settings

| Setting | Value | Description |
|---------|-------|-------------|
| **Build Command** | `npm install && npm run build` | Installs dependencies and builds Next.js |
| **Start Command** | `npm start` | Starts the production server |
| **Node Version** | `20.11.0` | Required for Next.js 14 |

### Environment Variables

| Variable | Value | Required | Description |
|----------|-------|----------|-------------|
| `OPENAI_API_KEY` | `sk-...` | ✅ Yes | Your OpenAI API key |
| `OPENAI_VERSION` | `gpt-4o-mini` | ✅ Yes | GPT model to use |
| `NODE_ENV` | `production` | ✅ Yes | Set to production mode |
| `NODE_VERSION` | `20.11.0` | ✅ Yes | Node.js version |

---

## 🎨 Post-Deployment Setup

### 1. Verify Deployment

After deployment completes:

- ✅ Visit your Render URL: `https://your-app-name.onrender.com`
- ✅ Test the upload functionality
- ✅ Generate a sample resume to verify PDF generation works

### 2. Custom Domain (Optional)

To use your own domain:

1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `resume-tailor.com`)
3. Update your DNS settings with Render's nameservers
4. Wait for SSL certificate provisioning (automatic)

### 3. Enable Auto-Deploy

Render automatically deploys on every push to your branch.

To disable auto-deploy:
- Go to **Settings** → **Auto-Deploy**
- Toggle off

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails with "Module not found"

**Solution:** Make sure all dependencies are in `package.json`
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

#### 2. PDF Generation Fails

**Error:** `"Failed to launch browser"`

**Solution:** This is already handled! The code uses:
- **Production:** `@sparticuz/chromium` (works on Render)
- **Development:** Regular `puppeteer` (works locally)

If still failing, check logs:
- Go to **Logs** tab in Render dashboard
- Look for Chromium-related errors
- Ensure `puppeteer-core` and `@sparticuz/chromium` are installed

#### 3. OpenAI API Errors

**Error:** `"Invalid API key"`

**Solution:**
- Verify `OPENAI_API_KEY` is set correctly in Environment Variables
- Check for extra spaces or quotes
- Ensure the API key is active at [platform.openai.com](https://platform.openai.com)

#### 4. Request Timeout

**Error:** `"OpenAI request timed out"`

**Solution:**
- Render free tier can be slow on cold starts
- Upgrade to paid plan for better performance
- Or increase timeout in `pages/api/generate.js`:
  ```javascript
  async function callOpenAI(prompt, retries = 2, timeoutMs = 120000) {
    // 120 seconds timeout
  }
  ```

#### 5. Service Goes to Sleep

**Issue:** Free tier services sleep after 15 minutes of inactivity

**Solutions:**
- **Upgrade** to paid plan ($7/month) for always-on service
- **Use UptimeRobot** to ping your service every 10 minutes (keeps it awake)
- **Accept the limitation** - First request after sleep takes ~30 seconds

---

## 💰 Cost Breakdown

### Render.com Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 750 hours/month, sleeps after 15 min inactivity |
| **Starter** | $7/month | Always on, 400 build minutes/month |
| **Standard** | $25/month | More resources, priority support |

### Total Monthly Cost Estimate

| Usage | OpenAI | Render | Total |
|-------|--------|--------|-------|
| Light (10 resumes) | ~$0.20 | $0-7 | **$0.20-7.20** |
| Medium (50 resumes) | ~$1.00 | $7 | **$8.00** |
| Heavy (200 resumes) | ~$4.00 | $7-25 | **$11-29** |

**Recommendation for personal use:** Free Render + gpt-4o-mini = ~$1-2/month

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ **Never** commit `.env` file to Git
- ✅ Store sensitive keys only in Render dashboard
- ✅ Rotate API keys regularly

### 2. Rate Limiting
For public deployments, add rate limiting to prevent abuse:

```javascript
// In pages/api/generate.js
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
};
```

### 3. Domain Security
- ✅ Enable HTTPS (automatic with Render)
- ✅ Set up CORS if needed
- ✅ Use environment-specific API keys

---

## 📊 Monitoring & Logs

### Access Logs

1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. View real-time logs:
   - Build logs
   - Application logs
   - Error logs

### Monitor Performance

Render provides basic metrics:
- **Request count**
- **Response times**
- **Error rates**

For advanced monitoring, integrate:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics

---

## 🚀 Performance Optimization

### 1. Cold Start Mitigation

Free tier services sleep after 15 minutes. To keep warm:

```bash
# Use a cron job or UptimeRobot to ping every 10 minutes
curl https://your-app.onrender.com/
```

### 2. Caching

Add caching headers for static assets (already handled by Next.js)

### 3. Database (If Needed Later)

If you want to save resume history:
- Add PostgreSQL database on Render (free tier available)
- Use Prisma or another ORM
- Store resume versions and history

---

## 🔄 Continuous Deployment

### Automatic Deploys

Render automatically deploys when you push to your branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically builds and deploys
```

### Deploy Hooks

Get a deploy webhook URL:
1. Go to **Settings** → **Deploy Hook**
2. Copy the webhook URL
3. Use in CI/CD or trigger manually:
   ```bash
   curl -X POST https://api.render.com/deploy/srv-xxxxx
   ```

---

## 📱 Testing Your Deployment

### 1. Smoke Test

```bash
# Test the homepage
curl https://your-app.onrender.com/

# Test PDF generation (with valid data)
curl -X POST https://your-app.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"resumeJson": {...}, "jd": "..."}'
```

### 2. Load Testing

For production readiness, test with:
- **k6** - Load testing tool
- **Apache Bench** - Simple load testing
- **Postman** - API testing

---

## 🎯 Production Checklist

Before going live:

- [ ] ✅ All environment variables set
- [ ] ✅ HTTPS enabled (automatic)
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Error monitoring set up
- [ ] ✅ Rate limiting implemented
- [ ] ✅ Tested PDF generation
- [ ] ✅ Tested PDF upload
- [ ] ✅ Verified OpenAI integration
- [ ] ✅ Tested on mobile devices
- [ ] ✅ Set up monitoring/alerts

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Puppeteer on Serverless](https://github.com/Sparticuz/chromium)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## 🆘 Support

If you encounter issues:

1. **Check Render Logs** - Most issues show up here
2. **Render Community** - [community.render.com](https://community.render.com)
3. **Project Issues** - Open an issue on GitHub
4. **Render Support** - Available for paid plans

---

## 🎉 Success!

Your AI Resume Tailor is now live on Render! 🚀

**Share your deployment:**
- Tweet about it with #ResumeTailor
- Add it to your portfolio
- Share with friends looking for jobs

---

<div align="center">

**Happy Deploying! 🎊**

[⬆ Back to Main README](README.md)

</div>

