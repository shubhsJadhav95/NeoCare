# Troubleshooting Guide - OpenAI Image Analysis

## Error: 500 Internal Server Error on /api/openai/analyze-image

### Most Common Cause: Missing OpenAI API Key

The 500 error typically occurs when the OpenAI API key is not configured.

### Solution Steps:

#### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)
6. **Important:** Save it securely - you won't see it again!

#### Step 2: Set the API Key as Environment Variable

**Windows PowerShell:**
```powershell
# Set for current session
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"

# Verify it's set
echo $env:OPENAI_API_KEY

# Set permanently (requires restart)
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-actual-api-key-here', 'User')
```

**Windows Command Prompt:**
```cmd
set OPENAI_API_KEY=sk-your-actual-api-key-here
echo %OPENAI_API_KEY%
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-your-actual-api-key-here"
echo $OPENAI_API_KEY
```

#### Step 3: Restart the AI Service

After setting the environment variable, you MUST restart the service:

```bash
# Stop the current service (Ctrl+C if running)

# Navigate to the project
cd ai-services/ai-services

# Restart the service
mvn spring-boot:run
```

#### Step 4: Verify Configuration

Check if the service is configured correctly:

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

**Response if NOT Configured:**
```json
{
  "status": "OpenAI Service is running",
  "configured": false,
  "message": "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
}
```

### Alternative: Set API Key in application.properties (NOT RECOMMENDED for production)

Edit `ai-services/ai-services/src/main/resources/application.properties`:

```properties
openai.api.key=sk-your-actual-api-key-here
```

⚠️ **WARNING:** Never commit API keys to version control! Add to `.gitignore`.

---

## Other Common Errors

### Error: CORS Policy Error

**Symptom:** Browser console shows CORS error

**Solution:** Verify CORS configuration in `application.properties`:
```properties
spring.web.cors.allowed-origins=http://localhost:5173
```

### Error: Connection Refused (Port 8085)

**Symptom:** `Failed to connect to localhost:8085`

**Solution:**
1. Check if AI service is running: `curl http://localhost:8085/api/openai/health`
2. Start the service: `mvn spring-boot:run`
3. Check if port is in use: `netstat -ano | findstr :8085`

### Error: File Too Large

**Symptom:** Error about file size limit

**Solution:** Increase limits in `application.properties`:
```properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
```

### Error: Invalid Image Format

**Symptom:** "File must be an image"

**Solution:** Ensure you're uploading supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

---

## Testing the Setup

### 1. Test Service Health
```bash
curl http://localhost:8085/api/openai/health
```

### 2. Test Image Upload (without analysis)
```powershell
# PowerShell
$imagePath = "C:\path\to\test-image.jpg"
$uri = "http://localhost:8085/api/openai/test-upload"

$form = @{
    image = Get-Item -Path $imagePath
}

Invoke-RestMethod -Uri $uri -Method Post -Form $form
```

### 3. Test Full Analysis
```powershell
# PowerShell
$imagePath = "C:\path\to\test-image.jpg"
$uri = "http://localhost:8085/api/openai/analyze-image"

$form = @{
    image = Get-Item -Path $imagePath
    prompt = "Analyze this image"
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
$response | ConvertTo-Json -Depth 10
```

---

## Checking Logs

### View Spring Boot Logs
The console where you ran `mvn spring-boot:run` will show logs.

**Look for:**
- ✅ `Started AiServicesApplication` - Service started successfully
- ❌ `OpenAI API key not configured` - API key missing
- ❌ `401 Unauthorized` - Invalid API key
- ❌ `429 Too Many Requests` - Rate limit exceeded

### Enable Debug Logging

Add to `application.properties`:
```properties
logging.level.com.neocare.ai_services=DEBUG
logging.level.org.springframework.web=DEBUG
```

---

## Quick Checklist

- [ ] OpenAI API key obtained from platform.openai.com
- [ ] Environment variable `OPENAI_API_KEY` set
- [ ] AI service restarted after setting env variable
- [ ] Health endpoint returns `configured: true`
- [ ] Frontend is running on http://localhost:5173
- [ ] AI service is running on http://localhost:8085
- [ ] CORS is configured for localhost:5173
- [ ] Image file is valid format and under 10MB

---

## Getting Help

### Check Service Status
```bash
# Health check
curl http://localhost:8085/api/openai/health

# Test upload
curl -X POST http://localhost:8085/api/openai/test-upload \
  -F "image=@test.jpg"
```

### Common Issues Summary

| Error | Cause | Solution |
|-------|-------|----------|
| 500 Internal Server Error | Missing API key | Set OPENAI_API_KEY env variable |
| 503 Service Unavailable | API key not configured | Check health endpoint |
| 400 Bad Request | Invalid file | Use supported image format |
| CORS Error | Wrong origin | Update CORS config |
| Connection Refused | Service not running | Start with `mvn spring-boot:run` |

---

## Contact & Resources

- **OpenAI API Docs:** https://platform.openai.com/docs
- **OpenAI Status:** https://status.openai.com/
- **Spring Boot Docs:** https://spring.io/projects/spring-boot

## Cost Monitoring

Monitor your OpenAI usage at: https://platform.openai.com/usage

Set up billing alerts to avoid unexpected charges!
