import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import pulseSummeryLogo from '../assets/images/pulsesummery.png';
import { analyzeImage, analyzeMultipleImages, extractHealthMetrics } from '../services/imageAnalysisService';

const PulseSummery = () => {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={pulseSummeryLogo}
                alt="PulseSummery Logo"
                className="object-contain w-24 h-24 sm:w-36 sm:h-36"
              />
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">PulseSummery – Advanced Health Monitoring</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                    </svg>
                    Online
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Medical Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="container mx-auto px-4 py-8"
      >
        <MedicalUpload />
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-gray-900 text-white py-8 mt-16"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src={pulseSummeryLogo}
              alt="PulseSummery"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold">PulseSummery</span>
          </div>
          <p className="text-gray-400">
            Advanced health monitoring for a healthier tomorrow
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

function MedicalUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedImageForAnalysis, setSelectedImageForAnalysis] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const progressTimers = useRef({});
  const [queueViewer, setQueueViewer] = useState({ open: false, item: null });

  const startProgress = (ids) => {
    ids.forEach((id) => {
      if (progressTimers.current[id]) return;
      progressTimers.current[id] = setInterval(() => {
        setFiles((prev) => prev.map((f) => {
          if (f.id !== id) return f;
          const inc = Math.floor(Math.random() * 5) + 1; // 1-5%
          const next = Math.min(90, (f.progress || 0) + inc);
          return { ...f, progress: next };
        }));
      }, 200);
    });
  };

  const completeProgress = (ids) => {
    ids.forEach((id) => {
      if (progressTimers.current[id]) {
        clearInterval(progressTimers.current[id]);
        delete progressTimers.current[id];
      }
    });
    setFiles((prev) => prev.map((f) => ids.includes(f.id) ? { ...f, progress: 100 } : f));
  };

  // Per-patient upload history
  const [history, setHistory] = useState([]);
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const historyKey = `upload_history_${currentUser?.id || currentUser?._id || currentUser?.email || 'guest'}`;

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });


  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(historyKey);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  };

  const appendToHistory = (entries) => {
    try {
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; }
      })();
      const updated = [...entries, ...existing].slice(0, 50); // keep most recent 50
      localStorage.setItem(historyKey, JSON.stringify(updated));
      setHistory(updated);
    } catch {}
  };

  React.useEffect(() => { loadHistory(); }, []);

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      id: URL.createObjectURL(file),
      progress: 0
    }));
    setFiles(prev => [...prev, ...selectedFiles]);

    const time = new Date().toISOString();
    Promise.all(selectedFiles.map(async (sf) => ({
      name: sf.file.name,
      size: sf.file.size,
      type: sf.file.type,
      addedAt: time,
      preview: await readFileAsDataURL(sf.file)
    })) ).then(entries => appendToHistory(entries));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      id: URL.createObjectURL(file),
      progress: 0
    }));
    setFiles(prev => [...prev, ...droppedFiles]);

    const time = new Date().toISOString();
    Promise.all(droppedFiles.map(async (df) => ({
      name: df.file.name,
      size: df.file.size,
      type: df.file.type,
      addedAt: time,
      preview: await readFileAsDataURL(df.file)
    })) ).then(entries => appendToHistory(entries));
  };

  const startUpload = () => {
    alert("Uploading files... (implement your API here)");
  };

  const handleAnalyzeImage = async (fileObj) => {
    setSelectedImageForAnalysis(fileObj);
    setShowAnalysisModal(true);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    // start progress animation for this file
    startProgress([fileObj.id]);

    try {
      const result = await analyzeImage(
        fileObj.file,
        'Analyze this pulse oximeter or vital signs reading. Extract all measurements including heart rate, SpO2, blood pressure, and any other visible health metrics. Provide detailed observations.'
      );
      
      if (result.success) {
        setAnalysisResult(result);
      } else {
        setAnalysisError(result.error || 'Analysis failed');
      }
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      completeProgress([fileObj.id]);
      setIsAnalyzing(false);
    }
  };

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
    setSelectedImageForAnalysis(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAnalyzeMultipleImages = async () => {
    if (!files || files.length === 0) {
      alert('Please add at least one image first');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const ids = files.map(f => f.id);
    startProgress(ids);

    try {
      const imageFiles = files.map(f => f.file);
      const result = await analyzeMultipleImages(
        imageFiles,
        'Analyze these medical images together. Extract all visible measurements including heart rate, SpO2, blood pressure, temperature, and any other health metrics. Provide a concise combined summary.'
      );
      if (result.success) {
        setAnalysisResult(result);
        try {
          sessionStorage.setItem('pulse_report', JSON.stringify(result));
        } catch (e) {}
        navigate('/user/pulsesummery/report');
      } else {
        setAnalysisError(result.error || 'Analysis failed');
      }
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      completeProgress(ids);
      setIsAnalyzing(false);
    }
  };

  const cancelAll = () => {
    setFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Medical Images</h2>

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-400 p-16 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-blue-500"
      >
        <p className="text-gray-500 mb-2">Drag & Drop Medical Images Here</p>
        <p className="text-gray-400 mb-4">or Click to Browse</p>
        <input
          type="file"
          multiple
          accept=".dcm,.dicom,.svs,.png,.jpg,.jpeg,.pdf"
          onChange={handleFiles}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
          Browse Files
        </label>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Upload Queue & Details</h3>
          <div className="space-y-2">
            {files.map((f, index) => (
              <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={f.id}
                      alt={f.file.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div>
                      <p className="font-medium">{f.file.name}</p>
                      <p className="text-sm text-gray-500">Size: {(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-gray-600 text-sm mb-1">{Math.min(100, f.progress || 0)}%</p>
                    <div className="w-28 h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded transition-all duration-200 ease-linear"
                        style={{ width: `${Math.min(100, f.progress || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setQueueViewer({ open: true, item: f })}
                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History (per patient) */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Upload History</h3>
        {history && history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map((h, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-white flex items-center gap-3">
                <img src={h.preview} alt={h.name} className="w-16 h-16 object-cover rounded border" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.name}</p>
                  <p className="text-xs text-gray-500">{(h.size/1024).toFixed(2)} KB • {h.type || 'file'} • {new Date(h.addedAt).toLocaleString()}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => {
                      const next = history.filter((_, i) => i !== idx);
                      setHistory(next);
                      try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch {}
                    }} className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No previous uploads found for this patient.</p>
        )}
      </div>


      {/* Bottom Actions (simple color buttons) */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={handleAnalyzeMultipleImages}
          disabled={files.length === 0 || isAnalyzing}
          className={`px-4 py-2 rounded ${files.length === 0 || isAnalyzing ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Report Summary'}
        </button>
        <button onClick={cancelAll} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors">
          Cancel All
        </button>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysisModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeAnalysisModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header removed intentionally to avoid provider mentions */}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Image Preview */}
              {selectedImageForAnalysis && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Uploaded Image</h4>
                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={selectedImageForAnalysis.id}
                      alt={selectedImageForAnalysis.file.name}
                      className="w-48 h-48 object-contain rounded-lg border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedImageForAnalysis.file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Size: {(selectedImageForAnalysis.file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {selectedImageForAnalysis.file.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <SparklesIcon className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="mt-6 text-lg font-semibold text-gray-700">Analyzing image with AI...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </div>
              )}

              {/* Error State */}
              {analysisError && !isAnalyzing && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Analysis Failed</h4>
                      <p className="text-red-700">{analysisError}</p>
                      <button
                        onClick={() => selectedImageForAnalysis && handleAnalyzeImage(selectedImageForAnalysis)}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {analysisResult && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Analysis Complete</h4>
                      <p className="text-sm text-green-700">AI has successfully analyzed your image</p>
                    </div>
                  </div>

                  {/* Analysis Result */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-purple-600" />
                      Analysis Results
                    </h4>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                        {analysisResult.analysis}
                      </pre>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500">File Name</p>
                      <p className="font-medium text-gray-900 mt-1">{analysisResult.fileName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500">File Size</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {(analysisResult.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                      <p className="text-sm text-gray-500">Analysis Time</p>
                      <p className="font-medium text-gray-900 mt-1">{analysisResult.timestamp}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysisResult.analysis);
                        alert('Analysis copied to clipboard!');
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Copy Analysis
                    </button>
                    <button
                      onClick={closeAnalysisModal}
                      className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default PulseSummery;
