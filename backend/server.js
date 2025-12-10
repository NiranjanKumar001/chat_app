console.log("server.js")
import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectionDB from "./config/conndb.js";
import routes from "./routes/index.routes.js"
const app=express()
import cors from "cors"

//.env file connection....
dotenv.config({})

//database connection calling....
connectionDB()

// app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true})) //
app.use(cookieParser())

//middleware

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://chat-app-xkod.vercel.app"],
  credentials: true
}));

//api default rendpoint...
app.use('/',routes)



const port = process.env.PORT || 4000;

// Import and setup Socket.IO
import { setupSocket } from './config/socket.js';
const httpServer = setupSocket(app);

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(port, () => {
    console.log(`Server and Socket.IO are running on port ${port}`);
  });
}

// Export for Vercel
export default app;
