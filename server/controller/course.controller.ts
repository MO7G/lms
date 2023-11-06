import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary"
import { createCourse } from "../services/course.service";
import CourseModel from "../models/cousre.model";
import { redis } from "../utils/redis";






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
        if (Object.keys(data).length === 0) {
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
            sucess: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


// get single course --- without  purchasing 
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try{const courseId = req.params.id;
        

        // we should first check the redis cache before retrieving from db
        const isCacheExist = await redis.get(courseId);
        if(isCacheExist){
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                sucess:true,
                course
            })
        }else{
            const course = await CourseModel.findById(courseId)
            .select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links");
        res.status(200).json({
            sucess: true,
            course
        })                           
        }


        

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));

    }
})


// get all course --- with  purchasing 
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const courses = await  CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links")

        console.log("this is it man " ,courses)
        res.status(200).json({
            sucess: true,
            courses
        })

    } catch (error: any) {
        return next(new ErrorHandler("Mo7a says the error is  " + error.message, 500));

    }
})