import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/cousre.model";
import path from "path";
import ejs from "ejs"
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrdersServices, newOrder } from "../services/order.service";
import SendmailTransport from "nodemailer/lib/sendmail-transport";
import { randomUUID } from "crypto";




// create the order
export const createOrder = CatchAsyncError(async (req:Request , res:Response , next:NextFunction)=>{
    try{
        const {courseId,paymentInfo} = req.body as IOrder;
        console.log("we are here for now  1")

        const user = await userModel.findById(req.user?._id);
        const cousreExistInUser = user?.courses.some((course:any)=>course._id.toString() === courseId.toString());
        console.log("we are here for now  2")


        // the user already purchased this cours
        if(cousreExistInUser){
            return next(new ErrorHandler("You already purchased this course",400));
        }
        console.log("we are here for now  3")


        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }

        console.log("we are here for now  4")


        const data:any = {
            courseId: course._id,
            userId: user?._id,
            transactionId: randomUUID()
        }
        
        console.log("we are here for now  5")

        const mailData = {
            order:{
                _id: course._id.toString().slice(0,6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
            }
        }

        console.log("we are here for now  6")

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'),{order:mailData});


        try {
            if(user){
                await sendMail({
                    email:user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data:mailData,
                    attachments:[]
                });
            }
        } catch (error:any) {
            return next( new ErrorHandler(error.message , 500));
        }
        console.log("we are here for now  83")
        user?.courses.push(course?._id)
        await user?.save();
        console.log("we are here for now  844")
        const notification = await NotificationModel.create({
            userId: user?._id,
            title:"New Order",
            message:`You have a new Order from ${course?.name}`
        });
        console.log("we are here for now  8")


        if (course && course.purchased !== undefined) {
            course.purchased += 1;
        }
        await course.save();
        newOrder(data,res,next);
    }catch (error :any){

    }
})





// get All orders --- only for admin 

export const getAllOrders= CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrdersServices(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})
