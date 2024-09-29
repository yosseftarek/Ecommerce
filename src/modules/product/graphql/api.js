import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import productModel from "../../../../db/models/product.model.js";
import { productType } from "./types.js";
import postModel from "../../../../db/models/posts.model.js";
import { graphQLValidation } from "../../../middleware/validation.js";
import { createPostValidation } from "../product.validation.js";
import { authGraphQl } from "../../../middleware/auth.js";

export const getProduct = {
  type: productType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (_, args) => {
    const product = await productModel.findById(args.id).populate("category");
    return product;
  },
};

export const getProducts = {
  type: new GraphQLList(productType),
  resolve: async (_, args) => {
    const products = await productModel.find();
    return products;
  },
};

export const createPost = {
  type: productType,
  args: {
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    category: { type: GraphQLID },
    token: { type: GraphQLString },
  },
  resolve: async (_, args) => {
    const { title, description, category } = args;
    const error = await graphQLValidation(createPostValidation, {
      title,
      description,
      category,
    });
    if (!error) {
      throw new Error("validation error");
    }
    const user = await authGraphQl(args.token,["admin","user"]);//auth
    const post = await postModel.create({
      title,
      description,
      category,
    });
    return post;
  },
};

export const updatePost = {
  type: productType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    category: { type: GraphQLID },
  },
  resolve: async (_, args) => {
    const { title, description, category } = args;
    const post = await postModel.findByIdAndUpdate(
      args.id,
      {
        title,
        description,
        category,
      },
      {
        new: true,
      }
    );
    return post;
  },
};
