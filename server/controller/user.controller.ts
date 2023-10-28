/*
 * File: user.controller.ts
 * Description: This is the user controller 
 * Author: hajji
 * Date: 2023-10-20
 * Company: Mo7aMind
 * License: Mo7aMind
 */

// todo: I must change the logic flaw of the user creation here by first if the email exist in the database or not 
// todo: there is a flaw in this logic because what if the user exist and active then i am going to send a activation token to him 
// todo: which could lead to confusion and secruity issue !!
// todo: fix the behavior of logging in whe the user is already logged in !!!
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs"
import path from "path"
import sendMail from "../utils/sendMail"
import SendmailTransport from "nodemailer/lib/sendmail-transport";
import { exit } from "process";
import SubscriptionSet from "ioredis/built/SubscriptionSet";
import { isParseTreeNode } from "typescript";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
const fs = require('fs');
require('dotenv').config();

// Register User
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

/**
 * Registering new users 
 * Public-No Auth requied 
 * @param {Request} req - The HTTP request object with the user's updates.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
  * @returns {Object} An object containing the generated token and activation code.
 */
export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, avatar } = req.body as IRegistrationBody;
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exist", 400));
        }

        const user: IRegistrationBody = {
            name,
            email,
            password
        };

        console.log(user)
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode }
        
        const html = (await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)
        .then()
        .catch((error: any)=>{
            return next(new ErrorHandler(error.message, 400));
        }))
        try {
            // Todo: i need to fix the image is not attached with mail sent to the user 
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
                attachments: [
                    {
                        filename: 'email.png',
                        path: path.join(__dirname, 'email.png'), // Use a relative path to the image
                        cid: 'unique-image-id', // Use a unique identifier for the image (used in the EJS template)
                    },
                ],
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        } catch (error:any) {
            console.log(error.message)
        return next(new ErrorHandler(error.message, 400));
        }
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

})







/**
 * Create an activation token for a user that expires in 5 minute
 * @param {any} user - The user object for whom the activation token is generated.
 * @returns {Object} An object containing the generated token and activation code.
 */
interface IActivationToken {
    token: string;
    activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
    // random integer between 1000 and 9999.
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = Jwt.sign({
        user,
        activationCode
    }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" })
    return { token, activationCode };
}



interface IActivationRequest{
    activation_token: string;
    activation_code:string;
}



export const activateUser = CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;
        const newUser : {user: IUser , activationCode:string} = Jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
            ) as {user: IUser , activationCode:string};

        // comparing between the activation code in the jwt payload and the activation token provided by the user !!
        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler("Invalid activation code " , 400));
        }

        // check if the user exist or the email it self exist or not !! 
        const {name , email , password} = newUser.user;
        const existUser = await userModel.findOne({email});
        if(existUser){
            return next(new ErrorHandler("Email already exist" , 400));
        }
        const user = await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            sucess: true,
            message:"Successfully Created A New User "
        })

    } catch (error : any) {
        console.log(error.message);
        next(new ErrorHandler("Can't activate the use " , 400));
    }
})



// Login user 
interface ILoginRequest{
    email:string,
    password:string
}

export const loginUser = CatchAsyncError(async(req:Request, res:Response , next:NextFunction)=>{
    try {
        const {email , password} = req.body as ILoginRequest;

        if(!email || !password){
            return next(new ErrorHandler("Please enter email and passwrod ", 400));
        }

        // the +password tells mongoose to explicitly include the password field in the query which is by default not included !!
        const user = await userModel.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        // comparing the entered password after hashing it with the hashed password in the database !!!
        const isPasswordMatches = await user.comparePassword(password);

        if(!isPasswordMatches){
            return next(new ErrorHandler("Invalid password", 400));
        }

        // custom function from the utils/jwt to send a cookies with token to the client !!
        sendToken(user,200,res);
    } catch (error : any) {
        return next(new ErrorHandler(error.message , 400));
    }
})



export const logout =  CatchAsyncError(async(req:Request , res:Response , next:NextFunction)=>{
    try {
        res.cookie("access_token" , "" , {maxAge:1})
        res.cookie("refresh_token" , "" , {maxAge:1})
        const userId = req.user?._id || '';
        console.log("this is the user id from the redis  "  , userId)
       redis.del(userId);
        res.status(200).json({
            sucess: true,
            message:"Logged out successfully"
        })
    } catch (error : any) {
        return next(new ErrorHandler(error.message , 400));
    }
})