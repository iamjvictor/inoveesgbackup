import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { routes } from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";

export const app = express();

const allowedOrigins = env.corsOrigin.split(",").map((o) => o.trim());
const isAllowedOrigin = (origin: string) => {
  if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
    return true;
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  if (origin.endsWith(".vercel.app")) {
    return true;
  }

  return origin === "https://www.inove-esg.com.br" || origin === "https://inove-esg.com.br";
};

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como ferramentas locais, curl, postman, apps mobile)
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(requestLogger);
app.use("/api", routes);
