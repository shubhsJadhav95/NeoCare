# OpenAI Service Diagnostic Guide

## ✅ Enhanced Logging Added

The OpenAIController now includes detailed logging to help diagnose issues:

### What Gets Logged:
- Number of files received
- Each file's name, size, and content type
- Filtering results (valid images vs rejected files)
- API key configuration status
- Full stack traces for all errors
- Success/failure of OpenAI API calls

### Where to See Logs:
Check your Spring Boot console where you ran `mvn spring-boot:run`

---

## 🔍 Step-by-Step Diagnostic Process

### Step 1: Check Service Health

```bash
curl http://localhost:8085/api/openai/health
```

**Expected Response (Configured):**
```json
{
  "status": "OpenAI Service is running",
  "configured": true
}
```

**If `configured: false`:**
- Your OPENAI_API_KEY is not set
- Set it: `$env:OPENAI_API_KEY="sk-your-key"`
- Restart backend: `mvn spring-boot:run`

---

### Step 2: Test File Upload (No Analysis)

```bash
curl -X POST http://localhost:8085/api/openai/test-upload \
  -F "image=@test.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "fileName": "test.jpg",
  "fileSize": 123456,
  "contentType": "image/jpeg",
  "message": "Image uploaded successfully"
}
```

**If this fails:**
- File upload configuration issue
- Check `spring.servlet.multipart.enabled=true` in application.properties

---

### Step 3: Test Single Image Analysis

```bash
curl -X POST http://localhost:8085/api/openai/analyze-image \
  -F "image=@test.jpg" \
  -F "prompt=Describe this image"
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": "This image shows...",
  "fileName": "test.jpg",
  "fileSize": 123456,
  "timestamp": "..."
}
```

---

### Step 4: Test Multiple Image Analysis

```bash
curl -X POST http://localhost:8085/api/openai/analyze-multiple-images \
  -F "images=@test1.jpg" \
  -F "images=@test2.jpg" \
  -F "prompt=Analyze these images"
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": "These images show...",
  "fileName": "2 images",
  "fileSize": 246912,
  "timestamp": "..."
}
```

---

## 🐛 Common Error Scenarios

### Error 1: 400 Bad Request - "At least one image is required"

**Cause:** Frontend sending wrong field name

**Check:**
```javascript
// ❌ WRONG
formData.append('image', file);  // singular

// ✅ CORRECT
formData.append('images', file); // plural
```

**Backend Logs Will Show:**
```
Number of files received: 0
No images provided in request
```

---

### Error 2: 400 Bad Request - "No valid image files found"

**Cause:** Uploading non-image files (e.g., PDFs)

**Backend Logs Will Show:**
```
File 0: name=document.pdf, size=123456, type=application/pdf
Valid image files after filtering: 0
No valid image files found after filtering
```

**Solution:** Only upload image files (JPEG, PNG, GIF, WebP)

---

### Error 3: 503 Service Unavailable - "OpenAI API key not configured"

**Cause:** OPENAI_API_KEY environment variable not set

**Backend Logs Will Show:**
```
OpenAI service is not configured - API key missing
```

**Solution:**
```powershell
$env:OPENAI_API_KEY="sk-your-key"
# Restart backend
```

---

### Error 4: 500 Internal Server Error - IOException

**Possible Causes:**

#### A. Invalid/Expired API Key
**Backend Logs Will Show:**
```
IOException during image analysis
OpenAI API error (401 Unauthorized): Incorrect API key provided
```

**Solution:** Rotate your API key at https://platform.openai.com/api-keys

#### B. Rate Limit Exceeded
**Backend Logs Will Show:**
```
IOException during image analysis
OpenAI API error (429 Too Many Requests): Rate limit exceeded
```

**Solution:** Wait or upgrade OpenAI plan

#### C. Network/Connectivity Issue
**Backend Logs Will Show:**
```
IOException during image analysis
Error calling OpenAI API: Connection refused
```

**Solution:** Check internet connection, firewall, or proxy settings

#### D. File Too Large
**Backend Logs Will Show:**
```
IOException during image analysis
Error calling OpenAI API: Request entity too large
```

**Solution:** 
- Compress images
- OpenAI has a 20MB limit per image
- Your backend has 10MB limit (configurable in application.properties)

---

### Error 5: 500 Internal Server Error - NullPointerException

**Cause:** OpenAIService not autowired properly

**Backend Logs Will Show:**
```
Unexpected error during image analysis
java.lang.NullPointerException: Cannot invoke "OpenAIService.analyzeMultipleImages(...)"
```

**Solution:** 
- Ensure `@Service` annotation on OpenAIService
- Ensure `@Autowired` on controller field
- Run `mvn clean install` and restart

---

## 📋 Complete Diagnostic Checklist

Run through this checklist in order:

- [ ] Backend running on port 8085
- [ ] Health endpoint returns `configured: true`
- [ ] Test upload endpoint works
- [ ] Single image analysis works
- [ ] Multiple image analysis works
- [ ] Frontend sends correct field name (`images`)
- [ ] Frontend sends multipart/form-data (not JSON)
- [ ] Only image files uploaded (no PDFs for analysis)
- [ ] API key is valid and not expired
- [ ] No rate limits exceeded
- [ ] Network connectivity to OpenAI API

---

## 🔬 Reading the Logs

### Successful Request Logs:
```
=== Analyze Multiple Images Request ===
Number of files received: 2
Prompt: Analyze these medical images...
File 0: name=pulse1.jpg, size=245678, type=image/jpeg
File 1: name=pulse2.jpg, size=198765, type=image/jpeg
Valid image files after filtering: 2
Calling OpenAI service to analyze 2 images
Analysis completed successfully
```

### Failed Request Logs (API Key Missing):
```
=== Analyze Multiple Images Request ===
Number of files received: 2
Prompt: Analyze these medical images...
File 0: name=pulse1.jpg, size=245678, type=image/jpeg
File 1: name=pulse2.jpg, size=198765, type=image/jpeg
Valid image files after filtering: 2
OpenAI service is not configured - API key missing
```

### Failed Request Logs (Invalid API Key):
```
=== Analyze Multiple Images Request ===
Number of files received: 2
...
Calling OpenAI service to analyze 2 images
IOException during image analysis
java.io.IOException: OpenAI API error (401 Unauthorized): Incorrect API key provided
    at com.neocare.ai_services.service.OpenAIService.callOpenAIAPI(...)
    ...
```

---

## 🚀 Quick Fix Commands

### Restart Backend with Logging
```bash
cd ai-services/ai-services
mvn clean install
mvn spring-boot:run
```

### Set API Key (PowerShell)
```powershell
$env:OPENAI_API_KEY="sk-your-new-key"
```

### Test All Endpoints
```bash
# Health
curl http://localhost:8085/api/openai/health

# Test upload
curl -X POST http://localhost:8085/api/openai/test-upload -F "image=@test.jpg"

# Single analysis
curl -X POST http://localhost:8085/api/openai/analyze-image -F "image=@test.jpg"

# Multiple analysis
curl -X POST http://localhost:8085/api/openai/analyze-multiple-images -F "images=@test1.jpg" -F "images=@test2.jpg"
```

---

## 📞 Getting More Help

If you still see errors after following this guide:

1. **Copy the full error from backend console**
2. **Copy the Response body from browser DevTools → Network tab**
3. **Share both** for targeted diagnosis

The enhanced logging will show exactly where the failure occurs.

---

**Last Updated:** October 25, 2025  
**Status:** Enhanced logging active
