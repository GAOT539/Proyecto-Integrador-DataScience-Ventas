import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", apiRoutes);

export default app;
