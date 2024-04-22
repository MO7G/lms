import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controller/layout.controller";
import { editCourse } from "../controller/course.controller";
const layoutRouter = express.Router();


layoutRouter.get("/createLayout",isAuthenticated,authorizeRoles("admin"),createLayout);
layoutRouter.get("/editLayout",isAuthenticated,authorizeRoles("admin"),editLayout);
layoutRouter.get("/getLayout",getLayoutByType);




export default layoutRouter

