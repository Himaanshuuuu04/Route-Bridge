import UserModel from "../models/user.mjs";
import create_token from "../helpers/jwt.mjs";
import dotenv from "dotenv"
import { sendMail } from "../helpers/sender.mjs";

dotenv.config();
dotenv.config({ path: "../.env" });

export async function signIn(req, res) {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ message: "Bad Request" });
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found, please sign up first" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        // update user with otp and otpExpiry
        await UserModel.updateOne({ email: email }, { otp: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
        // send otp to user
        await sendMail(email, user.name, otp);
        return res.status(200).json({ message: "OTP sent successfully" });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function verifyOtp(req, res) {
    try {
    
        const email = req.body.email;
        const otp = req.body.otp;
        if (!email || !otp) {
            return res.status(400).json({ message: "Bad Request" });
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found, please sign up first" });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < new Date(Date.now())) {
            return res.status(401).json({ message: "OTP expired" });
        }
        await UserModel.updateOne({ email: email }, { otp: null, otpExpiry: null });
        const token = await create_token(user._id, user.email);
        const isProd = process.env.NODE_ENV === "production" || (req.get("origin") && req.get("origin").startsWith("https"));
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: process.env.COOKIE_SAME_SITE || (isProd ? "none" : "strict"),
            maxAge: 3 * 24 * 60 * 60 * 1000
        };
        if (process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        res.cookie("token", token, cookieOptions);
        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export async function addUser(req, res) {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ message: "Bad Request: email and name are required" });
        }
        const user = await UserModel.findOne({ email: email });
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }
        const newUser = new UserModel({
            email,
            name,
            surveyAdmin: false // default to regular user
        });
        await newUser.save();
        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        
        if (req.user.id === id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await UserModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({ message: "User deleted successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function logout(req, res) {
    try {
        const isProd = process.env.NODE_ENV === "production" || (req.get("origin") && req.get("origin").startsWith("https"));
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: process.env.COOKIE_SAME_SITE || (isProd ? "none" : "strict"),
        };
        if (process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        res.clearCookie("token", cookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMe(req, res) {
    try {
        const user = await UserModel.findById(req.user.id).select("-otp -otpExpiry");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getUsers(req, res) {
    try {
        const users = await UserModel.find().select("-otp -otpExpiry").sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function toggleAdminStatus(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (req.user.id === id) {
            return res.status(400).json({ message: "You cannot change your own admin status" });
        }

        user.surveyAdmin = !user.surveyAdmin;
        await user.save();
        
        return res.status(200).json({ message: "User admin status updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
