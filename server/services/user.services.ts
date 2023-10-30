import userModel from "../models/user.model"
import { Response } from "express";
// gett user by id 
export const getUserById =async( id: string, res:Response)=>{
    const user = await userModel.findById(id);
    res.status(200).json({
        sucess:true,
        user,
    })
}