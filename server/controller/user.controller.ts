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
import Jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs"
import path from "path"
import sendMail from "../utils/sendMail"
import SendmailTransport from "nodemailer/lib/sendmail-transport";
import { exit } from "process";
import SubscriptionSet from "ioredis/built/SubscriptionSet";
import { isParseTreeNode } from "typescript";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.services";
import { error } from "console";
import cloudinary from "cloudinary"
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
            .catch((error: any) => {
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
        } catch (error: any) {
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



interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}



export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;
        const newUser: { user: IUser, activationCode: string } = Jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser, activationCode: string };

        // comparing between the activation code in the jwt payload and the activation token provided by the user !!
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code ", 400));
        }

        // check if the user exist or the email it self exist or not !! 
        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler("Email already exist", 400));
        }
        const user = await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            sucess: true,
            message: "Successfully Created A New User "
        })

    } catch (error: any) {
        console.log(error.message);
        next(new ErrorHandler("Can't activate the use ", 400));
    }
})



// Login user 
interface ILoginRequest {
    email: string,
    password: string
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and passwrod ", 400));
        }

        // the +password tells mongoose to explicitly include the password field in the query which is by default not included !!
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        // comparing the entered password after hashing it with the hashed password in the database !!!
        const isPasswordMatches = await user.comparePassword(password);

        if (!isPasswordMatches) {
            return next(new ErrorHandler("Invalid password", 400));
        }

        // custom function from the utils/jwt to send a cookies with token to the client !!
        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})



export const logout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        res.cookie("access_token", "", { maxAge: 1 })
        res.cookie("refresh_token", "", { maxAge: 1 })
        const userId = req.user?._id || '';
        console.log("this is the user id from the redis  ", userId)
        redis.del(userId);
        res.status(200).json({
            sucess: true,
            message: "Logged out successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})




export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = Jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = 'Could not refresh token';
        // if the refresh token is expired which is used to generate a new access token
        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }

        const session = await redis.get(decoded.id as string);

        //If the session is not in redis this means the user logged out because i only delete the session from redis when the user do
        // logout action !!
        if (!session) {
            return next(new ErrorHandler(message, 400));
        }

        // getting the redis session as an object
        const user = JSON.parse(session);
        // signing a new token using t  
        const accessToken = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: "5m" });

        const refreshToken = Jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: "3d" });
        // update our request user !!
        req.user = user;


        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            status: "success",
            accessToken
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})



// get user info
export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const userId = req.user?._id;
        getUserById(userId, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})



interface ISocialAuthBody {
    email: string,
    name: string,
    avatar: string
}
// social auth
// todo I must revisit this function after finishing the frontend !!!
export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, name, avatar } = req.body as ISocialAuthBody;
        const avatarLink = avatar;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar: { public_id: "tempfornow", url: avatarLink } });
            sendToken(newUser, 200, res);
        } else {
            sendToken(user, 200, res)
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})



interface IUpdateUserInfo {
    name?: string,
    email?: string,
}


// update user info
export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // todo: in this function in case the user updates his email we must send a verfication code to his email 
    // todo: so we can verfiy that his is using a valid email !!
    try {
        const { name, email } = req.body as IUpdateUserInfo;
        const userId = req.user?._id;
        const user = await userModel.findById(userId);

        // if you entered the email only and not the name
        if (email && user) {
            const isEmailExist = await userModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exist", 400));
            }
            user.email = email;
        }

        // if you entered the name and not the email
        if (name && user) {
            user.name = name;
        }

        // update the user in our db
        await user?.save();

        //update the redis cache
        await redis.set(userId, JSON.stringify(user));

        res.status(201).json({
            succes: true,
            user
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})




interface IUpdatePassword {
    oldPassword: string,
    newPassword: string
}
// update user info
export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword;

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("please enter old and new password", 400));
        }


        // the .select(+password) becasue the select method in the user model is false !!
        const user = await userModel.findById(req.user?._id).select("+password");

        // This will happen when the user is logged using a social Auth because in this case we will not store the password of the 
        // used social auth!!
        if (user?.password === 'undefined' || user?.password === 'null') {
            return next(new ErrorHandler("Invalid user", 400));
        }


        // comparing with the database password 
        const isPasswordMatches = await user?.comparePassword(oldPassword);

        if (!isPasswordMatches) {
            return next(new ErrorHandler("Invalid old password", 400));
        }

        // using this long conidition beacuse the user maybe null or something just avoiding typescript error 
        if (user !== null && user?.password !== 'undefined' && user?.password !== 'null') {
            user.password = newPassword;
        }

        // update database user model
        await user?.save();


        // update redis cache
        await redis.set(req.user?._id, JSON.stringify(user));

        res.status(201).json({
            sucess: true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})



interface IUpdateProfilePicture {
    avatar: string
}

// update user profile 
export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
       
        const { avatar } = req.body as IUpdateProfilePicture
       
        const userId = req.user?._id;
    
        const user = await userModel.findById(userId);
        console.log("i am here " )
        
        if (avatar && user) {
            // if user don't have avatar we will call this if 
            if (user?.avatar?.public_id) {
                // first we will delete the old image from the cloudinary and then upload the new one !!
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id,);
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: "150,"
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                }
            } else {
                // in this case there is no image in the cloudinary so just upload one !! 
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: "150,"
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                }
            }
        }

        // update the database and the redis cache
        await user?.save();
        await redis.set(userId,JSON.stringify(user));

        res.status(201).json({
            sucess:true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


