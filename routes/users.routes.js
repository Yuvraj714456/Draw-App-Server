import express from "express";
import { getChats, loginUser, newUser, room } from "../controlleres/user.controller.js";
import { authorization } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/newuser',newUser);

router.post('/login',loginUser);

router.use(authorization);

router.post('/room',room);

router.get('/chat/:roomId',getChats);

export {router};