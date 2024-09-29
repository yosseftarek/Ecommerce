import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import subCategoryModel from "../../../../db/models/subCategory.model.js";

export const productType = new GraphQLObjectType({
  name: "product",
  fields: {
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    category: {
      type: new GraphQLObjectType({
        name: "category",
        fields: { _id: { type: GraphQLID }, name: { type: GraphQLString } },
      }),
    },  
    subCategories: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "subCategories",
          fields: {
            _id: { type: GraphQLID },
            name: { type: GraphQLString },
          },
        })
      ),
      resolve: async (parent, args) => {
        console.log(parent.description);
        const subCategories = await subCategoryModel.find({
          category: parent.category._id,
        });
        return subCategories;
      },
    },
  },
});
