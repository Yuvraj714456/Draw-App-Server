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
        const {userId,username} = socket.user;

        if(!userId){
            console.log("Inavlid socket connection");
            return socket.disconnect();
        }

        users.set(socket.id,{userId,username,rooms:[]});

        console.log(`✅ ${username} connected via socket: ${socket.id}`);


        socket.on(JOIN_ROOM,(roomId)=>{
            const userData = users.get(socket.id);
            if(!userData) return;

            console.log(roomId);
            if(!userData.rooms.includes(roomId)){
                userData.rooms.push(roomId);
            }

            const members = getAllSocketMemebersWithSpecificRoomId(users,roomId);

            for(const socketId of members){
                io.to(socketId).emit(JOIN_ROOM,{
                    userId:userData.userId,
                    username:userData.username,
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
                    roomId,
                });
            }
            users.delete(socket.id);
        })

        socket.on(CHAT,async ({roomId,content})=>{
            const userData = users.get(socket.id);

            if(!userData || !userData.rooms.includes(roomId)) return;

            const  newMessage = await Chat.create({
                    roomId,
                    sender:userData.userId,
                    message:JSON.stringify(content),
                })

            const messagePayload = {
                _id:newMessage?._id,
                roomId,
                sender:userData.userId,
                username:userData.username,
                content,
                createdAt:newMessage.createdAt,
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