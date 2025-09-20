import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BeautifulParticles, { GradientOrbs } from "../components/BeautifulParticles";
import { BeautifulProgressBar } from "../components/BeautifulLoader";

export default function BeautifulUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [simplified, setSimplified] = useState("");
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
      setSimplified("");
      setShowResults(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const res = await axios.post("http://localhost:5000/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setMessage(res.data.message || "File uploaded successfully!");

      const uploadedFilePath = res.data?.data?.filePath;
      if (uploadedFilePath) {
        try {
          const simpRes = await axios.post("http://localhost:5000/documents/simplify", {
            filePath: uploadedFilePath,
          });
          if (simpRes.data?.success) {
            setSimplified(simpRes.data.output);
            setShowResults(true);
          }
        } catch (simplifyError) {
          console.error("Simplification error:", simplifyError);
          setSimplified("Simplification failed, but file uploaded successfully!");
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("File upload failed!");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Beautiful Background */}
      <GradientOrbs />
      <BeautifulParticles count={50} speed={0.4} />

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Basic Upload</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 pb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Upload Your Document
            </h2>
            <p className="text-white/80 text-lg">
              Select a legal document to get AI-powered analysis and simplification
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleUpload} className="space-y-8">
              {/* File Input */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">
                  Choose Document
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-colors duration-300 cursor-pointer">
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-lg font-medium">
                          {selectedFile ? selectedFile.name : "Click to select a file"}
                        </p>
                        {selectedFile && (
                          <p className="text-white/60 text-sm mt-2">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUploading ? "Processing..." : "Upload & Analyze"}
              </button>

              {/* Progress Bar */}
              {isUploading && (
                <BeautifulProgressBar 
                  progress={uploadProgress} 
                  text="Processing your document..." 
                />
              )}

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-2xl ${
                  message.includes("success") 
                    ? "bg-green-500/20 border border-green-500/30 text-green-300" 
                    : "bg-red-500/20 border border-red-500/30 text-red-300"
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Results */}
          {showResults && simplified && (
            <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Analysis Results</h3>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Simplified Text</h4>
                <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed">
                    {simplified}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
