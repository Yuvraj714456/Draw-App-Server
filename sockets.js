import cookieParser from 'cookie-parser';
import { socketAuthenticator } from './middlewares/auth.middleware.js'; 
import { CHAT, JOIN_ROOM, LEAVE_ROOM } from './constant/event.js';
import { getAllSocketMemebersWithSpecificRoomId } from './utils/features.js';
import { Chat } from './models/chats.model.js';

const users = new Map();

const setupSocket = (io)=>{

    io.use((socket,next)=>{
        cookieParser()(socket.request,
                        socket.request.res || {},
                        async (err)=>{await socketAuthenticator(err,socket,next)}
        )
    });

    io.on("connection",(socket)=>{
        const {userId,username,type} = socket.user;

        if(!userId){
            console.log("Inavlid socket connection");
            return socket.disconnect();
        }

        users.set(socket.id,{userId,username,type,rooms:[]});

        console.log(`✅ ${username} (${type}) connected via socket: ${socket.id}`);


        socket.on(JOIN_ROOM,({roomId})=>{
            const userData = users.get(socket.id);
            console.log(`${socket.id} is joining room ${roomId}`);


            if(!userData) return;

            if(!userData.rooms.includes(roomId)){
                userData.rooms.push(roomId);
            }

            const members = getAllSocketMemebersWithSpecificRoomId(users,roomId);
            console.log("Joined members",members);
            for(const socketId of members){
                io.to(socketId).emit(JOIN_ROOM,{
                    userId:userData.userId,
                    username:userData.username,
                    type:userData.type,
                    roomId
                });
            }
        })


        socket.on(LEAVE_ROOM,({roomId})=>{
            const userData = users.get(socket.id);

            if(!userData || !userData.rooms.includes(roomId)) return ;

            userData.rooms = userData.rooms.filter(x => x !== roomId);

            const members = getAllSocketMemebersWithSpecificRoomId(users,roomId);
            for(const socketId of members){
                io.to(socketId).emit(LEAVE_ROOM,{
                    userId: userData.userId,
                    username: userData.username,
                    type: userData.type,
                    roomId,
                });
            }
            users.delete(socket.id);
        })

        socket.on(CHAT,async ({roomId,content})=>{
            const userData = users.get(socket.id);

            if(!userData || !userData.rooms.includes(roomId)) return;
            if(!content.trim()) return;

            let newMessage = null;

            if(userData.type === "authenticated"){
                newMessage = await Chat.create({
                    roomId,
                    sender:userData.userId,
                    message:content,
                })
            }

            const messagePayload = {
                _id:newMessage?._id || `temp_${Date.now()}`,
                roomId,
                sender:userData.userId,
                username:userData.username,
                type:userData.type,
                content,
                createdAt:newMessage?.createdAt || new Date(),
            }

            const members = getAllSocketMemebersWithSpecificRoomId(users,roomId);
        
            for(const socketId of members){
                io.to(socketId).emit(CHAT,messagePayload);
            }
        })


        socket.on("disconnect",()=>{
            const userData = users.get(socket.id);

            if (userData) {
                for (const roomId of userData.rooms) {
                const members = getAllSocketMemebersWithSpecificRoomId(users, roomId);
                for (const socketId of members) {
                    io.to(socketId).emit(LEAVE_ROOM, {
                    userId: userData.userId,
                    username: userData.username,
                    type: userData.type,
                    roomId,
                    });
                }
                }
                users.delete(socket.id);
            }
            console.log(`❌ Disconnected socket: ${socket.id}`);
        })
    });
}

export {setupSocket};