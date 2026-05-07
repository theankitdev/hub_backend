import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Server } from "socket.io"
import { connectDB } from "./config/db.connection.js"
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import http from 'http'
import { initSocket } from "./config/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
})

initSocket(io);

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: "Content-Type,Authorization",
        credentials: true,
    })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1", routes);

const PORT = process.env.PORT;

server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on`, PORT)
})