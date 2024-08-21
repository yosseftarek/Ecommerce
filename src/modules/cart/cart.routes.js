import express from "express";
import * as CV from "./cart.validation.js";
import * as CC from "./cart.controller.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const cartRouter = express.Router({});
// const cartRouter = express.Router({caseSensitive:true});

cartRouter.post(
  "/",
  validation(CV.createCart),
  auth([systemRoles.user]),
  CC.createCart
);

cartRouter.patch(
  "/",
  validation(CV.removeCart),
  auth([systemRoles.user]),
  CC.removeCart
);

cartRouter.put(
  "/",
  validation(CV.clearCart),
  auth([systemRoles.user]),
  CC.clearCart
);
export default cartRouter;
