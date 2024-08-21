import express from "express";
import * as CV from "./coupon.validation.js";
import * as CC from "./coupon.controller.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const couponRouter = express.Router({});
// const couponRouter = express.Router({caseSensitive:true});

couponRouter.post(
  "/",
  validation(CV.createCoupon),
  auth([systemRoles.admin]),
  CC.createCoupon
);

couponRouter.put(
  "/:id",
  validation(CV.updateCoupon),
  auth([systemRoles.admin]),
  CC.updateCoupon
);
couponRouter.delete(
  "/:id",
  auth([systemRoles.admin]),
  CC.deleteCoupon
);
export default couponRouter 