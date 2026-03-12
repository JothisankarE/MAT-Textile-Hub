try {
  const app = require('../backend/server.js');
  module.exports = app;
} catch (error) {
  console.error('SERVERLESS STARTUP ERROR:', error);
  // Fallback to show the error in the browser/logs
  const express = require('express');
  const app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: "Backend failed to start in Vercel environment",
      error: error.message,
      stack: error.stack,
      hint: "Check if all files in /backend are included in the deployment."
    });
  });
  module.exports = app;
}
