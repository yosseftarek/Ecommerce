import express from "express";
import * as OV from "./order.validation.js";
import * as OC from "./order.controller.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const orderRouter = express.Router();
// const orderRouter = express.Router({caseSensitive:true});

orderRouter.post(
  "/",
  validation(OV.createOrder),
  auth([systemRoles.user]),
  OC.createOrder

);
orderRouter.put(
  "/:id",
  validation(OV.cancelOrder),
  auth([systemRoles.user]),
  OC.cancelOrder

);
export default orderRouter;
