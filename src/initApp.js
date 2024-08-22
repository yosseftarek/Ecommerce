import connectionDB from "../db/connection.js";
import { AppError } from "../src/utils/classError.js";
import { GlobalErrorHandler } from "../src/utils/asyncHandler.js";
import * as routers from "../src/modules/index.routes.js";
import { deleteFromCloudinary } from "./utils/deleteFromCloudinary.js";
import { deleteFromDataBase } from "./utils/deleteFromDataBase.js";
import cors from "cors";

export const initApp = (express, app) => {

  app.use(cors());
  
  app.use((req, res, next) => {
    if (req.originalUrl == "/oders/webhook") {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  app.get("/", (req, res) => {
    res.status(200).json({ message: "server is running" });
  });
  //connect to db
  connectionDB();

  //routes
  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);
  app.use("/products", routers.productRouter);
  app.use("/coupons", routers.couponRouter);
  app.use("/carts", routers.cartRouter);
  app.use("/orders", routers.orderRouter);
  app.use("/reviews", routers.reviewRouter);
  app.use("/wishList", routers.wishListRouter);

  //handle invalid URLs.
  app.use("*", (req, res, next) => {
    next(new AppError(`inValid url ${req.originalUrl}`));
  });

  //GlobalErrorHandler
  app.use(GlobalErrorHandler, deleteFromCloudinary, deleteFromDataBase);
};
