import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary"
import { createCourse } from "../services/course.service";
import CourseModel from "../models/cousre.model";






// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("hii")
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "course"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next);


    } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 500));
    }
});



// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        // if body is empty return !!
        if(Object.keys(data).length === 0 ){
            return next(new ErrorHandler("Empty Fileds !!!", 422));
        }
        const thumbnail = data.thumbnail;

        // If thumbnail exists this means admin wants to change it !!
        if (thumbnail) {
            // destory old thumbnail from cloudinary clouds and adding the new one !!
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            // will be stored in the database !!!
            data.thumbnail = {
                publid_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }


        const courseId = req.params.id;
        const course = await CourseModel.findByIdAndUpdate(courseId,
            { $set: data },
            { new: true })


            res.status(201).json({
                sucess:true,
                course
            })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});