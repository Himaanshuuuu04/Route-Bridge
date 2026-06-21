import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../.env" });

const uri = process.env.MONGODB_URI;

export default async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
