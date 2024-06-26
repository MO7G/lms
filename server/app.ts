import express, { NextFunction,Request,Response } from 'express'
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import {ErrorMiddleware} from './middleware/error'
import path from "path";
import userRouter from './routes/user.route';
import courseRouter from './routes/cousre.route';
import ejs from 'ejs';
import orderRouter from './routes/order.route';
import notificationRouter from './routes/notification.route';
import analyticsRouter from './routes/analytics.route';
import layoutRouter from './routes/layout.route'
import testingRouter from './routes/testing.route'
require('dotenv').config();


// body parser the limit of the data that can be sent
app.use(express.json({ limit: "50mb" }))

// cookie parser
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));



// cors-> cross origin resource sharing only allowed ip address can access the website
app.use(cors({
    origin: process.env.ORIGIN
}));


// models routes 
app.use('/api/v1',userRouter , courseRouter, orderRouter , notificationRouter,analyticsRouter,layoutRouter);

// for testing purposes
app.use('/',testingRouter)


// testing api 
app.get("/test", (req:Request, res:Response , next:NextFunction) => {
    res.status(200).json({
        success: true,
        message: "the api test is working "
    })
})




// unkown route 
app.all("*" , (req:Request, res:Response , next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    res.statusCode = 404;
    next(err);
})



app.use(ErrorMiddleware);