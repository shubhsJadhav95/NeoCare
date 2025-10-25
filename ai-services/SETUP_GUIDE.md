# OpenAI Image Analysis Setup Guide

## Quick Start

### Step 1: Install Dependencies
```bash
cd ai-services/ai-services
mvn clean install
```

### Step 2: Set OpenAI API Key

**Option A: Environment Variable (Recommended)**

Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"
```

Windows Command Prompt:
```cmd
set OPENAI_API_KEY=sk-your-actual-api-key-here
```

Linux/Mac:
```bash
export OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Option B: Update application.properties**
Edit `src/main/resources/application.properties`:
```properties
openai.api.key=sk-your-actual-api-key-here
```
⚠️ **Warning:** Don't commit API keys to version control!

### Step 3: Start the Service
```bash
mvn spring-boot:run
```

The service will start on port 8085.

### Step 4: Verify Setup

**Check Health:**
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

**Test Image Upload:**
```bash
curl -X POST http://localhost:8085/api/openai/test-upload \
  -F "image=@/path/to/test-image.jpg"
```

### Step 5: Test Image Analysis

Create a test file `test-analysis.sh` (Linux/Mac) or `test-analysis.ps1` (Windows):

**PowerShell (Windows):**
```powershell
$imagePath = "C:\path\to\your\image.jpg"
$uri = "http://localhost:8085/api/openai/analyze-image"

$form = @{
    image = Get-Item -Path $imagePath
    prompt = "Analyze this medical image and extract all visible measurements"
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
$response | ConvertTo-Json -Depth 10
```

**Bash (Linux/Mac):**
```bash
curl -X POST http://localhost:8085/api/openai/analyze-image \
  -F "image=@/path/to/image.jpg" \
  -F "prompt=Analyze this medical image" \
  | jq '.'
```

## Integration with Frontend (Pulse Summary Page)

### Update Your React Component

1. **Install Axios (if not already installed):**
```bash
cd frontend
npm install axios
```

2. **Create API Service:**

Create `frontend/src/services/imageAnalysisService.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/openai';

export const analyzeImage = async (imageFile, prompt = '') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (prompt) {
    formData.append('prompt', prompt);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to analyze image');
  }
};

export const extractMetrics = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/extract-metrics`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to extract metrics');
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Service unavailable');
  }
};
```

3. **Use in Your Component:**

```javascript
import React, { useState } from 'react';
import { analyzeImage, extractMetrics } from '../services/imageAnalysisService';

const PulseSummary = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(
        selectedImage,
        'Analyze this pulse oximeter or vital signs reading. Extract all measurements including heart rate, SpO2, and any other visible health metrics.'
      );
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractMetrics = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await extractMetrics(selectedImage);
      
      if (result.success) {
        setAnalysis(result.metrics.raw_analysis);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pulse Summary - AI Image Analysis</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Health Monitor Image</h2>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        {selectedImage && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selected: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>

          <button
            onClick={handleExtractMetrics}
            disabled={!selectedImage || loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Extracting...' : 'Extract Metrics'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-800">Analysis Result:</h3>
          <div className="whitespace-pre-wrap text-gray-800 bg-white p-4 rounded">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default PulseSummary;
```

## Troubleshooting

### Maven Build Errors
```bash
# Clean and rebuild
mvn clean install -U

# Skip tests if needed
mvn clean install -DskipTests
```

### Port Already in Use
If port 8085 is already in use, update `application.properties`:
```properties
server.port=8086
```

### CORS Issues
Ensure your frontend URL is in the CORS configuration:
```properties
spring.web.cors.allowed-origins=http://localhost:5173
```

### API Key Issues
- Verify the API key starts with `sk-`
- Check it's set correctly: `echo $OPENAI_API_KEY` (Linux/Mac) or `echo %OPENAI_API_KEY%` (Windows)
- Restart the service after setting the environment variable

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Start the AI service
3. ✅ Test with health endpoint
4. ✅ Integrate with frontend
5. 📝 Add error handling
6. 📝 Implement loading states
7. 📝 Add result visualization
8. 📝 Store analysis history (optional)

## Getting OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and save it securely (you won't see it again!)

## Cost Estimation

- GPT-4o Vision: ~$0.01 per image
- For 100 images/day: ~$1/day or ~$30/month
- Monitor usage at: https://platform.openai.com/usage
