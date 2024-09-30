import express from "express";
import * as WV from "./wishList.validation.js";
import * as WC from "./wishList.controller.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const wishListRouter = express.Router({mergeParams:true});
// const wishListRouter = express.Router({caseSensitive:true});

wishListRouter.post(
  "/",
  validation(WV.createWishList),
  auth([systemRoles.user]),
  WC.createWishList
);

wishListRouter.put(
  "/",
  validation(WV.removeWishList),
  auth([systemRoles.user]),
  WC.removeWishList
);

wishListRouter.get(
  "/",
  validation(WV.getWishList),
  auth([systemRoles.user]),
  WC.getWishList
);
export default wishListRouter;
