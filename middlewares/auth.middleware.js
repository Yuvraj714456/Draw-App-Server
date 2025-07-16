import jwt from 'jsonwebtoken';
import { Trycatch } from './error.middleware.js';
import { ErrorHandler } from '../utils/utility.js';
import { User } from '../models/user.model.js';

const authorization = Trycatch((req, res, next) => {
    const token = req.cookies["Draw-token"]; 

    if(token){
        try {
            const decodedData = jwt.verify(token,process.env.JWT_SECRET);

            req.user={
                userId:decodedData._id,
                type:"authenticated",
            }

        } catch (error) {
            req.user={
                userId:"anon_"+Math.random().toString(36).substring(2,8),
                type:"anonymus"
            }
        }
    }else{
        req.user={
                userId:"anon_"+Math.random().toString(36).substring(2,8),
                type:"anonymus"
        }
    }
    
    next()
});

const socketAuthenticator = async(err,socket,next)=>{
    try{
        if(err)
            return next(err);

        const authToken = socket.request.cookies["Draw-token"];

        if(authToken){
            try {
                const decodedData = jwt.verify(authToken,process.env.JWT_SECRET);
                const user = await User.findById(decodedData._id);
                if(user){
                    socket.user={
                        userId:user._id.toString(),
                        username:user.username,
                        type:"authenticated"
                    }
                    return next();
                }
            } catch (error) {
                console.log("Someting went wrong sduring socketAuthetication");
            }
        }

        const anonId = "anon_"+Math.random().toString(36).substring(2,8);
        socket.user={
            userId:anonId,
            username:anonId,
            type:"anonymus",
        }

        return next();
    }catch(error){
        return next(new ErrorHandler("Socket authentication failed",500));
    }
}

export { authorization ,socketAuthenticator};
