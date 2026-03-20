import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./src/routes/authRoutes.js";
import { journalRouter } from "./src/routes/journalRoutes.js";
import { chatRouter } from "./src/routes/chatRoutes.js";
import { syncRouter } from "./src/routes/syncRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const corsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/journal", journalRouter);
app.use("/chat", chatRouter);
app.use("/sync", syncRouter);

app.use(errorHandler);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`);
});
