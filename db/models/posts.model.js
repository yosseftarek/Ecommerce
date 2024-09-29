import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,

    },
    description: {
      type: String,
      minLength: 3,
      trim: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
   
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const postModel = mongoose.model("post", postSchema);

export default postModel;
