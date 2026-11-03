// Runs when no route matches the request
import type { Request, Response, NextFunction } from 'express';
export function notFound(req: Request, res: Response) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Catches any error thrown inside the app
export function errorHandler(err: Error & { type?: string }, req: Request, res: Response, next: NextFunction) {
  // The client sent a body that is not valid JSON
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "Request body contains invalid JSON" });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
}
