import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BeautifulParticles, { GradientOrbs } from "../components/BeautifulParticles";
import { BeautifulProgressBar } from "../components/BeautifulLoader";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/rtf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function BeautifulAdvancedUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (file) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "File type not supported. Please upload PDF, Word, or text files.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size too large. Please upload files smaller than 10MB.";
    }
    return null;
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        for (const file of validFiles) {
          await uploadFile(file);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

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

      const uploadResponse = await axios.post("http://localhost:5000/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResponse.data.success) {
        const uploadedFile = {
          id: uploadResponse.data.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          filePath: uploadResponse.data.data?.filePath,
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);

        // Get AI analysis
        if (uploadedFile.filePath) {
          try {
            const analysisResponse = await axios.post("http://localhost:5000/documents/simplify", {
              filePath: uploadedFile.filePath,
            });

            if (analysisResponse.data.success) {
              setAnalysisResult({
                ...uploadedFile,
                simplifiedText: analysisResponse.data.output,
                analysisDate: new Date().toISOString(),
              });
              setShowAnalysis(true);
            }
          } catch (analysisError) {
            console.error("Analysis error:", analysisError);
            setAnalysisResult({
              ...uploadedFile,
              simplifiedText: "Analysis failed, but file uploaded successfully!",
              analysisDate: new Date().toISOString(),
            });
            setShowAnalysis(true);
          }
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (analysisResult && analysisResult.id === fileId) {
      setAnalysisResult(null);
      setShowAnalysis(false);
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
      <BeautifulParticles count={60} speed={0.5} />

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Advanced Analysis</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 pb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Document Analysis
            </h2>
            <p className="text-white/80 text-lg">
              Drag & drop your legal documents for AI-powered analysis and simplification
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? "border-blue-400 bg-blue-500/20 scale-105"
                  : "border-white/30 hover:border-white/50 hover:scale-102"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {isDragging ? "Drop files here" : "Drag & drop files here"}
                  </h3>
                  <p className="text-white/70 text-lg mb-4">
                    or click to browse files
                  </p>
                  <p className="text-white/50 text-sm">
                    Supports PDF, Word, and text files up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <BeautifulProgressBar 
                  progress={uploadProgress} 
                  text="Processing your documents..." 
                />
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Uploaded Files</span>
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{file.name}</p>
                        <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {showAnalysis && analysisResult && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Analysis Results</h3>
                    <p className="text-white/60 text-sm">Document: {analysisResult.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Simplified Text */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Simplified Text</span>
                  </h4>
                  <div className="bg-black/20 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed">
                      {analysisResult.simplifiedText}
                    </pre>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                  <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Key Takeaways</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Document simplified for better understanding</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Legal terms replaced with plain language</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Please consult a lawyer for legal advice</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span>This simplified version is for general understanding only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
