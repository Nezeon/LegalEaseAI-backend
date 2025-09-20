const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");
const upload = require("../middleware/upload");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const COLLECTION = "documents";

// Check if Firebase is available
const db = admin.apps.length > 0 ? admin.firestore() : null;

function sanitizeFileMeta(file) {
  return {
    fileName: file.filename,
    originalName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    filePath: file.path,
    status: "uploaded",
    uploadedAt: new Date().toISOString(),
  };
}

// File upload route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const docData = sanitizeFileMeta(req.file);
    
    if (db) {
      // Use Firebase if available
      const docRef = await db.collection(COLLECTION).add(docData);
      return res.status(201).json({ success: true, id: docRef.id, data: docData });
    } else {
      // Fallback to local storage
      const id = `local-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const localData = { id, ...docData };
      
      // Save to local metadata file
      const metadataFile = path.join(__dirname, "..", "uploads", "metadata.json");
      let metadata = [];
      if (fs.existsSync(metadataFile)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        } catch (e) {
          metadata = [];
        }
      }
      metadata.push(localData);
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
      
      return res.status(201).json({ success: true, id, data: localData });
    }
  } catch (err) {
    console.error("Error uploading doc:", err);
    return res.status(500).json({ success: false, message: "Failed to upload document" });
  }
});

module.exports = router;
 
// Simplify document route using Python script
router.post("/simplify", async (req, res) => {
  try {
    const { filePath: inputFilePath, text } = req.body || {};

    if (!inputFilePath && !text) {
      return res.status(400).json({ success: false, message: "Provide filePath or text" });
    }

    // If raw text is provided, write it to a temporary file so the Python script can read it
    let tempFilePath = inputFilePath;
    let isTemp = false;
    if (!tempFilePath && text) {
      const tempDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      tempFilePath = path.join(tempDir, `temp_${Date.now()}.txt`);
      fs.writeFileSync(tempFilePath, text, { encoding: "utf-8" });
      isTemp = true;
    }

    const scriptPath = path.join(__dirname, "..", "scripts", "simple_legal_simplifier.py");
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ success: false, message: "Simplifier script not found" });
    }

    const pythonExe = process.env.PYTHON_PATH || "python";

    const child = spawn(pythonExe, [scriptPath], {
      cwd: path.join(__dirname, "..", "scripts"),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      console.error("Failed to start Python process:", err);
    });

    child.on("close", (code) => {
      console.log("Python script finished with code:", code);
      console.log("Python stdout:", stdout);
      console.log("Python stderr:", stderr);
      
      if (isTemp && tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (_) {}
      }
      if (code !== 0) {
        return res.status(500).json({ success: false, message: "Simplification failed", error: stderr || stdout });
      }
      return res.status(200).json({ success: true, output: stdout });
    });

    // Send the file path to the Python script via stdin for its input() prompt
    console.log("Sending file path to Python script:", tempFilePath);
    // Convert to absolute path if it's relative
    const absolutePath = path.isAbsolute(tempFilePath) ? tempFilePath : path.resolve(tempFilePath);
    child.stdin.write(`${absolutePath}\n`);
    child.stdin.end();
  } catch (err) {
    console.error("Error simplifying doc:", err);
    return res.status(500).json({ success: false, message: "Failed to simplify document" });
  }
});
