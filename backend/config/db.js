const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not defined in environment variables!");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected Successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        // Do not call process.exit(1) on Vercel as it kills the serverless function
    }
}

module.exports = connectDB;






