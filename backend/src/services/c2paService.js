import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { ensureC2PAToolAvailable } from "../utils/c2paInstaller.js";

const execAsync = promisify(exec);

// Function to get the c2patool binary path
const getC2PAToolPath = () => {
  // 1) Explicit env override
  if (process.env.C2PATOOL_PATH && fs.existsSync(process.env.C2PATOOL_PATH)) {
    return process.env.C2PATOOL_PATH;
  }

  // 2) Backend-local locations (Windows/Linux)
  const backendRoot = process.cwd();
  const backendExe = path.join(backendRoot, 'c2patool.exe');
  const backendBin = path.join(backendRoot, 'c2patool');
  if (fs.existsSync(backendExe)) return backendExe;
  if (fs.existsSync(backendBin)) return backendBin;

  // 3) Repo root fallbacks
  const projectRoot = path.join(backendRoot, '..');
  const rootExe = path.join(projectRoot, 'c2patool.exe');
  const rootBin = path.join(projectRoot, 'c2patool');
  if (fs.existsSync(rootExe)) return rootExe;
  if (fs.existsSync(rootBin)) return rootBin;

  // 4) System PATH
  return 'c2patool';
};

export const extractC2PAData = async (filePath) => {
  try {
    console.log("📷 Reading file with c2patool:", filePath);
    
    const absPath = path.resolve(filePath);
    let c2patoolPath = getC2PAToolPath();

    // Verify tool is runnable; if not, attempt auto-install
    try {
      await execAsync(`"${c2patoolPath}" --version`);
    } catch (probeError) {
      console.warn("⚠️ c2patool not runnable, attempting auto-install:", probeError?.message);
      c2patoolPath = await ensureC2PAToolAvailable();
    }

    const command = `"${c2patoolPath}" "${absPath}"`;
    console.log("🔍 Running command:", command);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && (stderr.includes("No C2PA data found") || stderr.includes("No claim found"))) {
      return {
        json: {
          message: "No C2PA data found in this image",
          hasC2PAData: false,
          status: "No C2PA metadata detected"
        },
        outputPath: null
      };
    }
    
    if (stderr) {
      console.warn("⚠️ Warning from c2patool:", stderr);
    }
    
    try {
      const json = JSON.parse(stdout);
      console.log("✅ C2PA data extracted successfully");
      
      return {
        json: {
          ...json,
          hasC2PAData: true
        },
        outputPath: null
      };
    } catch (parseError) {
      console.error("Failed to parse c2patool output:", parseError);
      console.error("Raw output:", stdout);
      throw new Error("Invalid JSON output from c2patool");
    }
    
  } catch (error) {
    console.error("❌ Error extracting C2PA data:", error.message);
    
    // Check if it's a "no C2PA data" error
    if (error.message.includes("No C2PA data") || 
        error.message.includes("No claim found") ||
        error.message.includes("Invalid C2PA") ||
        error.message.includes("No manifest")) {
      return {
        json: {
          message: "No C2PA data found in this image",
          hasC2PAData: false,
          status: "No C2PA metadata detected"
        },
        outputPath: null
      };
    }
    
    // If it's a GLIBC or not found error, try one-time install and retry
    if (error.message.includes("GLIBC") || error.message.includes("not found") || error.message.includes("ENOENT")) {
      try {
        const installedPath = await ensureC2PAToolAvailable();
        const retryCmd = `"${installedPath}" "${path.resolve(filePath)}"`;
        const { stdout } = await execAsync(retryCmd);
        const json = JSON.parse(stdout);
        return {
          json: {
            ...json,
            hasC2PAData: true
          },
          outputPath: null
        };
      } catch (retryErr) {
        console.error("Auto-install retry failed:", retryErr.message);
      }
    }

    throw new Error(`Failed to extract C2PA metadata: ${error.message}`);
  }
};