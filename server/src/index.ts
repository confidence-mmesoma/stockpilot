import "dotenv/config";
import cors from "cors";
import express from "express";
import productRoutes from "./routes/products.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import salesRoutes from "./routes/sales.js";
import { createServer } from "node:http";
import { initSocket } from "./realtime/socket.js";
import notificationRoutes from "./routes/notifications.js";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5000;

  // In production the app sits behind a hosting proxy; this lets rate limiting see the real visitor address
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Safe default security headers on every response
  app.use(helmet());

// Only the React app is allowed to call this API from a browser
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Lets the server read JSON sent in request bodies
app.use(express.json());
app.use(cookieParser());

// Health check route: confirms the API is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "StockPilot API is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

// Socket.io needs the plain HTTP server underneath Express
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
