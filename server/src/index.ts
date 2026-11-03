import 'dotenv/config';
import cors from 'cors';
import express from "express";
import productRoutes from "./routes/products.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

  // Only the React app is allowed to call this API from a browser
  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  );

// Lets the server read JSON sent in request bodies
app.use(express.json());

// Health check route: confirms the API is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "StockPilot API is running",
  });
});

app.use("/api/products", productRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
