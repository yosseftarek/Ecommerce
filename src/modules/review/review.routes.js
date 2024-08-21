import express from "express";
import * as RV from "./review.validation.js";
import * as RC from "./review.controller.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const reviewRouter = express.Router({mergeParams:true});
// const reviewRouter = express.Router({caseSensitive:true});

reviewRouter.post(
  "/",
  validation(RV.createReview),
  auth([systemRoles.user]),
  RC.createReview
);

reviewRouter.delete(
  "/:id",
  validation(RV.deleteReview),
  auth([systemRoles.user]),
  RC.deleteReview
);
reviewRouter.put(
  "/:id",
  validation(RV.updateReview),
  auth([systemRoles.user]),
  RC.updateReview
);
export default reviewRouter 