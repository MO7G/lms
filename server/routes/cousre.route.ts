import express from "express";
import { uploadCourse,editCourse } from "../controller/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { isatty } from "tty";

const courseRouter = express.Router();






courseRouter.post('/createCourse', isAuthenticated, authorizeRoles("admin"), uploadCourse );
courseRouter.put('/editCourse/:id', isAuthenticated, authorizeRoles("admin"), editCourse );


export default courseRouter;