import os from "os";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const repoRoot = path.join(process.cwd(), "..");
const projectRoot = fs.existsSync(path.join(process.cwd(), "package.json")) && path.basename(process.cwd()) === "backend"
  ? path.join(process.cwd(), "..")
  : process.cwd();

const toolName = process.platform === "win32" ? "c2patool.exe" : "c2patool";
const installTargetPath = path.join(projectRoot, toolName);

function getTargetTriples() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "linux") {
    const archTrip = arch === "arm64" ? "aarch64" : "x86_64";
    // Prefer musl to avoid GLIBC dependency; fall back to gnu
    return [
      `${archTrip}-unknown-linux-musl`,
      `${archTrip}-unknown-linux-gnu`
    ];
  }

  if (platform === "darwin") {
    // Prefer universal if available
    return [
      "universal-apple-darwin",
      (os.arch() === "arm64" ? "aarch64" : "x86_64") + "-apple-darwin"
    ];
  }

  if (platform === "win32") {
    return [
      (arch === "arm64" ? "aarch64" : "x86_64") + "-pc-windows-msvc"
    ];
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

async function getLatestReleaseAsset() {
  const res = await fetch("https://api.github.com/repos/contentauth/c2pa-rs/releases/latest", {
    headers: {
      "User-Agent": "c2pa-verifier-installer",
      "Accept": "application/vnd.github+json"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch latest release: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const assets = json.assets || [];
  const triples = getTargetTriples();

  // Try to find an asset that includes c2patool and a matching target triple
  for (const triple of triples) {
    const match = assets.find(a => a.name.includes("c2patool") && a.name.includes(triple));
    if (match) return match;
  }
  // Fallback: any c2patool asset for the platform
  const platform = os.platform();
  const platformHint = platform === "linux" ? "linux" : platform === "darwin" ? "darwin" : "windows";
  const fallback = assets.find(a => a.name.includes("c2patool") && a.name.includes(platformHint));
  if (fallback) return fallback;
  throw new Error("No suitable c2patool asset found in latest release.");
}

async function downloadTo(fileUrl, destPath) {
  const res = await fetch(fileUrl, {
    headers: {
      "User-Agent": "c2pa-verifier-installer",
      "Accept": "application/octet-stream"
    }
  });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download asset: ${res.status} ${res.statusText}`);
  }
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const fileStream = fs.createWriteStream(destPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function extractArchive(archivePath, destinationDir) {
  const isZip = archivePath.endsWith(".zip");
  const isTgz = archivePath.endsWith(".tar.gz") || archivePath.endsWith(".tgz");

  if (isZip) {
    if (process.platform === "win32") {
      const cmd = `powershell -NoProfile -Command "Expand-Archive -Path \"${archivePath}\" -DestinationPath \"${destinationDir}\" -Force"`;
      await execAsync(cmd);
    } else {
      // Attempt to use unzip if available
      await execAsync(`unzip -o "${archivePath}" -d "${destinationDir}"`);
    }
    return;
  }

  if (isTgz) {
    await execAsync(`tar -xzf "${archivePath}" -C "${destinationDir}"`);
    return;
  }

  throw new Error(`Unsupported archive format: ${archivePath}`);
}

async function findExtractedBinary(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findExtractedBinary(full);
      if (nested) return nested;
    } else {
      if (entry.name === toolName || entry.name === "c2patool") {
        return full;
      }
    }
  }
  return null;
}

export async function ensureC2PAToolAvailable() {
  // If already installed at project root, ensure executable and return
  if (fs.existsSync(installTargetPath)) {
    try {
      if (process.platform !== "win32") {
        await fs.promises.chmod(installTargetPath, 0o755);
      }
      await execAsync(`"${installTargetPath}" --version`);
      process.env.C2PATOOL_PATH = installTargetPath;
      return installTargetPath;
    } catch {
      // proceed to re-install
    }
  }

  const asset = await getLatestReleaseAsset();
  const tmpDir = path.join(os.tmpdir(), "c2pa-install");
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const archivePath = path.join(tmpDir, asset.name);
  await downloadTo(asset.browser_download_url, archivePath);

  const extractDir = path.join(tmpDir, "extract");
  await fs.promises.mkdir(extractDir, { recursive: true });
  await extractArchive(archivePath, extractDir);

  const extractedBinary = await findExtractedBinary(extractDir);
  if (!extractedBinary) {
    throw new Error("Extracted archive did not contain c2patool binary.");
  }

  await fs.promises.copyFile(extractedBinary, installTargetPath);
  if (process.platform !== "win32") {
    await fs.promises.chmod(installTargetPath, 0o755);
  }

  // Verify
  await execAsync(`"${installTargetPath}" --version`);
  process.env.C2PATOOL_PATH = installTargetPath;
  return installTargetPath;
}


