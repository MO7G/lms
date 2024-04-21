import express from "express";
import { uploadCourse,editCourse, getSingleCourse, getAllCourses,getCourseByUser, addQuestion, addAnswerQuestion, addReview, addReplyToReview,getCourses, deleteCourse} from "../controller/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { isatty } from "tty";
import { getUserAnalytics,getCoursesAnalytics,getOrderAnalytics } from "../controller/analytics.controller";


const analyticsRouter = express.Router();

analyticsRouter.get('/getUserAnalytics', isAuthenticated, authorizeRoles("admin"), getUserAnalytics );
analyticsRouter.get('/getCoursesAnalytics', isAuthenticated, authorizeRoles("admin"), getCoursesAnalytics );
analyticsRouter.get('/getOrdersAnalytics', isAuthenticated, authorizeRoles("admin"), getOrderAnalytics );


export default analyticsRouter;  