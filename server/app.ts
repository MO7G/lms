import express, { NextFunction,Request,Response } from 'express'
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import {ErrorMiddleware} from './middleware/error'
import path from "path";

require('dotenv').config();


// body parser the limit of the data that can be sent
app.use(express.json({ limit: "50mb" }))

// cookie parser
app.use(cookieParser());


// cors-> cross origin resource sharing only allowed ip address can access the website
app.use(cors({
    origin: process.env.ORIGIN
}));


// testing api 
app.get("/test", (req:Request, res:Response , next:NextFunction) => {
    res.status(200).json({
        success: true,
        message: "the api test is working "
    })
})


// temp route for testing the view of the email template 
app.get("/mailTemplate", (req:Request, res:Response , next:NextFunction) => {
    const ejsFilePath = path.join(__dirname, 'mails/activation-mail.ejs');
    var fs = require('fs');
    var mailTemplate = fs.readFileSync(ejsFilePath, 'utf-8');
    res.send(mailTemplate)
})


// unkown route 
app.all("*" , (req:Request, res:Response , next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    res.statusCode = 404;
    next(err);
})



app.use(ErrorMiddleware);