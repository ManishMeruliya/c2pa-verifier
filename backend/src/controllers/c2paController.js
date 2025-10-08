import { extractC2PAData } from "../services/c2paService.js";
import { cleanupFiles } from "../utils/fileUtils.js";

export const verifyImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  console.log("📷 Verifying image:", filePath);

  try {
    const { json, outputPath } = await extractC2PAData(filePath);
    
    cleanupFiles(filePath);
    
    if (outputPath) {
      cleanupFiles(outputPath);
    }
    
    res.json({
      success: true,
      data: json,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    cleanupFiles(filePath);
    res.status(500).json({ 
      success: false,
      error: error?.message || "Failed to verify image",
      timestamp: new Date().toISOString()
    });
  }
};

export const rootStatus = (req, res) => {
  res.json({ message: "✅ C2PA Verifier API is running" });
};
