import mongoose from "mongoose";

const savedFolderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    folderType: {
      type: String,
      required: [true, "Folder type is required"],
      enum: ["projects", "guides", "events", "templates"],
      lowercase: true,
    },
    folderName: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [100, "Folder name cannot exceed 100 characters"],
    },
    departmentName: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    departmentSlug: {
      type: String,
      required: [true, "Department slug is required"],
      trim: true,
      lowercase: true,
    },
    color: {
      type: String,
      enum: ["blue", "green", "yellow", "red", "purple", "pink", "indigo"],
      default: "blue",
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: Each user can only save each folder once
savedFolderSchema.index({ user: 1, department: 1, folderType: 1 }, { unique: true });

// Index for faster queries
savedFolderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("SavedFolder", savedFolderSchema);
