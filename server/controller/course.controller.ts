import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/cousre.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import { constrainedMemory } from "process";
import { isConstructSignatureDeclaration } from "typescript";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

// upload course
export const uploadCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courseData = req.body;
            const cousreThumbnail = courseData.thumbnail;
            if (cousreThumbnail) {
                const myCloud = await cloudinary.v2.uploader.upload(cousreThumbnail, {
                    folder: "course",
                });
                courseData.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            createCourse(courseData, res, next);
        } catch (error: any) {
            console.log(error);
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// edit course
export const editCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
                    folder: "courses",
                });

                // will be stored in the database !!!
                data.thumbnail = {
                    publid_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }

            const courseId = req.params.id;
            const course = await CourseModel.findByIdAndUpdate(
                courseId,
                { $set: data },
                { new: true }
            );

            res.status(201).json({
                sucess: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// get single course --- without  purchasing
export const getSingleCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courseId = req.params.id;
            // we should first check the redis cache before retrieving from db
            const isCacheExist = await redis.get("courseId");
            console.log("isCahsedExit ", isCacheExist);
            if (isCacheExist) {
                const course = JSON.parse(isCacheExist);
                console.log("hitting redis")
                res.status(200).json({
                    sucess: true,
                    course,
                });
            } else {
                // The reason why we are deselecting the following fields is because we don't want to make the user see this sensetive information
                // If he didn't purchase the course in the first place !!
                const course = await CourseModel.findById(courseId).select(
                    "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
                );
                // If database don't contain any courses
                if (!course) {
                    return res.status(404).json({
                        success: false,
                        error: "Course not found",
                    });
                }
                console.log("hitting mongodb")

                // Cache the fetched data in Redis
                await redis.set("courseId", JSON.stringify(course));

                // Return the course data
                res.status(200).json({
                    success: true,
                    course,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// get all course --- with  purchasing
export const getAllCourses = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isCacheExist = await redis.get("allCourses");
            if (isCacheExist) {
                const courses = JSON.parse(isCacheExist);
                console.log("hitting redis ")
                res.status(200).json({
                    sucess: true,
                    courses,
                });
            } else {
                // The reason why we are deselecting the following fields is because we don't want to make the user see this sensetive information
                // If he didn't purchase the course in the first place !!
                const courses = await CourseModel.find().select(
                    "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
                );

                console.log("hitting mongodb ")
                // Cache the fetched data in Redis
                await redis.set("allCourses", JSON.stringify(courses));
                res.status(200).json({
                    sucess: true,
                    courses,
                });
            }
        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
);



export const getCourseByUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const userCourseList = req.user?.courses;
            console.log("this is the request user ", req.user?.courses)
            const courseId = req.params.id;
            const courseExists = userCourseList?.find((course: any) => course._id.toString() === courseId);
            console.log("the course id is ", courseExists);

            if (!courseExists) {
                return next(new ErrorHandler("You are not eligible to access this course ", 404));
            }

            const course = await CourseModel.findById(courseId);
            const content = course?.courseData;

            res.status(200).json({
                sucess: true,
                content,
            })

        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
);




interface IAddQuestion {
    question: string;
    courseId: string;
    contentId: string;
}
export const addQuestion = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { question, courseId, contentId }: IAddQuestion = req.body;
            const course = await CourseModel.findById(courseId);

            // here we are just checking if the id of the content if valid or not 
            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }


            const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

            // create a new question object
            const newQuestion: any = {
                user: req.user,
                question,
                questionReplies: [],
            }


            // add this question to our course content 
            courseContent?.questions.push(newQuestion);
            // save the updated course
            await course?.save();

            res.status(200).json({
                success: true,
                course,
            })

        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
);



interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}
export const addAnswerQuestion = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

            // fetch the course
            const course = await CourseModel.findById(courseId);

            // here we are just checking if the id of the content if valid or not 
            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }


            const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));


            if (!courseContent) {
                return next(new ErrorHandler("Invalid content it ", 400));
            }

            // finding the question 
            const question = courseContent?.questions?.find((item: any) =>
                item._id.equals(questionId));

            if (!question) {
                return next(new ErrorHandler("Invalid question it ", 400));

            }


            // creating a new question object
            const newAnswer: any = {
                user: req.user,
                answer,
            }


            question.questionReplies.push(newAnswer)

            // save the updated course
            await course?.save();

            // jf this is satisfied this means that the question owner is adding the annswer no need to send an email to the user.
            if (req.user?._id === question.user._id) {
                // create a notifcation 
                console.log("this is called later admin ");


            } else {

                const data = {
                    name: question.user.name,
                    title: courseContent.title,
                    questions: [] // Add the questions array here
                };

                console.log("this is called later 1 ");

                const html = (await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)
                    .then()
                    .catch((error: any) => {
                        console.log("this is an error from direct file  ", error)
                        return next(new ErrorHandler(error.message, 400));
                    }))
                console.log("this is called later 2");

                try {
                    // Todo: i need to fix the image is not attached with mail sent to the user
                    console.log("this is the user email to be sent");
                    console.log(question.user.email)
                    await sendMail({
                        email: question.user.email,
                        subject: "Question Reply",
                        template: "question-reply.ejs",
                        data,
                        attachments: [
                            {
                                filename: 'email.png',
                                path: path.join(__dirname, 'email.png'), // Use a relative path to the image
                                cid: 'unique-image-id', // Use a unique identifier for the image (used in the EJS template)
                            },
                        ],
                    });
                    console.log("this is called later 3");

                } catch (error: any) {
                    console.log("this is error ", error)
                    new ErrorHandler("Mo7a says the error is  " + error.message, 500)
                }
            }




            res.status(200).json({
                success: true,
                course,
            })

        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
);





interface IAddReviewData {
    review: string;
    rating: number;
    userId: string
}
export const addReview = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const userCourseList = req.user?.courses;
            const courseId = req.params.id;


            console.log(courseId)
            console.log(userCourseList)
            const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());
            console.log("this is the course eixt ", courseExists)


            if (!courseExists) {
                return next((new ErrorHandler("You are not eligible to access this course ", 400)));
            }

            const course = await CourseModel.findById(courseId)

            const { review, rating } = req.body as IAddReviewData;

            const reviewData: any = {
                user: req.user,
                rating,
                comment: review,
            }
            console.log("this is the course ", course);
            course?.reviews.push(reviewData);

            let avg = 0;
            course?.reviews.forEach((rev: any) => {
                avg += rev.rating;
            })

            if (course && course.courseRating) {
                const currentRating = course.courseRating.currentRating;
                const totalRating = course.courseRating.totalRating;

                // Increment totalCount by 1 even its a base case which is 0 we will avoid dividing by zero
                course.courseRating.totalCount++;

                // Update currentRating based on the new totalCount
                course.courseRating.currentRating = (totalRating + rating) / course.courseRating.totalCount;

                // Update totalRating
                course.courseRating.totalRating += rating;

                await course?.save();
            }





            const notifcation = {
                title: "New Review Received",
                message: `${req.user?.name} has given a review on your ${course?.name}`,
            }


            // create a notification 
            res.status(200).json({
                success: true,
                course,
            })

        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
);



interface IAddReviewData {
    comment: string;
    courseId: number;
    reviewId: string
}
// add reply in reviews by the admin
export const addReplyToReview = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
        const {comment , courseId ,  reviewId } = req.body as IAddReviewData

        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course Not found ", 404));
        }

        console.log("this is the review" , course?.reviews);
        console.log("this is sent one from client " , reviewId)

        const review = course?.reviews.find((rev:any) => rev._id.toString() === reviewId.toString())


        if(!review){
            return next(new ErrorHandler("Review Not found ", 404));
        }


        const replyData : any= {
            user: req.user,
            comment,
        }

        course?.reviews.push(replyData);

        await course.save();


        res.status(200).json({
            success: true,
            course,
        })

        } catch (error: any) {
            return next(
                new ErrorHandler("Mo7a says the error is  " + error.message, 500)
            );
        }
    }
); 