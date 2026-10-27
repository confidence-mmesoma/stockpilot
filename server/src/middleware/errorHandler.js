// Runs when no route matches the request
export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Catches any error thrown inside the app
export function errorHandler(err, req, res, next) {
  // The client sent a body that is not valid JSON
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "Request body contains invalid JSON" });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
}
