# Pulse Summary AI Image Analysis - Complete Setup Guide

## 🎯 Overview

This guide will help you set up the AI-powered image analysis feature for the Pulse Summary page at `http://localhost:5173/user/pulsesummery`.

## ✨ Features

- **AI-Powered Image Analysis** using OpenAI GPT-4o Vision
- **Automatic Health Metrics Extraction** from pulse oximeter and vital signs images
- **Beautiful Modal Interface** with loading states and animations
- **Real-time Analysis** with detailed observations
- **Copy to Clipboard** functionality for analysis results
- **Error Handling** with retry mechanism

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up OpenAI API Key

**Option A: Using PowerShell Script (Recommended)**
```powershell
cd ai-services
.\setup-api-key.ps1
```

**Option B: Manual Setup**
```powershell
# Get your API key from https://platform.openai.com/api-keys
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"

# Verify
echo $env:OPENAI_API_KEY
```

### Step 2: Start the AI Service

```bash
cd ai-services/ai-services
mvn spring-boot:run
```

Wait for the message: `Started AiServicesApplication`

### Step 3: Verify Setup

Open a new terminal and test:
```bash
curl http://localhost:8085/api/openai/health
```

Expected response:
```json
{
  "status": "OpenAI Service is running",
  "configured": true
}
```

✅ **You're ready!** Now start your frontend and test the feature.

---

## 📋 Detailed Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 16+ and npm
- OpenAI API account with credits

### Backend Setup

#### 1. Install Dependencies

```bash
cd ai-services/ai-services
mvn clean install
```

This will download:
- OpenAI GPT-3 Java Client (v0.18.2)
- Jackson for JSON processing
- Apache Commons Codec for Base64 encoding

#### 2. Configure OpenAI API Key

**Get Your API Key:**
1. Visit https://platform.openai.com/
2. Sign in or create an account
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Set Environment Variable:**

Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="sk-your-key-here"
```

Windows CMD:
```cmd
set OPENAI_API_KEY=sk-your-key-here
```

Linux/Mac:
```bash
export OPENAI_API_KEY="sk-your-key-here"
```

#### 3. Start the Service

```bash
mvn spring-boot:run
```

The service will start on **port 8085**.

#### 4. Verify Configuration

```bash
# Check health
curl http://localhost:8085/api/openai/health

# Test upload
curl -X POST http://localhost:8085/api/openai/test-upload \
  -F "image=@path/to/test-image.jpg"
```

### Frontend Setup

The frontend code is already integrated! Just make sure:

1. **Frontend is running:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to:** http://localhost:5173/user/pulsesummery

3. **Upload an image** and click **"Analyze with AI"**

---

## 🎨 How to Use

### 1. Upload an Image

- Click **"Browse Files"** or drag & drop an image
- Supported formats: JPEG, PNG, GIF, WebP, BMP
- Maximum size: 10MB

### 2. Analyze the Image

- Click the **"Analyze with AI"** button next to the uploaded image
- A beautiful modal will appear with:
  - Image preview
  - Loading animation
  - AI analysis results

### 3. View Results

The AI will provide:
- Detailed analysis of visible health metrics
- Heart rate (BPM)
- Oxygen saturation (SpO2)
- Blood pressure readings
- Any other visible vital signs
- Observations and recommendations

### 4. Copy or Save Results

- Click **"Copy Analysis"** to copy to clipboard
- Use the results in your health records

---

## 🔧 API Endpoints

### Base URL
```
http://localhost:8085/api/openai
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze-image` | Analyze single image |
| POST | `/analyze-multiple-images` | Analyze multiple images |
| POST | `/extract-metrics` | Extract structured metrics |
| GET | `/health` | Check service status |
| POST | `/test-upload` | Test file upload |

### Example: Analyze Image

**Request:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('prompt', 'Analyze this pulse oximeter reading');

const response = await fetch('http://localhost:8085/api/openai/analyze-image', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.analysis);
```

**Response:**
```json
{
  "success": true,
  "analysis": "This image shows a pulse oximeter reading with the following measurements:\n- Heart Rate: 72 BPM\n- Oxygen Saturation (SpO2): 98%\n- Pulse Strength: Good\nThese readings are within normal ranges for a healthy adult.",
  "fileName": "pulse_reading.jpg",
  "fileSize": 245678,
  "timestamp": "Sat Oct 25 11:58:00 IST 2025"
}
```

---

## 🐛 Troubleshooting

### Error: 500 Internal Server Error

**Cause:** OpenAI API key not configured

**Solution:**
1. Set the environment variable: `$env:OPENAI_API_KEY="sk-your-key"`
2. Restart the AI service
3. Verify with: `curl http://localhost:8085/api/openai/health`

### Error: CORS Policy

**Cause:** Frontend URL not in CORS configuration

**Solution:** Check `application.properties`:
```properties
spring.web.cors.allowed-origins=http://localhost:5173
```

### Error: Connection Refused

**Cause:** AI service not running

**Solution:**
```bash
cd ai-services/ai-services
mvn spring-boot:run
```

### Error: File Too Large

**Solution:** Compress image or increase limit in `application.properties`:
```properties
spring.servlet.multipart.max-file-size=20MB
```

For more troubleshooting, see: `ai-services/TROUBLESHOOTING.md`

---

## 📁 File Structure

```
NeoCare/
├── ai-services/
│   ├── ai-services/
│   │   ├── src/main/java/com/neocare/ai_services/
│   │   │   ├── controller/
│   │   │   │   └── OpenAIController.java ✨ NEW
│   │   │   ├── service/
│   │   │   │   └── OpenAIService.java ✨ NEW
│   │   │   └── dto/
│   │   │       ├── ImageAnalysisRequest.java ✨ NEW
│   │   │       └── ImageAnalysisResponse.java ✨ NEW
│   │   └── src/main/resources/
│   │       └── application.properties (updated)
│   ├── SETUP_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   └── setup-api-key.ps1 ✨ NEW
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── PulseSummery.jsx (updated) ✨
    │   └── services/
    │       └── imageAnalysisService.js ✨ NEW
    └── package.json
```

---

## 💰 Cost Information

**OpenAI GPT-4o Vision Pricing:**
- ~$0.01 per image analysis
- 100 images/day ≈ $1/day
- 1000 images/month ≈ $10/month

**Monitor Usage:**
- Dashboard: https://platform.openai.com/usage
- Set up billing alerts to avoid surprises

---

## 🎯 Testing Checklist

- [ ] OpenAI API key obtained and set
- [ ] AI service starts without errors
- [ ] Health endpoint returns `configured: true`
- [ ] Frontend running on http://localhost:5173
- [ ] Can upload images to Pulse Summary page
- [ ] "Analyze with AI" button appears
- [ ] Modal opens with loading animation
- [ ] Analysis results display correctly
- [ ] Can copy results to clipboard
- [ ] Error handling works (try without API key)

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Set up billing alerts** on OpenAI dashboard
4. **Monitor API usage** regularly
5. **Rotate API keys** periodically
6. **Use HTTPS** in production

---

## 📚 Additional Resources

- **OpenAI API Documentation:** https://platform.openai.com/docs
- **Spring Boot Documentation:** https://spring.io/projects/spring-boot
- **React Documentation:** https://react.dev/
- **Framer Motion:** https://www.framer.com/motion/

---

## 🎉 What's Next?

After successful setup, you can:

1. **Customize Analysis Prompts** in `PulseSummery.jsx`
2. **Add More Analysis Types** (e.g., ECG, X-rays)
3. **Store Analysis History** in a database
4. **Export Results** as PDF
5. **Compare Multiple Readings** over time
6. **Add Voice Input** for hands-free operation

---

## 📞 Support

If you encounter issues:

1. Check the **TROUBLESHOOTING.md** file
2. Review the **logs** in the terminal
3. Test with the **health endpoint**
4. Verify **API key** is set correctly
5. Check **OpenAI status**: https://status.openai.com/

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ AI service starts on port 8085
2. ✅ Health endpoint shows `configured: true`
3. ✅ Frontend loads without errors
4. ✅ Image upload works
5. ✅ AI analysis modal appears
6. ✅ Results display with detailed analysis
7. ✅ No errors in browser console

---

**Last Updated:** October 25, 2025  
**Status:** ✅ Ready for Use  
**Version:** 1.0.0
