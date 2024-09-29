import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { createPost, getProduct, getProducts, updatePost } from "./api.js";

export const produtSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "productQuery",
    fields: {
      getProduct,
      getProducts
    },
  }),
  mutation: new GraphQLObjectType({
    name: "postsMutation",
    fields: {
      createPost,
      updatePost
    },
  }),
});
