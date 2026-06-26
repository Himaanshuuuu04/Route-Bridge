import UserModel from "../models/user.mjs";

export default async function adminMiddleware(req, res, next) {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user || !user.surveyAdmin) {
            return res.status(403).json({ message: "Forbidden: Superadmin access required" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
