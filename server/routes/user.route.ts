import express from "express";
import { registrationUser , activateUser} from "../controller/user.controller";

const userRouter = express.Router();






userRouter.post('/registration', registrationUser );
userRouter.post('/activate-user', activateUser );


export default userRouter;