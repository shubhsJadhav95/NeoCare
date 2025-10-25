import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, RefreshCcw } from "lucide-react";
import { analyzePrescription } from "../services/imageAnalysisService";

export default function PharmaScan() {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    setCameraActive(true);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraActive(false);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    setScanning(false);
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setImageSrc(imageData);
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setScanning(true);
      // Simulate quick scan pulse
      setTimeout(() => setScanning(false), 1200);
    }
  };

  const handleScanPrescription = async () => {
    if (!imageSrc) return;
    setAnalyzing(true);
    setError(null);

    try {
      // Convert data URL or blob URL to File
      let file;
      if (imageSrc.startsWith('data:')) {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        file = new File([blob], 'prescription.png', { type: 'image/png' });
      } else {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        file = new File([blob], 'prescription.jpg', { type: blob.type });
      }

      const result = await analyzePrescription(file);

      if (result.success) {
        sessionStorage.setItem('pharma_scan_result', JSON.stringify({
          analysis: result.analysis,
          prescriptionImage: imageSrc, // Store the image data URL
          timestamp: new Date().toISOString()
        }));
        navigate('/user/pharmascan/medicine');
      } else {
        setError(result.error || 'Failed to analyze prescription');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-center flex items-center gap-2 text-gray-900">
            <Camera className="w-5 h-5 text-teal-600" /> Pharma Scanner
          </h2>
        </div>

        <div className="relative border-2 border-teal-500 rounded-xl overflow-hidden bg-gray-50">
          {!imageSrc && !cameraActive && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Camera className="w-10 h-10 mb-2" />
              <p>Camera preview or uploaded image will appear here</p>
            </div>
          )}

          {cameraActive && (
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
          )}

          {imageSrc && (
            <img src={imageSrc} alt="Prescription Preview" className="w-full h-64 object-cover" />
          )}

          {scanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-4 border-green-500/70 rounded-lg animate-pulse" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-[scan_1.2s_linear_infinite]" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-sm px-3 py-1 rounded-lg">
                Scanning for medication details...
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-5 h-5" /> Scan via Camera
            </button>
          ) : (
            <button
              onClick={captureImage}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <RefreshCcw className="w-5 h-5" /> Capture
            </button>
          )}

          <label className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-5 h-5" /> Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {imageSrc && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleScanPrescription}
              disabled={analyzing}
              className={`px-4 py-2 rounded-xl text-white text-sm ${analyzing ? 'bg-teal-800 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {analyzing ? 'Analyzing...' : 'Scan Prescription'}
            </button>
            <button
              onClick={() => { setImageSrc(null); setScanning(false); setError(null); }}
              disabled={analyzing}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* keyframes for scanning line */}
      <style>{`
        @keyframes scan { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
      `}</style>
    </div>
  );
}
