import { Trycatch } from "../middlewares/error.middleware.js";
import { Chat } from "../models/chats.model.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { sendToken } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'



const newUser = Trycatch(async  (req,res,next)=>{
    const {name,username,email,password,confirmPassword} = req.body;

    if(password.length < 8){
        return next(new ErrorHandler("Password must be greater then 8",401));
    }

    if(password !== confirmPassword){
        return next(new ErrorHandler("Password and Confirm Password are not same",401));
    }

    const user =await User.findOne({
        $or:[{username},{email}]
    })

    if(user){
        return next(new ErrorHandler("user is Already existed with this email",404));
    }

    const isValidEmail = (email) =>{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    if(!isValidEmail(email)){
        return next(new ErrorHandler("Email is not valid",401));
    }

    // if not Create user and save in to the Db 
    const createdUser = await User.create({
        name,
        username,
        password,
        email,
    })

    if(!createdUser)
        return next(new ErrorHandler("Something went gone wrong during creating the user",403));

    // return response
    sendToken(res,createdUser,201,"User created");
})

const loginUser = Trycatch(async (req,res,next)=>{

    const {email,username,password} = req.body;


    // check user is resent on the DB 
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    console.log(user);

    if(!user)
        return next(new ErrorHandler("User is not exist with username or email",403));
    // then check password is matched with the existing user

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch)
        return next(new ErrorHandler("Invalid credentials",403));
    // if it is then send the reposnse

    sendToken(res,user,200,"User logged in");
})


const room = Trycatch(async (req,res,next)=>{
    const {slug="",members=[],description} = req.body;
    const {userId} = req.user;

    if(!userId)
        return next(new ErrorHandler("Please login to access this page",403));
    const user = await User.findById(userId);
        if(!user)
            return next(new ErrorHandler("Invalid user",403));

        const roomData = await Room.create({
            slug:slug,
            members:[...members,userId],
            createdBy:userId,
            description
        });

        return res.status(200).json({
            success:true,
            message:"Drawing setup completed",
            roomData:{
                roomId:roomData._id,
                slug:roomData.slug,
                createdBy:roomData.createdBy,
                createdAt:roomData.createdAt,
            }
    });
})


const getChats = Trycatch(async (req,res,next)=>{
    const roomId = req.params.roomId;

    const chats = await Chat.find({roomId}).sort({createdAt:-1}).limit(50);

    if(!chats)
        return next(new ErrorHandler("there is no such chats with this roomId"));

    res.status(200).json({
        success:true,
        chats:chats
    })
})



const getUserDetails = Trycatch(async (req, res, next) => {
  const { userId } = req.user;

  if (!userId) return next(new ErrorHandler("Invalid user", 403));

  const user = await User.findById(userId).lean();

  if (!user) return next(new ErrorHandler("User not found", 404));

  const rooms = await Room.find({ createdBy: userId })

  const fullDetails = {...user,rooms}
  return res.status(200).json({
    success: true,
    userdetails:fullDetails
  });
});

const getProfile = Trycatch(async (req,res,next)=>{
    const {userId} = req.user;

    const user = await User.findById(userId);

    if(!user) 
        return next(new ErrorHandler("user is not defined",404)); 

    res.status(200).json({
        success:true,
        user:user,
    })
})


export {newUser,loginUser,room,getChats,getUserDetails,getProfile}