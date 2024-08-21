import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    minLength: 3,
    maxLength: 30,
    lowercase: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    minLength: 3,
    maxLength: 30,
    trim: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  image: {
    secure_url: String,
    public_id: String,
  },
  customId: {
    type: String,
  },
},
{
  timestamps: true,
  versionKey: false,
  toJSON:{virtuals:true},//to display it as json
  toObject:{virtuals:true}//to display it in console
});

categorySchema.virtual("subCategories", {
  ref: "subCategory", //collection name
  localField: "_id", //here
  foreignField: "category", //in subCategory
});

const categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;
