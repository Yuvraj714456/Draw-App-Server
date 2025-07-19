import jwt from 'jsonwebtoken';
import { Trycatch } from './error.middleware.js';
import { ErrorHandler } from '../utils/utility.js';
import { User } from '../models/user.model.js';

const authorization = Trycatch((req, res, next) => {
    const token = req.cookies["Draw-token"]; 

    if(!token)
        throw new ErrorHandler("Authentication token missing", 401);

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user={ userId:decodedData._id,}
    
    next();
});

const socketAuthenticator = async(err,socket,next)=>{
    try{
        if(err)
            return next(err);

        const authToken = socket.request.cookies["Draw-token"];

        if(!authToken)
            return next(new ErrorHandler("Authentication token missing",401));

        const decodedData = jwt.verify(authToken,process.env.JWT_SECRET);

        const user = await User.findById(decodedData._id);
        
        if(!user)
            return next(new ErrorHandler("User not found",404));

        socket.user={
            userId:user._id.toString(),
            username:user.username,
        }
        
        return next();
    }catch(error){
        return next(new ErrorHandler("Inavlid or expired token",500));
    }
}

export { authorization ,socketAuthenticator};
