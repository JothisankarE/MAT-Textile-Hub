const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const userModel = require("../models/userModel.js");
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

// Hardcoded fallback Client ID to ensure it works even if env vars are slow to sync on Render
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "548626080929-aqfebk302hd296dtbdf257k1pp69h0ip.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

//create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret');
}

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }
        if (!validator.isEmail(String(email))) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({ name, email, password: hashedPassword, isActive: true });
        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token, message: 'Registration successful.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getConfirmationToken = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await userModel.findOne({ confirmationToken: token });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid confirmation token." });
        }
        user.isActive = true;
        user.confirmationToken = null;
        await user.save();
        res.json({ success: true, message: "Your account has been confirmed!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error confirming account." });
    }
};

const getUserActivity = async (req, res) => {
    try {
        const users = await userModel.find({ lastLogin: { $exists: true } })
            .sort({ lastLogin: -1 })
            .limit(5)
            .select('name email lastLogin');
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching activity" });
    }
};

const logoutUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, { lastLogout: new Date() });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error logging out' });
    }
};

const removeUser = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "User Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const suspendUser = async (req, res) => {
    try {
        const { id, days } = req.body;
        const suspensionDate = new Date();
        suspensionDate.setDate(suspensionDate.getDate() + parseInt(days));
        await userModel.findByIdAndUpdate(id, { suspendedUntil: suspensionDate });
        res.json({ success: true, message: `User suspended for ${days} days` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error suspending user" });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const { name, email, address, theme, image } = user;
        res.json({ success: true, data: { name, email, address, theme, image } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching profile" });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { name, address, theme } = req.body;
        let updateData = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (theme !== undefined) updateData.theme = theme;
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const userId = req.userId || req.body.userId;
        await userModel.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating profile" });
    }
}

const forceLogoutUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.id, { lastLogout: new Date() });
        res.json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error forcing logout" });
    }
}

const googleAuth = async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.json({ success: false, message: "No Google credential provided" });
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await userModel.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.googleAvatar = picture || "";
                user.isActive = true;
                await user.save();
            }
        } else {
            user = new userModel({
                name,
                email,
                googleId,
                googleAvatar: picture || "",
                password: null,
                isActive: true,
            });
            await user.save();
        }

        await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        const token = createToken(user._id);
        res.json({ success: true, token, name: user.name });
    } catch (error) {
        console.error("❌ Google auth error details:", {
            message: error.message,
            stack: error.stack,
            provided_token: credential ? "PRESENT" : "MISSING",
            audience: CLIENT_ID
        });
        res.json({ success: false, message: "Google authentication failed" });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getConfirmationToken,
    getUserActivity,
    logoutUser,
    removeUser,
    suspendUser,
    forceLogoutUser,
    getUserProfile,
    updateUserProfile,
    googleAuth
}