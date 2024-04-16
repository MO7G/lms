import userModel from "../models/user.model"
import { Response } from "express";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
// gett user by id 
export const getUserById = async (id: string, res: Response) => {
    //first try to fetch the user from our redis cache !!
    const userJson = await redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            sucess: true,
            user,
        })
    }
    //Todo: if redis didn't have my user i need another way to retrieve it !!
    // else {
    //     // but what if the redis cache was full can i handle this using the database directly or using a session on the server 
    //     // maybe i can store the session in the server momory or in the database !!

    //     const user = await userModel.findById(id);
    //     res.status(200).json({
    //         sucess: true,
    //         user,
    //     })
    // }


}


// get All usrs for admin 
export const getAllUsersServices =  async (res:Response) => {
    const users = await userModel.find().sort({createdAt:-1})

    res.status(201).json({
        sucess:true,
        users
    })
}


// get All usrs for admin 
export const updateUserRoleSerivce =  async (res:Response,id:string , role:string) => {
    const users = await userModel.findByIdAndUpdate(id,{role},{new:true })
    res.status(201).json({
        sucess:true,
        users
    })
}
