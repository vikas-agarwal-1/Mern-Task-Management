import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();    

const app = express();


// middleware to handle cors 
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// middleware to handle JSON object in request body 
app.use(express.json());


app.listen(5000, () => {
    console.log("Server is running on port 5000");
})