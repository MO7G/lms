import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary"

export const name = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{

    try {
        
    } catch (error : any) {
        return next ( new ErrorHandler(error.message, 500));
    }
});