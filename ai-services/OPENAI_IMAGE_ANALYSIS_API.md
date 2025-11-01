# OpenAI Image Analysis API Documentation

## Overview
This API provides image analysis capabilities using OpenAI's Vision API (GPT-4o) for analyzing medical/health-related images, particularly for the Pulse Summary feature.

## Base URL
```
http://localhost:8085/api/openai
```

## Prerequisites

### 1. Set OpenAI API Key
You need to set your OpenAI API key as an environment variable:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your-openai-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-openai-api-key-here
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Update Maven Dependencies
The following dependencies have been added to `pom.xml`:
- OpenAI GPT-3 Java Client (v0.18.2)
- Jackson Databind (JSON processing)
- Apache Commons Codec (Base64 encoding)

Run:
```bash
mvn clean install
```

## API Endpoints

### 1. Analyze Single Image
Analyze a single uploaded image with optional custom prompt.

**Endpoint:** `POST /api/openai/analyze-image`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `image` (required): Image file (JPEG, PNG, etc.)
  - `prompt` (optional): Custom analysis prompt

**Example using cURL:**
```bash
curl -X POST http://localhost:8085/api/openai/analyze-image \
  -F "image=@pulse_reading.jpg" \
  -F "prompt=Analyze this pulse oximeter reading and extract all vital signs"
```

**Example using JavaScript (Frontend):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('prompt', 'Analyze this health monitor image');

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
  "timestamp": "Sat Oct 25 11:47:00 IST 2025"
}
```

### 2. Analyze Multiple Images
Analyze multiple images together for comprehensive analysis.

**Endpoint:** `POST /api/openai/analyze-multiple-images`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `images` (required): Array of image files
  - `prompt` (optional): Custom analysis prompt

**Example using JavaScript:**
```javascript
const formData = new FormData();
imageFiles.forEach(file => {
  formData.append('images', file);
});
formData.append('prompt', 'Compare these health readings over time');

const response = await fetch('http://localhost:8085/api/openai/analyze-multiple-images', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Response:**
```json
{
  "success": true,
  "analysis": "Comparing the three images:\n1. First reading (morning): HR 68, SpO2 97%\n2. Second reading (afternoon): HR 75, SpO2 98%\n3. Third reading (evening): HR 72, SpO2 96%\nAll readings are normal with slight variations throughout the day.",
  "imageCount": 3,
  "timestamp": "Sat Oct 25 11:47:00 IST 2025"
}
```

### 3. Extract Health Metrics
Specialized endpoint to extract structured health metrics from an image.

**Endpoint:** `POST /api/openai/extract-metrics`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `image` (required): Image file containing health metrics

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:8085/api/openai/extract-metrics', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.metrics);
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "raw_analysis": "Heart Rate: 72 BPM\nSpO2: 98%\nBlood Pressure: 120/80 mmHg\nTemperature: 98.6°F",
    "timestamp": "Sat Oct 25 11:47:00 IST 2025"
  },
  "fileName": "vitals.jpg"
}
```

### 4. Health Check
Check if the OpenAI service is running and configured.

**Endpoint:** `GET /api/openai/health`

**Response:**
```json
{
  "status": "OpenAI Service is running",
  "configured": true
}
```

If not configured:
```json
{
  "status": "OpenAI Service is running",
  "configured": false,
  "message": "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
}
```

### 5. Test Upload
Test endpoint to verify image upload functionality.

**Endpoint:** `POST /api/openai/test-upload`

**Response:**
```json
{
  "success": true,
  "fileName": "test.jpg",
  "fileSize": 123456,
  "contentType": "image/jpeg",
  "message": "Image uploaded successfully"
}
```

## Error Responses

### Missing API Key
```json
{
  "error": "OpenAI API is not configured. Please set OPENAI_API_KEY environment variable."
}
```
Status Code: 503 Service Unavailable

### Invalid File Type
```json
{
  "error": "File must be an image"
}
```
Status Code: 400 Bad Request

### Analysis Failed
```json
{
  "success": false,
  "error": "Failed to analyze image: [error details]"
}
```
Status Code: 500 Internal Server Error

## Frontend Integration Example

### React Component for Pulse Summary Page

```javascript
import React, { useState } from 'react';

const PulseSummaryImageAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', 'Analyze this pulse oximeter or vital signs reading and extract all measurements');

    try {
      const response = await fetch('http://localhost:8085/api/openai/analyze-image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setAnalysis('Error: ' + result.error);
      }
    } catch (error) {
      setAnalysis('Error analyzing image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pulse Summary - Image Analysis</h2>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload}
        className="mb-4"
      />
      
      <button 
        onClick={analyzeImage}
        disabled={!selectedImage || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Analysis Result:</h3>
          <p className="whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default PulseSummaryImageAnalysis;
```

## Configuration

### application.properties
```properties
# OpenAI Configuration
openai.api.key=${OPENAI_API_KEY:your-api-key-here}
openai.api.model=gpt-4o
openai.api.vision.model=gpt-4o
openai.api.max.tokens=1000

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

## File Size Limits
- Maximum file size: 10MB
- Maximum request size: 10MB

## Best Practices

1. **Image Quality**: Use clear, well-lit images for best results
2. **Custom Prompts**: Provide specific prompts for more accurate analysis
3. **Error Handling**: Always handle potential errors in your frontend code
4. **API Key Security**: Never expose your API key in frontend code
5. **Rate Limiting**: Be mindful of OpenAI API rate limits

## Troubleshooting

### Issue: "OpenAI API is not configured"
**Solution:** Set the OPENAI_API_KEY environment variable before starting the service.

### Issue: "File too large"
**Solution:** Compress the image or increase the file size limit in application.properties.

### Issue: "CORS error"
**Solution:** Verify that your frontend URL (http://localhost:5173) is included in the CORS configuration.

## Cost Considerations

OpenAI Vision API pricing (as of 2024):
- GPT-4o: ~$0.01 per image analysis
- Monitor your usage through the OpenAI dashboard

## Support

For issues or questions:
1. Check the health endpoint: `GET /api/openai/health`
2. Review application logs
3. Verify API key configuration
4. Test with the test-upload endpoint first
