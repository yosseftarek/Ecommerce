import express from "express";
import * as CV from "./category.validation.js";
import * as CC from "./category.controller.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, validExtensions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import subCategoryRouter from "../subCategory/subCategory.routes.js";
import { systemRoles } from "../../utils/systemRoles.js";

const categoryRouter = express.Router({caseSensitive:true});

categoryRouter.use("/:categoryId/subCategories", subCategoryRouter);

categoryRouter.post(
  "/",
  multerHost(validExtensions.image).single("image"),
  validation(CV.createCategory),
  auth([systemRoles.admin]),
  CC.createCategory
);

categoryRouter.get(
  "/",
  auth(Object.values(systemRoles)),
  CC.getCategories
);

categoryRouter.put(
  "/:id",
  multerHost(validExtensions.image).single("image"),
  validation(CV.updateCategory),
  auth([systemRoles.admin]),
  CC.updateCategory
);

categoryRouter.delete("/:id", auth([systemRoles.admin]), CC.deleteCategory);
export default categoryRouter;
