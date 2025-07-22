import express from 'express'
import { errorMiddleware } from './middlewares/error.middleware.js';
import { router } from './routes/users.routes.js';
import cookieParser from 'cookie-parser'
import { corsOptions } from './constant/config.js';
import cors from 'cors'


const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send("Hello world");
})

app.use('/api/v1',router)

app.use(errorMiddleware);

export default app;