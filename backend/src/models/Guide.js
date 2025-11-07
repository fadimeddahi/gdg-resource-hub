import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
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
guideSchema.index({ department: 1, isActive: 1 });
guideSchema.index({ createdAt: -1 });
guideSchema.index({ title: "text" });

export default mongoose.model("Guide", guideSchema);
