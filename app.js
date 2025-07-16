import express from 'express'
import { errorMiddleware } from './middlewares/error.middleware.js';
import { router } from './routes/users.routes.js';
import cookieParser from 'cookie-parser'


const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("Hello world");
})

app.use('/api/v1',router)




app.use(errorMiddleware);

export default app;