import React, { useState } from "react";
import axios from "axios";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [simplified, setSimplified] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(res.data.message || "File uploaded successfully!");

      // After upload, call simplify on the saved file path
      const uploadedFilePath = res.data?.data?.filePath;
      if (uploadedFilePath) {
        try {
          const simpRes = await axios.post("http://localhost:5000/documents/simplify", {
            filePath: uploadedFilePath,
          });
          if (simpRes.data?.success) {
            setSimplified(simpRes.data.output);
          }
        } catch (simplifyError) {
          console.error("Simplification error:", simplifyError);
          setSimplified("Simplification failed, but file uploaded successfully!");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("File upload failed!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Document</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
      {simplified && (
        <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
          <h3>Simplified Text</h3>
          <hr />
          <p>{simplified}</p>
        </div>
      )}
    </div>
  );
}
