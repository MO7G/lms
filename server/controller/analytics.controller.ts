import NotificationModel from "../models/notification.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron"
import { couldStartTrivia } from "typescript";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/cousre.model";
import OrderModel from "../models/order.model";


// get users analytics -- only admin
export const getUserAnalytics = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {
        const users = await generateLast12MonthData(userModel)
        
        res.status(201).json({
            success:true,
            users: users
        })
    } catch (error:any) { 
        return next(new ErrorHandler(error.message , 500));
    }
})



// get courses analytics -- only admin
export const getCoursesAnalytics = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {
        const users = await generateLast12MonthData(CourseModel)
        
        res.status(201).json({
            success:true,
            users: users
        })
    } catch (error:any) { 
        return next(new ErrorHandler(error.message , 500));
    }
})



// get Order analytics -- only admin
export const getOrderAnalytics = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {
        const users = await generateLast12MonthData(OrderModel)
        
        res.status(201).json({
            success:true,
            users: users
        })
    } catch (error:any) { 
        return next(new ErrorHandler(error.message , 500));
    }
})



