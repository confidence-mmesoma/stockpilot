import { rateLimit } from "express-rate-limit";

// Counts only failed attempts (wrong password, wrong setup key),
// so normal logins never use up the allowance.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});
