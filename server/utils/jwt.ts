require('dotenv').config();
import { Response, NextFunction, Request } from "express";
import { IUser } from "../models/user.model";
import { Token } from "nodemailer/lib/xoauth2";
import {redis} from "./redis"


interface ITokenOption {
    expires: Date,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none' | undefined,
    secure?: boolean
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
   
    console.log(user);
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();


    // upload station to redis 
     redis.set(user._id , JSON.stringify(user) as  any);



    // parse environment variables to integrates with fallback values !!
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRATION || '300', 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '300', 10);

    // options for cookies 
    const accessTokenOptions: ITokenOption = {
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax',
    }


    const refreshTokenOptions: ITokenOption = {
        expires: new Date(Date.now() + refreshTokenExpire * 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }


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