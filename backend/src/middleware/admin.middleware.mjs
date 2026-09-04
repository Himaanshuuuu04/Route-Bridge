import UserModel from "../models/user.mjs";
import redisConnection from "../config/redis.mjs";

export default async function adminMiddleware(req, res, next) {
    try {
        const cacheKey = `user:profile:${req.user.id}`;
        const cachedUserStr = await redisConnection.get(cacheKey);
        
        let user;
        if (cachedUserStr) {
            user = JSON.parse(cachedUserStr);
        } else {
            user = await UserModel.findById(req.user.id).lean();
            if (user) {
                await redisConnection.set(cacheKey, JSON.stringify(user));
            }
        }

        if (!user || !user.surveyAdmin) {
            return res.status(403).json({ message: "Forbidden: Superadmin access required" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
