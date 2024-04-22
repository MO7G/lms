/*
 * File: auth.s middleware 
 * Description: a middleware that checks for the authentication of the user !
 * Author: hajji
 * Date: 2023-10-23
 * Company: Mo7aMind
 * License: Mo7aMind
 */

import { Request , Response , NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import { ResolveFnOutput } from "module";
import { access } from "fs";
import { error } from "console";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken"
import {redis} from '../utils/redis';
import { decode } from "punycode";


// authenticated users 
export const isAuthenticated = CatchAsyncError(async(req: Request , res : Response , next:NextFunction)=>{
    const access_token = req.cookies.access_token;
    if(!access_token){
        console.error("isAuthenticated no accesss token")
        return next(new ErrorHandler("Please login to access this resource " , 400  ));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN  as string) as JwtPayload
    
    if(!decoded){
        console.error("isAuthenticated  accesss token not valid")
        return next(new ErrorHandler("Access Token is not valid" , 400));
    }



    const user = await redis.get(decoded.id);
    if(!user){
        console.error("isAuthenticated user is not found")
        return next(new ErrorHandler("Please login to access this resource" , 400  ));
    }
    // normally you will have an error when you try to access the req.user !! because user is not part of the standard 'Request' type
    //  explained more in in  
    req.user = JSON.parse(user);
    console.log("from the auth file  ")
    next();
})




export const authorizeRoles = (...roles:string[])=>{
    return (req:Request , res:Response,next:NextFunction)=>{
        if(!roles.includes(req.user?.role || '')){
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource` , 403));
        }
        next()
    }
}