import { Router } from "express";
import { getExternalData } from "../controllers/api.controller.js";

const router = Router();

router.get("/data", getExternalData);

export default router;
