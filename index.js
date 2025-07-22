import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import dotenv from 'dotenv'
import { setupSocket } from './sockets.js'
import { connectDB } from './database/database.js'

dotenv.config();

connectDB();

const server =http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:['https://draw-app-frontend-cnp1.vercel.app',
                "http://localhost:5173"],
        methods:["GET","POST"],
        credentials:true,
    }
})

setupSocket(io);


const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});