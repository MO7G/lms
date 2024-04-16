import NotificationModel from "../models/notification.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { error } from "console" ;
import cron from "node-cron"
import { couldStartTrivia } from "typescript";


// get all the notifications -- only admin
export const getNotifications = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {


        // When -1 is used, it means sorting in descending order, with the newest documents appearing first.
       // When 1 is used, it means sorting in ascending order, with the oldest documents appearing first.
        const notifications = await NotificationModel.find().sort({createdAt : -1});

        res.status(201).json({
            success:true,
            notifications
        })
    } catch (error : any) {
        return next(new ErrorHandler(error.message , 500));
    }
})


// update notification status -- only admin 

export const updateNotification = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    const notification = await NotificationModel.findById(req.params.id)
    if(!notification){
        return next(new ErrorHandler("Notification is not found " , 400));
    }

    notification.status = "read";

    await notification.save();

    // we need to send back the updated version of all notification to the front end so it can be modified from the state easily in the front end
    const notifications = await NotificationModel.find().sort({createdAt : -1});

    res.status(201).json({
        sucess: true,
        notifications
    })

})

// delete notification   -- only admin

cron.schedule("0 0 0 * * *" , async function(){
    const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({status:"read", createdAt:{$lt: thirtyDayAgo}});
    console.log("Notification Deleted")
}) 


