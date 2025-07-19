import mongoose from "mongoose";
import {v4 as uuid} from 'uuid'

const roomSchema = new mongoose.Schema({
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