import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { isatty } from "tty";
import { createOrder, getAllOrders } from "../controller/order.controller";

const orderRouter = express.Router();



orderRouter.post("/createOrder", isAuthenticated,createOrder)
orderRouter.get("/getOrders", isAuthenticated,authorizeRoles("admin"),getAllOrders)

export default orderRouter;  