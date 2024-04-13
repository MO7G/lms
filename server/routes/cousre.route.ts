import express from "express";
import { uploadCourse,editCourse, getSingleCourse, getAllCourses,getCourseByUser, addQuestion, addAnswerQuestion } from "../controller/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { isatty } from "tty";

const courseRouter = express.Router();






courseRouter.post('/createCourse', isAuthenticated, authorizeRoles("admin"), uploadCourse );
courseRouter.put('/editCourse/:id', isAuthenticated, authorizeRoles("admin"), editCourse );
courseRouter.get('/getCourse/:id', getSingleCourse );
courseRouter.get('/getAllCourses', getAllCourses );
courseRouter.get('/getCourseContent/:id', isAuthenticated, getCourseByUser );
courseRouter.post('/addQuestion', isAuthenticated, addQuestion );
courseRouter.post('/addAnswer', isAuthenticated, addAnswerQuestion );




export default courseRouter; 