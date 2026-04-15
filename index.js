import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { initializeNotificationWatchers } from "./services/notificationWatcherService.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use((req, res, next) => {
  if (req.url.startsWith("/api/") || req.url === "/api") {
    req.url = req.url.replace(/^\/api/, "") || "/";
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is alive",
    timestamp: new Date().toISOString(),
  });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

initializeNotificationWatchers();

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
