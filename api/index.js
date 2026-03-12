try {
  const app = require('../backend/server.js');
  module.exports = app;
} catch (error) {
  console.error('SERVERLESS STARTUP ERROR:', error);
  const express = require('express');
  const app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: "Backend failed to start in Vercel environment",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      hint: "This usually means a module like 'bcrypt' failed to load, or 'MONGODB_URI' is missing. Check your Vercel logs."
    });
  });
  module.exports = app;
}

