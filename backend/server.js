// Convenience entry so `node server.js` works from the backend folder.
// The real server code lives in ./src/server.js
try {
  require('./src/server');
} catch (err) {
  console.error('Failed to start server from ./src/server.js:', err);
  process.exit(1);
}
