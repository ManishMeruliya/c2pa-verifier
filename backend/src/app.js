import express from "express";
import cors from "cors";
import c2paRoutes from "./routes/c2paRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api", c2paRoutes);

export default app;
