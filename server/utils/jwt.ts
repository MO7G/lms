require('dotenv').config();
import { Response, NextFunction, Request } from "express";
import { IUser } from "../models/user.model";
import { Token } from "nodemailer/lib/xoauth2";
import { redis } from "./redis"
import  Jwt  from "jsonwebtoken";


interface ITokenOption {
    expires: Date,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none' | undefined,
    secure?: boolean
}


// parse environment variables to integrates with fallback values !!
export const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRATION || '300', 10);
export const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '300', 10);




// options for cookies 
export const accessTokenOptions: ITokenOption = {
    // Date.now() returns timestamp in milliseconds that why we need to convert the accessTokenExpire to millisecond
    // ex if accessTokenExpire = 5m then => 5*60 means 300 seconds => 300 *  1000 means 300,000 milliseconds which is === 5 minutes !!!
    expires: new Date(Date.now() + (accessTokenExpire * 60 * 1000)),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
}


export const refreshTokenOptions: ITokenOption = {
    // Date.now() returns timestamp in milliseconds that why we need to convert the accessTokenExpire to millisecond
    // ex if refreshToken = 3d => 3 * 24 = 72 hours * 60 = 4320 minutes * 60 = 259,200 seconds * 1000 = (259,2e+8 milliseconds) === 3 days 
    expires: new Date(Date.now() + (refreshTokenExpire * 24 * 60 * 60 * 1000)),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {

    console.log(user);
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();


    // upload station to redis 
    redis.set(user._id, JSON.stringify(user) as any);

    const temp = new Date(Date.now() + (accessTokenExpire * 60 * 1000))
    console.log("this is the duraction of the access token " , temp)



    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }


    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        sucess: true,
        user,
        accessToken
    })
}