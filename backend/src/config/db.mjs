import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
let client = null;
let dbConnection = null;

export default async function connectDB() {
    // If a connection is already established, return it
    if (dbConnection) {
        return dbConnection;
    }

    // Initialize the MongoClient if it hasn't been created yet
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
        // Cache the connection
        dbConnection = client;
        return dbConnection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // Reset the client/connection on failure so a retry can be attempted
        client = null;
        dbConnection = null;
        throw error;
    }
}

