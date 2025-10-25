import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/openai';

/**
 * Analyze a single uploaded image using OpenAI Vision API
 * @param {File} imageFile - The image file to analyze
 * @param {string} prompt - Optional custom prompt for analysis
 * @returns {Promise} - Analysis result
 */
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

/**
 * Translate arbitrary text to a target language using backend
 * @param {string} text - Source text
 * @param {string} targetLang - 'en' | 'hi' | 'mr'
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/translate`, { text, targetLang });
    return response.data?.translatedText || text;
  } catch (error) {
    // Graceful fallback to original text on error
    return text;
  }
};

/**
 * Analyze prescription image for medication extraction
 * @param {File} imageFile - The prescription image file
 * @returns {Promise} - Analysis result with medications
 */
export const analyzePrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post('http://localhost:8085/api/pharma/analyze-prescription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to analyze prescription');
  }
};

/**
 * Extract health metrics from an uploaded image
 * @param {File} imageFile - The image file containing health metrics
 * @returns {Promise} - Extracted metrics
 */
export const extractHealthMetrics = async (imageFile) => {
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

/**
 * Analyze multiple images together
 * @param {File[]} imageFiles - Array of image files to analyze
 * @param {string} prompt - Optional custom prompt for analysis
 * @returns {Promise} - Analysis result
 */
export const analyzeMultipleImages = async (imageFiles, prompt = '') => {
  const formData = new FormData();
  
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  if (prompt) {
    formData.append('prompt', prompt);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-multiple-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to analyze images');
  }
};

/**
 * Check if the OpenAI service is running and configured
 * @returns {Promise} - Service health status
 */
export const checkServiceHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Service unavailable');
  }
};

/**
 * Test image upload functionality
 * @param {File} imageFile - The image file to test
 * @returns {Promise} - Upload test result
 */
export const testImageUpload = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/test-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Upload test failed');
  }
};
