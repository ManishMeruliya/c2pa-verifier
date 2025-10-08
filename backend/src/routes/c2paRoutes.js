import express from "express";
import { verifyImage, rootStatus } from "../controllers/c2paController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", rootStatus);
router.post("/verify", upload.single("image"), verifyImage);

export default router;
