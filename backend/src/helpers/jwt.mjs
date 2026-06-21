import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../.env" });

export default async function create_token(user_id,user_email){
    const tokenPayload = { id: user_id, email: user_email };
    return jwt.sign(tokenPayload,process.env.JWT_SECRET,{expiresIn:"3d"});
}