import { nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import subCategoryModel from "../../../db/models/subCategory.model.js";

//=============================== createCategory =========================================
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const categoryExist = await categoryModel.findOne({
    name: name.toLowerCase(),
  });
  categoryExist && next(new AppError("category already exist", 409));

  if (!req.file) {
    next(new AppError("image is required", 404));
  }

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${customId}`,
    }
  );
  req.filePath = `Ecommerce/categories/${customId}`; //not publicId cuz i need to delete image and folder but destroy delete images only

  const category = await categoryModel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
  });
  req.data = {
    model: categoryModel,
    id: category._id,
  };
  // const x = 4;
  // x = 5;
  //error
  res.status(201).json({ message: "done", category });
});

//=============================== updateCategory =========================================
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category) {
    next(new AppError("category not exist"));
  }

  if (name) {
    if (name.toLowerCase() === category.name) {
      return next(new AppError("name should be different"));
    }
    if (await categoryModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("name already exist"));
    }
    category.name = name.toLowerCase();
    category.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(category.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce/categories/${category.customId}`,
      }
    );
    category.image = { secure_url, public_id };
  }
  req.filePath = `Ecommerce/categories/${category.customId}`; 

  await category.save();
  req.data = {
    model: categoryModel,
    id: category._id,
  };
  return res.status(201).json({ message: "done", category });
});

//=============================== getCategories =========================================
export const getCategories = asyncHandler(async (req, res, next) => {
  // const categories = await categoryModel.find();
  // let list=[]
  // for (const category of categories) {
  //   //[{},{}]
  //   const subCategories=await subCategoryModel.find({category:category._id})
  //   const newCategory=category.toObject()
  //   newCategory.subCategories=subCategories
  //   list.push(newCategory)
  // }
  // res.status(201).json({ message: "done", categories:list });
  const categories = await categoryModel
    .find()
    .populate([{ path: "subCategories" }]); //virtual name

  res.status(201).json({ message: "done", categories });

});

//=============================== deleteCategory =========================================
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!category) {
    return next(new AppError("category isn't exist", 401));
  }
  req.data = {
    model: categoryModel,
    id: category._id,
  };
  //delete subCategories related with this category
  await subCategoryModel.deleteMany({ category: category._id });

  //delete from cloudinary category.customId delete images makes it empty
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}`
  );
  //delete folder
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}`
  );
  req.filePath = `Ecommerce/categories/${category.customId}`; 

  res.status(201).json({ message: "done" });
});
