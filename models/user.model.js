import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
    }
},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
})

export const User = mongoose.model("User",userSchema);