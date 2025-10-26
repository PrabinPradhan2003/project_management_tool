// Centralized error and 404 handling middleware
// Produces a consistent JSON shape and avoids leaking internals

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
  });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Map known error types first
  let status = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  let message = err?.message || 'Internal Server Error';
  let code = err?.code;
  let details;

  // Malformed JSON (from body-parser / express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    message = 'Invalid JSON payload';
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err?.name === 'CastError') {
    status = 400;
    message = `Invalid ${err?.path || 'parameter'} format`;
    details = { value: err?.value };
  }

  // Mongoose ValidationError
  if (err?.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map(e => ({ path: e.path, message: e.message }));
  }

  // Mongo duplicate key
  if (err?.code === 11000) {
    status = 409;
    message = 'Duplicate key error';
    details = { keyValue: err.keyValue };
  }

  // Fallback details (avoid leaking stack/response bodies in production)
  const isProd = process.env.NODE_ENV === 'production';
  const payload = {
    success: false,
    message,
    code,
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  if (!isProd) {
    if (!details && err?.response?.data) {
      // Some SDKs attach rich response data
      details = err.response.data;
    }
    payload.details = details || undefined;
    payload.stack = err?.stack;
  } else if (details) {
    payload.details = details;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
