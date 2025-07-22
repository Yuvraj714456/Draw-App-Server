import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    message:{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room"
    }
},{timestamps:true})

export const Chat = mongoose.model("Chat",chatSchema);