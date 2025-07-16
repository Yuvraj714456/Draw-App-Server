import jwt from 'jsonwebtoken'

const cookie_option = {
    maxAge:15*24*60*60*1000,
    sameSite:"none",
    httpOnly:true,
    secure:true,
}

const sendToken = (res,user,code,message)=>{
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);

    return res.status(code).cookie("Draw-token",token,cookie_option).json({
        success:true,
        user:user,
        message,
    })
}


const getAllSocketMemebersWithSpecificRoomId = (users,roomId)=>{
    const socketIds = [];

    users.forEach((data,socketId)=>{
        if(data.rooms.includes(roomId)){
            socketIds.push(socketId);
        }
    });
    return socketIds;
}

export {sendToken,getAllSocketMemebersWithSpecificRoomId}