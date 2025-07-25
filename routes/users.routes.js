import express from "express";
import { getChats, getProfile, getUserDetails, loginUser, logOut, newUser, room } from "../controlleres/user.controller.js";
import { authorization } from "../middlewares/auth.middleware.js";
import { loginValidator, registerValidator, validateHandler } from "../utils/Validator.js";

const router = express.Router();

router.post('/newuser',registerValidator(),validateHandler,newUser);

router.post('/login',loginValidator(),validateHandler,loginUser);

router.use(authorization);

router.post('/room',room);

router.get('/chat/:roomId',getChats);

router.get('/userdetails',getUserDetails);

router.get('/me',getProfile);

router.get('/logout',logOut);

export {router};