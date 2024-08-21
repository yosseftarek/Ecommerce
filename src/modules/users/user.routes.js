import express from "express";
import * as UC from "./user.controller.js";
import * as UV from "./user.validation.js";
import { validation } from "../../middleware/validation.js";

const userRouter = express.Router();
userRouter.post("/signup", validation(UV.signup), UC.signup);
userRouter.get("/verifyEmail/:token", UC.verifyEmail);
userRouter.get("/refreshToken/:rfToken", UC.refreshToken);
userRouter.patch("/sendCode", validation(UV.forgetPassword), UC.forgetPassword);
userRouter.patch(
  "/resetPassword",
  validation(UV.resetPassword),
  UC.resetPassword
);
userRouter.post("/signin", validation(UV.signin), UC.signin);

export default userRouter;
