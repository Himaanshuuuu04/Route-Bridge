import UserModel from "../models/user.mjs";
import create_token from "../helpers/jwt.mjs";
import redisConnection from "../config/redis.mjs";
import { emailQueue } from "../config/bullmq.mjs";


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
        console.log(otp);

        // Store OTP in Redis with 10-minute expiry (600 seconds)
        await redisConnection.set(`otp:${email}`, String(otp), 'EX', 600);

        // Enqueue email job for async processing
        await emailQueue.add('sendOtp', 
            { email, name: user.name, otp }, 
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );
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

        const cachedOtp = await redisConnection.get(`otp:${email}`);
        if (!cachedOtp) {
            return res.status(401).json({ message: "OTP expired or invalid" });
        }
        if (cachedOtp !== String(otp)) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // OTP is valid, remove it from Redis
        await redisConnection.del(`otp:${email}`);

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
        
        // Invalidate cached user profile
        await redisConnection.del(`user:profile:${id}`);

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
        const cacheKey = `user:profile:${req.user.id}`;
        const cachedUser = await redisConnection.get(cacheKey);
        if (cachedUser) {
            return res.status(200).json(JSON.parse(cachedUser));
        }

        const user = await UserModel.findById(req.user.id).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Cache user profile in Redis for 10 minutes (600 seconds)
        await redisConnection.set(cacheKey, JSON.stringify(user), 'EX', 600);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getUsers(req, res) {
    try {
        const users = await UserModel.find().sort({ createdAt: -1 });
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
        
        // Invalidate cached user profile
        await redisConnection.del(`user:profile:${id}`);

        return res.status(200).json({ message: "User admin status updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
