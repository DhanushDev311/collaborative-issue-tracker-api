import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [120, "Project name cannot exceed 120 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: {
      type: [memberSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ "members.user": 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
