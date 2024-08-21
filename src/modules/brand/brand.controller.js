import { nanoid } from "nanoid";
import brandModel from "../../../db/models/brand.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";

//=============================== createbrand =========================================
export const createbrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const brandExist = await brandModel.findOne({
    name: name.toLowerCase(),
  });
  brandExist && next(new AppError("brand already exist", 409));

  if (!req.file) {
    next(new AppError("image is required", 404));
  }
  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/brands/${customId}`,
    }
  );
  req.filePath = `Ecommerce/brands/${customId}`;

  const brand = await brandModel.create({
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
    model: brandModel,
    id: brand._id,
  };
  res.status(201).json({ message: "done", brand });
});

//=============================== updatebrand =========================================
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const brand = await brandModel.findById(id);
  if (!brand) {
    next(new AppError("brand not exist"));
  }

  if (name) {
    if (name.toLowerCase() === brand.name) {
      return next(new AppError("name should be different"));
    }
    if (await brandModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("name already exist"));
    }
    brand.name = name.toLowerCase();
    brand.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(brand.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce/brands/${brand.customId}`,
      }
    );
    brand.image = { secure_url, public_id };
  }
  req.filePath = `Ecommerce/brands/${brand.customId}`; 

  await brand.save();
  req.data = {
    model: brandModel,
    id: brand._id,
  };
  return res.status(201).json({ message: "done", brand });

});

//=============================== deleteBrand =========================================
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!brand) {
    return next(new AppError("brand isn't exist", 401));
  }

  //delete from cloudinary category.customId delete images makes it empty
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/brands/${brand.customId}`
  );
  //delete folder
  await cloudinary.api.delete_folder(`Ecommerce/brands/${brand.customId}`);
  req.filePath = `Ecommerce/brands/${brand.customId}`; 

  res.status(201).json({ message: "done" });
});

//=============================== getBrands =========================================
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await brandModel.find({}).populate([
    {
      path: "createdBy",
      select: "name email -_id",
    },
  ]);

  res.status(201).json({ message: "done", brands });
});
