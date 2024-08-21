import { nanoid } from "nanoid";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import categoryModel from "../../../db/models/category.model.js";

//=============================== createSubCategory =========================================
export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  // console.log(req.params);//{}
  // console.log(req.originalUrl);// /categories/66a79e6a4d0c3a178830e91f/subCategories split '/'
  const categoryExist = await categoryModel.findById(req.params.categoryId);
  if (!categoryExist) {
    return next(new AppError("Category not exist", 409));
  }
  const subCategoryExist = await subCategoryModel.findOne({
    name: name.toLowerCase(),
  });
  subCategoryExist && next(new AppError("subCategory already exist", 409));

  if (!req.file) {
    next(new AppError("image is required", 404));
  }
  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${customId}`,
    }
  );
  req.filePath = `Ecommerce/categories/${categoryExist.customId}/subCategories/${customId}`; 
  const subCategory = await subCategoryModel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    category: req.params.categoryId,
    createdBy: req.user._id,
  });
  req.data = {
    model: subCategoryModel,
    id: subCategory._id,
  };
  // const x=4
  // x=5
  res.status(201).json({ message: "done", subCategory });
});

//=============================== updatesubCategory =========================================
export const updatesubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const subCategory = await subCategoryModel.findById(id);
  if (!subCategory) {
    next(new AppError("subCategory not exist"));
  }

  if (name) {
    if (name.toLowerCase() === subCategory.name) {
      return next(new AppError("name should be different"));
    }
    if (await subCategoryModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("name already exist"));
    }
    subCategory.name = name.toLowerCase();
    subCategory.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce/categories/${subCategory.customId}`,
      }
    );
    subCategory.image = { secure_url, public_id };
  }
  await subCategory.save();
  return res.status(201).json({ message: "done", subCategory });
});

//=============================== getSubCategories =========================================
export const getSubCategories = asyncHandler(async (req, res, next) => {
  const categories = await subCategoryModel.find({}).populate([
    {
      path: "category",
      select: "name -_id",
    },
    {
      path: "createdBy",
      select: "name -_id",
    },
  ]);

  res.status(201).json({ message: "done", categories });
});

//=============================== deleteSubCategories =========================================
export const deleteSubCategories = asyncHandler(async (req, res, next) => {
  const { id, categoryId } = req.params;
  const subCategory = await subCategoryModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!subCategory) {
    return next(new AppError("subCategory isn't exist", 401));
  }
  const category = await categoryModel.findOne({ _id: categoryId });
  if (!category) {
    return next(new AppError("category isn't exist", 401));
  }
  //delete from cloudinary category.customId delete images makes it empty
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}`
  );
  //delete folder
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}`
  );
  await subCategoryModel.deleteOne({ _id: id });
  res.status(201).json({ message: "done" });
});
