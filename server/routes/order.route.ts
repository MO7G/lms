import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { isatty } from "tty";
import { createOrder } from "../controller/order.controller";

const orderRouter = express.Router();



orderRouter.post("/createOrder", isAuthenticated,createOrder)

export default orderRouter;  