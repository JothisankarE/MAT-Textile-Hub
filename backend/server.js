// import express  from "express"
// import cors from 'cors'
// import { connectDB } from "./config/db.js"
// import userRouter from "./routes/userRoute.js"
// import foodRouter from "./routes/productRoute.js"
// import 'dotenv/config'
// import cartRouter from "./routes/cartRoute.js"
// import orderRouter from "./routes/orderRoute.js"

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

// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/chat", chatRouter)

const adminDistPath = path.join(__dirname, 'admin-dist');
const fs = require('fs');

console.log('Admin Dist Path:', adminDistPath);
console.log('Index.html exists:', fs.existsSync(path.join(adminDistPath, 'index.html')));

// Serve static files from the admin panel dist folder
app.use(express.static(adminDistPath));

app.get("/api-docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MAT Traders API</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0f0f1a;
      color: #e0e0e0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .bg-glow {
      position: fixed; top: -40%; left: -20%; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
      border-radius: 50%; z-index: 0; pointer-events: none;
    }
    .bg-glow-2 {
      position: fixed; bottom: -30%; right: -10%; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
      border-radius: 50%; z-index: 0; pointer-events: none;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; position: relative; z-index: 1; }
    .header {
      text-align: center; margin-bottom: 50px;
      animation: fadeInDown 0.6s ease;
    }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .status-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
      color: #22c55e; padding: 6px 16px; border-radius: 50px; font-size: 13px;
      font-weight: 500; margin-bottom: 20px; letter-spacing: 0.5px;
    }
    .status-dot {
      width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
    h1 {
      font-size: 42px; font-weight: 800;
      background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle { color: #9ca3af; font-size: 16px; font-weight: 300; }
    .base-url {
      display: inline-block; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
      padding: 8px 20px; border-radius: 8px; font-family: monospace; font-size: 14px;
      color: #a5b4fc; margin-top: 15px; letter-spacing: 0.5px;
    }
    .admin-url {
      display: inline-block; background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.2);
      padding: 8px 20px; border-radius: 8px; font-family: monospace; font-size: 14px;
      color: #f472b6; margin-top: 15px; margin-left: 10px; letter-spacing: 0.5px;
      text-decoration: none; transition: all 0.2s;
    }
    .admin-url:hover {
      background: rgba(236,72,153,0.2);
      color: #fff;
    }
    .section {
      margin-bottom: 35px;
      animation: fadeInUp 0.6s ease;
    }
    .section:nth-child(2) { animation-delay: 0.1s; }
    .section:nth-child(3) { animation-delay: 0.2s; }
    .section:nth-child(4) { animation-delay: 0.3s; }
    .section:nth-child(5) { animation-delay: 0.4s; }
    .section:nth-child(6) { animation-delay: 0.5s; }
    .section-title {
      font-size: 18px; font-weight: 700; margin-bottom: 14px;
      display: flex; align-items: center; gap: 10px; color: #f1f5f9;
    }
    .section-icon {
      width: 32px; height: 32px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; font-size: 16px;
    }
    .icon-user { background: rgba(99,102,241,0.15); color: #818cf8; }
    .icon-product { background: rgba(34,197,94,0.15); color: #4ade80; }
    .icon-cart { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .icon-order { background: rgba(236,72,153,0.15); color: #f472b6; }
    .icon-chat { background: rgba(56,189,248,0.15); color: #38bdf8; }
    .card {
      background: rgba(30,30,50,0.6); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; overflow: hidden;
      backdrop-filter: blur(10px);
    }
    .endpoint {
      display: flex; align-items: center; gap: 12px; padding: 12px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.2s;
    }
    .endpoint:last-child { border-bottom: none; }
    .endpoint:hover { background: rgba(255,255,255,0.03); }
    .method {
      font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 5px;
      font-family: monospace; text-transform: uppercase; min-width: 50px; text-align: center;
      letter-spacing: 0.5px;
    }
    .get { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
    .post { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
    .path { font-family: monospace; font-size: 13px; color: #cbd5e1; flex: 1; }
    .desc { font-size: 12px; color: #6b7280; max-width: 250px; text-align: right; }
    .auth-badge {
      font-size: 10px; color: #fbbf24; background: rgba(251,191,36,0.1);
      border: 1px solid rgba(251,191,36,0.2); padding: 2px 7px; border-radius: 4px;
    }
    .footer {
      text-align: center; margin-top: 50px; padding-top: 25px;
      border-top: 1px solid rgba(255,255,255,0.06); color: #4b5563; font-size: 13px;
    }
    .stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 40px;
      animation: fadeInUp 0.5s ease;
    }
    .stat-card {
      background: rgba(30,30,50,0.6); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; padding: 20px; text-align: center;
      backdrop-filter: blur(10px);
    }
    .stat-num { font-size: 28px; font-weight: 800; color: #a5b4fc; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    @media (max-width: 600px) {
      h1 { font-size: 28px; }
      .stats { grid-template-columns: 1fr; }
      .desc { display: none; }
      .endpoint { padding: 10px 14px; }
    }
  </style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="bg-glow-2"></div>
  <div class="container">
    <div class="header">
      <div class="status-badge"><span class="status-dot"></span> API Online</div>
      <h1>MAT Traders API</h1>
      <p class="subtitle">E-Commerce Backend Service — All Systems Operational</p>
      <div class="base-url">API: https://mat-textile-hub-admin.onrender.com</div>
      <a href="https://mat-textile-hub-admin.onrender.com/" class="admin-url" target="_blank">Admin Panel: https://mat-textile-hub-admin.onrender.com/</a>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="stat-num">30+</div><div class="stat-label">Endpoints</div></div>
      <div class="stat-card"><div class="stat-num">5</div><div class="stat-label">Modules</div></div>
      <div class="stat-card"><div class="stat-num">99.9%</div><div class="stat-label">Uptime</div></div>
    </div>

    <!-- USER API -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-user">👤</span> User Authentication</div>
      <div class="card">
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/register</span><span class="desc">Register new user</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/login</span><span class="desc">Login with email/password</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/google-auth</span><span class="desc">Google OAuth sign-in</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/logout</span><span class="auth-badge">🔒 Auth</span><span class="desc">Logout user</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/user/activity</span><span class="desc">User activity (admin)</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/user/confirm/:token</span><span class="desc">Email confirmation</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/user/profile</span><span class="auth-badge">🔒 Auth</span><span class="desc">Get user profile</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/update-profile</span><span class="auth-badge">🔒 Auth</span><span class="desc">Update profile + avatar</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/remove</span><span class="desc">Remove user (admin)</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/suspend</span><span class="desc">Suspend user (admin)</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/user/force-logout</span><span class="desc">Force logout (admin)</span></div>
      </div>
    </div>

    <!-- PRODUCT API -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-product">📦</span> Products</div>
      <div class="card">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/food/list</span><span class="desc">List all products</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/add</span><span class="desc">Add product (with images)</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/bulk-add</span><span class="desc">Bulk add via Excel</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/remove</span><span class="desc">Delete a product</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/update-stock</span><span class="desc">Update stock quantity</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/update-price</span><span class="desc">Update product price</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/food/update</span><span class="desc">Update product details</span></div>
      </div>
    </div>

    <!-- CART API -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-cart">🛒</span> Cart</div>
      <div class="card">
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/cart/get</span><span class="auth-badge">🔒 Auth</span><span class="desc">Get user cart</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/cart/add</span><span class="auth-badge">🔒 Auth</span><span class="desc">Add item to cart</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/cart/remove</span><span class="auth-badge">🔒 Auth</span><span class="desc">Remove item from cart</span></div>
      </div>
    </div>

    <!-- ORDER API -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-order">📋</span> Orders</div>
      <div class="card">
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/place</span><span class="auth-badge">🔒 Auth</span><span class="desc">Place new order</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/userorders</span><span class="auth-badge">🔒 Auth</span><span class="desc">Get user's orders</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/order/list</span><span class="desc">List all orders (admin)</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/order/stats</span><span class="desc">Dashboard statistics</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/order/deleted</span><span class="desc">List deleted orders</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/status</span><span class="desc">Update order status</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/verify</span><span class="desc">Verify payment</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/receipt</span><span class="desc">Generate PDF invoice</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/delete</span><span class="desc">Soft delete order</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/order/permanent-delete</span><span class="desc">Permanently delete</span></div>
      </div>
    </div>

    <!-- CHAT / SUPPORT API -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-chat">💬</span> Chat / Support</div>
      <div class="card">
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/chat/save</span><span class="auth-badge">🔒 Auth</span><span class="desc">Send support message</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/chat/userchat</span><span class="auth-badge">🔒 Auth</span><span class="desc">Get user's chat</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/chat/usertickets</span><span class="auth-badge">🔒 Auth</span><span class="desc">Get user's tickets</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/api/chat/list</span><span class="desc">List all chats (admin)</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/chat/status</span><span class="desc">Update chat status</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/api/chat/reply</span><span class="desc">Admin reply</span></div>
      </div>
    </div>

    <!-- STATIC FILES -->
    <div class="section">
      <div class="section-title"><span class="section-icon icon-product">🖼️</span> Static Files</div>
      <div class="card">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/images/:filename</span><span class="desc">Serve uploaded images</span></div>
      </div>
    </div>

    <div class="footer">
      <p>MAT Traders Backend API &copy; 2026 — Built with Express.js &amp; MongoDB</p>
    </div>
  </div>
</body>
</html>
  `);
});

// Catch-all route to serve the admin panel's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(404).send('Admin Panel Not Found. Please ensure the build process completed successfully.');
    }
  });
});

app.listen(port, () => console.log(`Server started on port ${port}`))