import { NextFunction, Response } from "express";
import CourseModel from "../models/cousre.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import {redis} from "../utils/redis";



// create course
export const createCourse = CatchAsyncError(async( data:any  ,res:Response)=>{
    const course = await CourseModel.create(data);
    res.status(201).json({
        sucess:true,
        course
    });
});


// get All usrs 
export const getAllCourseServices =  async (res:Response) => {
    const courses = await CourseModel.find().sort({createdAt:-1})

    res.status(201).json({
        sucess:true,
        courses
    })
}



// delete Course
export const deleteCourseService =  async (res:Response , courseId: string , next:NextFunction) => {
    const course = await CourseModel.findById(courseId)
    if(!course){
        return next(new ErrorHandler("Course is not found "  , 404));
    }
    await course.deleteOne({courseId});
    await redis.del(courseId)
    
    res.status(201).json({
        sucess:true,
        message: "Course was deleted Successfully"
    })
}