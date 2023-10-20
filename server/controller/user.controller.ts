/*
 * File: user.controller.ts
 * Description: This is the user controller 
 * Author: hajji
 * Date: 2023-10-20
 * Company: Mo7aMind
 * License: Mo7aMind
 */


import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs"
import path from "path"


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
export const registrationUser = CatchAsyncError(async (req: Request, res: Response : next: NextFunction) => {
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

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;    
        const data = {user:{name:user.name} , activationCode};

        const html = await ejs.renderFile(path.join(__dirname,""));
        
    
        

    } catch (error: any) {

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