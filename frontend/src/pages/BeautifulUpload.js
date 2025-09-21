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
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("simplified");
  const [originalText, setOriginalText] = useState(""); // Store original text for comparison
  const [documentType, setDocumentType] = useState("general"); // Document type selection
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
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
      setMessage("✅ File uploaded successfully! Processing with AI...");

      const uploadedFilePath = res.data?.data?.filePath;
      if (uploadedFilePath) {
        try {
          const simpRes = await axios.post("http://localhost:5000/documents/simplify", {
            filePath: uploadedFilePath,
          });
          if (simpRes.data?.success) {
            setSimplified(simpRes.data.output);
            setShowResults(true);
            setMessage("🎉 Document processed successfully!");
          }
        } catch (simplifyError) {
          console.error("Simplification error:", simplifyError);
          setSimplified("Document uploaded successfully! AI processing encountered an error, but your file is safe.");
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed. Please try again.");
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

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) {
      return (
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (['doc', 'docx'].includes(extension)) {
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Beautiful Background */}
      <GradientOrbs />
      <BeautifulParticles count={50} speed={0.4} />

      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quick Upload</h1>
                <p className="text-white/60 text-sm">Simple document analysis</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 pb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mb-6 shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Upload Your Document
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
              Choose your legal document and get instant AI-powered analysis. Our advanced algorithms will simplify complex legal language into clear, understandable terms.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl mb-8">
            <form onSubmit={handleUpload} className="space-y-8">
              {/* Document Type Selection */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">
                  Document Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "general", label: "General", icon: "📄" },
                    { value: "contract", label: "Contract", icon: "📋" },
                    { value: "agreement", label: "Agreement", icon: "🤝" },
                    { value: "policy", label: "Policy", icon: "⚖️" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setDocumentType(type.value)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        documentType === type.value
                          ? "border-green-400 bg-green-500/20 text-white"
                          : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">
                  Choose Document
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    dragActive
                      ? "border-green-400 bg-green-500/20 scale-105"
                      : "border-white/30 hover:border-white/50 hover:scale-102"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="space-y-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      {selectedFile ? getFileIcon(selectedFile.name) : (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <p className="text-white text-xl font-medium mb-2">
                        {selectedFile ? selectedFile.name : "Drop your file here or click to browse"}
                      </p>
                      {selectedFile && (
                        <div className="flex items-center justify-center space-x-4 text-white/60">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          <span>•</span>
                          <span>{selectedFile.type}</span>
                        </div>
                      )}
                      {!selectedFile && (
                        <p className="text-white/60">
                          Supports PDF, Word, and text files up to 10MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-8 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Upload & Analyze"
                )}
              </button>

              {/* Progress Bar */}
              {isUploading && (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <BeautifulProgressBar
                    progress={uploadProgress}
                    text="Processing your document with AI..."
                  />
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`p-6 rounded-3xl border ${
                  message.includes("✅") || message.includes("🎉")
                    ? "bg-green-500/20 border-green-500/30 text-green-300"
                    : message.includes("❌")
                    ? "bg-red-500/20 border-red-500/30 text-red-300"
                    : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                }`}>
                  <div className="flex items-center space-x-3">
                    {message.includes("✅") && <span className="text-2xl">✅</span>}
                    {message.includes("🎉") && <span className="text-2xl">🎉</span>}
                    {message.includes("❌") && <span className="text-2xl">❌</span>}
                    <span className="text-lg">{message}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Results */}
          {showResults && simplified && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">Analysis Results</h3>
                  <p className="text-white/60">AI-powered document simplification completed</p>
                </div>
              </div>

              <div className="flex space-x-1 mb-8 bg-white/5 rounded-2xl p-2 border border-white/10">
                <button
                  onClick={() => setActiveTab("simplified")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "simplified"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Simplified Text</span>
                </button>
                <button
                  onClick={() => setActiveTab("original")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "original"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0 0l-3-3m3 3l3-3m2 16H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Original Text</span>
                </button>
                <button
                  onClick={() => setActiveTab("comparison")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "comparison"
                      ? "bg-pink-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Comparison</span>
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                {activeTab === "simplified" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <h4 className="text-xl font-semibold text-white">Simplified Content</h4>
                      <span className="text-white/50 text-sm ml-auto">Easy to understand</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/20">
                      <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed font-sans">
                        {simplified}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === "original" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <h4 className="text-xl font-semibold text-white">Original Content</h4>
                      <span className="text-white/50 text-sm ml-auto">Complex legal language</span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl p-6 border border-purple-500/20">
                      <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed font-sans opacity-80">
                        {originalText || "Original text not available. The file was processed directly by the AI system."}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === "comparison" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <h4 className="text-xl font-semibold text-white">Side-by-Side Comparison</h4>
                      <span className="text-white/50 text-sm ml-auto">Before vs After</span>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl p-6 border border-purple-500/20">
                        <h5 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Original (Complex)</span>
                        </h5>
                        <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed font-sans">
                            {originalText || "Original text not available"}
                          </pre>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-green-600/10 rounded-2xl p-6 border border-blue-500/20">
                        <h5 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Simplified (Clear)</span>
                        </h5>
                        <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed font-sans">
                            {simplified}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/10">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 16H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Simplified</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl border border-white/20 transition-all duration-300 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share Results</span>
                </button>
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Process Another</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
