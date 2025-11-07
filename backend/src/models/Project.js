import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
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
projectSchema.index({ department: 1, isActive: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ title: "text" });

export default mongoose.model("Project", projectSchema);
