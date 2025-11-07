import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
templateSchema.index({ department: 1, isActive: 1 });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ title: "text" });

export default mongoose.model("Template", templateSchema);
