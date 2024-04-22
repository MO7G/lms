import { NextFunction, Request, Response } from "express";
import { CatchAsyncError, CatchAsyncErrorWithOptions, AsyncHandlerOptions } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";
import layoutRouter from "../routes/layout.route";
import { isTypeParameterDeclaration } from "typescript";

// create layout
export const createLayout = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        console.log("i am here ")
        try {
            let { type } = req.body;
            type = type.toLowerCase();
            const isTypeExist = await LayoutModel.findOne({ type: { $regex: new RegExp("^" + type, "i") } });
            if(isTypeExist){
                return next(new ErrorHandler(`${type} already exist`,400))
            }
            if (type == "banner") {
                const { image, title, subTitle } = req.body;
                // uploading the image to our cloud
                const myCloud = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout",
                });
                const banner = {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                };
                await LayoutModel.create(banner);
            }

            if (type === "faq") {
                const {faq} = req.body;
                // no need to map the array again we are going to store it directly in the database 
                // const faqItems = await Promise.all(
                //     faq.map(async(item:any)=>{
                //         return{
                //             question:item.question,
                //             answer:item.answer
                //         }
                //     })
                // )
                const finalFaqItem ={
                    type:"FAQ",
                    faq:faq
                }
                
                await LayoutModel.create(finalFaqItem)
            }
            if (type === "categories") {
                const { categories } = req.body;
                const finalCategoriesItem = {
                    type:"Categories",
                    categories:categories
                }
            await LayoutModel.create(finalCategoriesItem);
            }

            res.status(201).json({
                success: true,
                message: `Layout Was Created Successfully`,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// edit layout
export const editLayout = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { type } = req.body;
            type = type.toLowerCase();
            const isTypeExist:any = await LayoutModel.findOne({ type: { $regex: new RegExp("^" + type, "i") } });
            if(!isTypeExist){
                return createLayout(req,res,next);
            }

            if (type == "banner") {
                const { image, title, subTitle } = req.body;
                // first we need to fetch the banner from the database so we can delete it from cloudinary
                

                // deleting the old banner from cloudinary
                await cloudinary.v2.uploader.destroy(isTypeExist?.image.public_id)

                // uploading the new image to cloudinary
                const myCloud = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout",
                });

                // creating the banner object
                const banner = {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                };
                // storing the banner object instead of the old one busing finding the old one and updating it !!!
                await LayoutModel.findByIdAndUpdate(isTypeExist._id, {banner});
            }

            if (type === "faq") {
                const {faq} = req.body;
                    const finalFaqItem ={
                        type:"FAQ",
                        faq:faq
                    }
                    await LayoutModel.findByIdAndUpdate(isTypeExist?._id,finalFaqItem)
            }
            if (type === "categories") {
                const { categories } = req.body;
                const finalCategoriesItem = {
                    type:"Categories",
                    categories:categories
                }
            await LayoutModel.findByIdAndUpdate(isTypeExist?._id,finalCategoriesItem);
            }
            res.status(201).json({
                success: true,
                message: "Layout Updated Successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// get layout By type
export const getLayoutByType = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {type} = req.body
            const layout = await LayoutModel.findOne({type:{$regex: new RegExp("^"+type,"i")}})
            res.status(201).json({
                sucess:true,
                layout
            })
        } catch (error:any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);