const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db.js");
const userRouter = require("./routes/userRoute.js");
const foodRouter = require("./routes/productRoute.js");
require('dotenv/config');
const cartRouter = require("./routes/cartRoute.js");
const orderRouter = require("./routes/orderRoute.js");
const chatRouter = require("./routes/chatRoute.js");
const path = require('path');

// app config
const app = express()
const port = process.env.PORT || 4000

// 1. Permissive CORS for debugging
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// 2. Security/Auth Headers (COOP/COEP)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// 3. Middlewares
app.use(express.json())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/chat", chatRouter)

// --- Admin Panel Serving (on Render) ---
const adminDistPath = path.join(__dirname, 'admin-dist');
const fs = require('fs');

console.log('Admin Dist Path:', adminDistPath);

app.use(express.static(adminDistPath));

app.get("/api-docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MAT Traders API Status</title>
  <style>
    body { font-family: sans-serif; background: #0f0f1a; color: #fff; padding: 40px; text-align: center; }
    .status { color: #22c55e; margin: 20px 0; font-size: 24px; }
    .info { color: #9ca3af; margin-bottom: 30px; }
    a { color: #818cf8; text-decoration: none; border: 1px solid #818cf8; padding: 10px 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>MAT Traders API</h1>
  <div class="status">● All Systems Operational</div>
  <p class="info">Backend is running.</p>
  <a href="/">Go to Admin Panel</a>
</body>
</html>
  `);
});

// Catch-all route to serve the admin panel's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'), (err) => {
    if (err) {
      if (!req.path.startsWith('/api')) {
         res.redirect('/api-docs');
      } else {
         res.status(404).json({ success: false, message: "API endpoint not found" });
      }
    }
  });
});

// 4. Global Error Handler to prevent 502s
app.use((err, req, res, next) => {
  console.error("Critical Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.listen(port, () => console.log(`Server started on port ${port}`))