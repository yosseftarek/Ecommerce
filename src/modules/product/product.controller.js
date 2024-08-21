import { nanoid } from "nanoid";
import productModel from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import brandModel from "../../../db/models/brand.model.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";

//=============================== createProduct =========================================
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    stock,
    discount,
    price,
    brand,
    subCategory,
    category,
    description,
    title,
  } = req.body;

  //check if category exist
  const categoryExist = await categoryModel.findOne({ _id: category });
  if (!categoryExist) {
    return next(new AppError("category is not exist", 404));
  }

  //check if subCategory exist
  const subCategoryExist = await subCategoryModel.findOne({
    _id: subCategory,
    category,
  });
  if (!subCategoryExist) {
    return next(new AppError("subCategory is not exist", 404));
  }

  //check if brand exist
  const brandExist = await brandModel.findOne({ _id: brand });
  if (!brandExist) {
    return next(new AppError("brand is not exist", 404));
  }

  //check if product exist
  const productExist = await productModel.findOne({
    title: title?.toLowerCase(),
  });
  if (productExist) {
    return next(new AppError("product already exist", 404));
  }

  const subPrice = price - (price * (discount || 0)) / 100;

  if (!req.files) {
    return next(new AppError("image is required", 404));
  }

  const customId = nanoid(5);
  let list = [];
  for (const file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/coverImages`,
      }
    );
    list.push({ secure_url, public_id });
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/mainImage`,
    }
  );
  req.filePath = `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/mainImage`;

  const product = await productModel.create({
    title,
    slug: slugify(title, {
      replacement: "_",
      lower: true,
    }),
    description,
    price,
    discount,
    subPrice,
    stock,
    category,
    subCategory,
    brand,
    image: { secure_url, public_id },
    coverImages: list,
    customId,
    createdBy: req.user._id,
  });
  req.data = {
    model: productModel,
    id: product._id,
  };
  res.status(201).json({ message: "done", product });
});

//=============================== updateProduct =========================================
export const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    stock,
    discount,
    price,
    brand,
    subCategory,
    category,
    description,
    title,
  } = req.body;

  const { id } = req.params;
  //check if category exist
  const categoryExist = await categoryModel.findOne({ _id: category });
  if (!categoryExist) {
    return next(new AppError("category is not exist", 404));
  }

  //check if subCategory exist
  const subCategoryExist = await subCategoryModel.findOne({
    _id: subCategory,
    category,
  });
  if (!subCategoryExist) {
    return next(new AppError("subCategory is not exist", 404));
  }

  //check if brand exist
  const brandExist = await brandModel.findOne({ _id: brand });
  if (!brandExist) {
    return next(new AppError("brand is not exist", 404));
  }

  //check if product exist
  const product = await productModel.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  if (!product) {
    return next(new AppError("product is not exist", 404));
  }

  if (title) {
    if (title.toLowerCase() == product.title) {
      return next(new AppError("title match the old one", 409));
    }
    if (await productModel.findOne({ title: title.toLowerCase() })) {
      return next(new AppError("title already exist before", 409));
    }
    product.title = title.toLowerCase();
    product.slug = slugify(title, {
      replacement: "_",
      lower: true,
    });
  }
  if (description) {
    product.description = description;
  }
  if (stock) {
    product.stock = stock;
  }
  if (price && discount) {
    product.subPrice = price - price * (discount / 100);
    product.price = price;
    product.discount = discount;
  }
  if (price) {
    product.subPrice = price - price * (product.discount / 100);
    product.price = price;
  }
  if (discount) {
    product.subPrice = product.price - product.price * (discount / 100);
    product.discount = discount;
  }

  if (req.files) {
    if (req.files?.image) {
      await cloudinary.uploader.destroy(product.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/mainImage`,
        }
      );
      product.image = { secure_url, public_id };
    }
  }
  if (req.files?.coverImages?.length) {
    await cloudinary.api.delete_resources_by_prefix(
      `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`
    );

    let list = [];
    for (const file of req.files.coverImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`,
        }
      );
      list.push({ secure_url, public_id });
    }
    product.coverImages = list;
  }

  await product.save();
  req.data = {
    model: productModel,
    id: product._id,
  };
  res.status(201).json({ message: "done", product });
});

//=============================== get Product =========================================
export const getProduct = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .select()
    .search();

  const products = await apiFeatures.mongooseQuery;

  res.status(200).json({ msg: "done", page: apiFeatures.page, products });
});

//=============================== deleteProduct =========================================
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!product) {
    return next(new AppError("product isn't exist", 401));
  }
  const category = await categoryModel.findOne({ _id: product.category });

  const subCategory = await subCategoryModel.findOne({
    _id: product.subCategory,
  });

  //delete from cloudinary category.customId delete images makes it empty
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/mainImage`
  );
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
  );
  //delete folder
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/mainImage`
  );
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
  );
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}`
  );
  res.status(201).json({ message: "done" });
});
