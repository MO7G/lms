import express from "express";
import { registrationUser , activateUser , loginUser , logout, updateAccessToken, getUserInfo} from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();






userRouter.post('/registration', registrationUser );
userRouter.post('/activate-user', activateUser );
userRouter.post('/login', loginUser );
userRouter.post('/logout',isAuthenticated,authorizeRoles("user"), logout);
// the following function if you want to enforce roles to the routes  !!
// todo: userRouter.post('/logout',isAuthenticated,authorizeRoles("admin"), logout);
userRouter.get('/refreshtoken' ,  updateAccessToken);
userRouter.get('/userinfo' ,isAuthenticated ,  getUserInfo);


 

export default userRouter;