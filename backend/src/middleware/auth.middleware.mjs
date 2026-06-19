import jwt from "jsonwebtoken";
export default async function authMiddleware(req,res,next){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}