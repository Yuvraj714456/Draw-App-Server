import mongoose from "mongoose";
import {v4 as uuid} from 'uuid'

const roomSchema = new mongoose.Schema({
    roomId:{
        type:String,
        required:true,
        unique:true,
        default:uuid,
        immutable:true
    },
    slug:{
        type:String,
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Room = mongoose.model("Room",roomSchema);