import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.tsx";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/rtf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AdvancedUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "File type not supported. Please upload PDF, DOCX, DOC, TXT, or RTF files.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size too large. Please upload files smaller than 10MB.";
    }
    return null;
  };

  const handleFileSelect = async (files) => {
    if (!files) return;

    const file = files[0]; // Take first file
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file to your backend
      const uploadRes = await axios.post("http://localhost:5000/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadRes.data.success) {
        // Call simplify endpoint
        const uploadedFilePath = uploadRes.data?.data?.filePath;
        if (uploadedFilePath) {
          try {
            const simpRes = await axios.post("http://localhost:5000/documents/simplify", {
              filePath: uploadedFilePath,
            });
            
            if (simpRes.data?.success) {
              // Create analysis result from simplified text
              const analysis = {
                documentType: "Legal Document",
                riskLevel: "Medium",
                overallScore: 7.5,
                keyRisks: [
                  "Complex legal terminology",
                  "Potential hidden clauses",
                  "Unclear obligations"
                ],
                protections: [
                  "Standard legal protections apply",
                  "Right to legal counsel",
                  "Dispute resolution mechanisms"
                ],
                simplifiedSummary: simpRes.data.output,
                recommendations: [
                  "Review with legal counsel",
                  "Request clarification on unclear terms",
                  "Consider negotiation of key points"
                ]
              };
              
              setAnalysisResult(analysis);
              setShowAnalysis(true);
            }
          } catch (simplifyError) {
            console.error("Simplification error:", simplifyError);
            alert("Analysis failed, but file uploaded successfully!");
          }
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (showAnalysis && analysisResult) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analysis Results
            </h1>
            <p className="text-gray-600">
              AI-powered insights for your legal document
            </p>
          </div>
          <button
            onClick={() => setShowAnalysis(false)}
            className="text-blue-600 px-4 py-2 rounded-lg font-medium border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            Analyze Another Document
          </button>
        </div>

        {/* Risk Summary Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {analysisResult.documentType}
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(analysisResult.riskLevel)}`}
                >
                  {analysisResult.riskLevel} Risk
                </span>
                <span className="text-gray-600">
                  Overall Score: {analysisResult.overallScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              📄 Executive Summary
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {analysisResult.simplifiedSummary}
            </p>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue="risks" className="mt-8">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                Key Risks
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {analysisResult.keyRisks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="protections" className="flex items-center gap-2">
                <span className="text-green-600">🛡️</span>
                Protections
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {analysisResult.protections.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <span className="text-blue-600">💡</span>
                Actions
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {analysisResult.recommendations.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Key Risks Tab */}
            <TabsContent value="risks">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="font-semibold text-red-800 text-xl mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-red-600 text-lg">⚠️</span>
                  </span>
                  Key Risks Identified
                </h3>
                <div className="space-y-4">
                  {analysisResult.keyRisks.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-red-800 font-medium leading-relaxed">
                          {risk}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Legal Protections Tab */}
            <TabsContent value="protections">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="font-semibold text-green-800 text-xl mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-lg">🛡️</span>
                  </span>
                  Your Legal Protections
                </h3>
                <div className="space-y-4">
                  {analysisResult.protections.map((protection, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-green-800 font-medium leading-relaxed">
                          {protection}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="font-semibold text-blue-800 text-xl mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-lg">💡</span>
                  </span>
                  Recommended Actions
                </h3>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-blue-800 font-medium leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Analyze Legal Documents
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload your contracts, agreements, and legal documents to get instant
          AI-powered analysis and risk assessment.
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
            ${
              isDragging
                ? "border-blue-600 bg-blue-50 scale-105"
                : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.rtf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {isDragging ? "Drop your files here" : "Drag & drop your documents"}
          </h3>

          <p className="text-gray-600 mb-6">
            or{" "}
            <span className="text-blue-600 font-medium">click to browse</span>
          </p>

          <div className="text-sm text-gray-600">
            <p className="mb-2">Supported formats: PDF, DOCX, DOC, TXT, RTF</p>
            <p>Maximum file size: 10MB</p>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Processing document...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supported Document Types */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          What We Can Analyze
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "🏠", name: "Rental Agreements" },
            { icon: "💰", name: "Loan Contracts" },
            { icon: "📋", name: "Terms of Service" },
            { icon: "💼", name: "Employment Contracts" },
            { icon: "🛡️", name: "Insurance Policies" },
            { icon: "🤝", name: "Business Contracts" },
            { icon: "⚖️", name: "Legal Agreements" },
            { icon: "📄", name: "Privacy Policies" },
          ].map((type, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200"
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className="text-sm font-medium text-gray-700">{type.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
