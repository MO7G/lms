import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary"


// create layout
export const getUserAnalytics = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {
        const {type} = req.body.toLowerCase();

        
        if(type == "banner"){
            const {image,title,subTitle} = req.body;
            // uploading the image to our cloud 
            const myCloud = await cloudinary.v2.uploader.upload(image,{folder:"layout"})
            const banner = {
                image:{
                    public_id:myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle
            }
            await LayoutModel.create(banner)
        }

        if (type === "faq"){
            const {faq} = req.body;
            await LayoutModel.create(faq);
        }


        if(type === "categories" ){
            const {
                categories} = req.body;
        }


        res.status(201).json({
            success:true,
            message: "Layout Was Created Successfully"
        })
    } catch (error:any) { 
        return next(new ErrorHandler(error.message , 500));
    }
})

