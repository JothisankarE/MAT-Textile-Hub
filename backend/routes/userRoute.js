// import express from 'express';
// import { loginUser,registerUser } from '../controllers/userController.js';

const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { loginUser, registerUser, getConfirmationToken, getUserActivity, logoutUser, removeUser, suspendUser, forceLogoutUser, getUserProfile, updateUserProfile, googleAuth } = require('../controllers/userController.js');

const userRouter = express.Router();
const multer = require('multer');

// Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.VERCEL ? '/tmp' : 'uploads');
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-auth", googleAuth);   // Google OAuth sign-in / sign-up
userRouter.post("/logout", authMiddleware, logoutUser);
userRouter.get("/activity", getUserActivity); // New route for dashboard activity
userRouter.get("/confirm/:token", getConfirmationToken);
userRouter.post("/remove", removeUser);
userRouter.post("/suspend", suspendUser);
userRouter.post("/force-logout", forceLogoutUser);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.post("/update-profile", authMiddleware, upload.single('image'), updateUserProfile);




// export default userRouter;

module.exports = userRouter;