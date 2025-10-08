import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import c2paRoutes from "./routes/c2paRoutes.js";

const app = express();

app.use(cors());

// Ensure uploads directory exists at startup to avoid ENOENT from multer
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use("/api", c2paRoutes);

export default app;
