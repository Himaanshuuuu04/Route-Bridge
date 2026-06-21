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


export async function signUp(req, res) {
    try {
        console.log(req.body);
       
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ message: "Bad Request" });
        }
        const user = await UserModel.findOne({ email: email });
        if (user) {
            return res.status(409).json({ message: "User already exists, please login" });
        }
        const newUser = new UserModel({
            email,
            name,
        });
        await newUser.save();
        return res.status(200).json({ message: "User created successfully" });
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
