import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
dotenv.config({ path: "../.env", quiet: true });

const uri = process.env.MONGODB_URI;

// Log all Mongoose database calls to console
// mongoose.set('debug', true)

export default async function connectDB() {
    try {
        await mongoose.connect(uri, {
            tls: true,
            tlsCertificateKeyFile: './mongo.pem',
            authMechanism: 'MONGODB-X509'
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
