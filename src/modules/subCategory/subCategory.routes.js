import express from "express";
import * as SCV from "./subCategory.validation.js";
import * as SCC from "./subCategory.controller.js";
import { auth } from "../../middleware/auth.js";
import { multerHost, validExtensions } from "../../middleware/multer.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const subCategoryRouter = express.Router({ mergeParams: true }); //takes all params { categoryId: '66a79e6a4d0c3a178830e91f', id: '1' }

subCategoryRouter.post(
  "/",
  multerHost(validExtensions.image).single("image"),
  validation(SCV.createSubCategorySchema),
  auth([systemRoles.admin]),
  SCC.createSubCategory
);

subCategoryRouter.get(
  "/",
  auth([systemRoles.admin]),
  SCC.getSubCategories
);

subCategoryRouter.put(
  "/:id",
  multerHost(validExtensions.image).single("image"),
  validation(SCV.updateSubCategorySchema),
  auth([systemRoles.admin]),
  SCC.updatesubCategory
);
subCategoryRouter.delete("/:id", auth([systemRoles.admin]), SCC.deleteSubCategories);
export default subCategoryRouter;
