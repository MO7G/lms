import express from "express";
import { editCourse } from "../controller/course.controller";
import { activationMailTemplate, orderConfirmationTemplate, questionReplyTemplate, showTemplates } from "../controller/testing.controller";
const testingRouter = express.Router();



// ejs templates for review
testingRouter.get("/template",showTemplates);
testingRouter.get("/template/activation-mail",activationMailTemplate);
testingRouter.get("/template/order-confirmation",orderConfirmationTemplate);
testingRouter.get("/template/question-reply",questionReplyTemplate);


export default testingRouter

