// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    reportType: {
      type: String,
      required: true,
      enum: [
        "blood-test",
        "urine-test",
        "x-ray",
        "ultrasound",
        "ct-scan",
        "mri",
        "ecg",
        "prescription",
        "doctor-notes",
        "other",
      ],
    },
    reportDate: {
      type: Date,
      required: [true, "Report date is required"],
      index: true,
    },
    file: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        enum: ["image", "pdf"],
        required: true,
      },
    },
    aiSummary: {
      englishSummary: {
        type: String,
      },
      romanUrduSummary: {
        type: String,
      },
      abnormalValues: [
        {
          parameter: String,
          value: String,
          normalRange: String,
          status: {
            type: String,
            enum: ["high", "low", "critical"],
          },
        },
      ],
      doctorQuestions: [String],
      foodsToAvoid: [String],
      recommendedFoods: [String],
      homeRemedies: [String],
      disclaimer: {
        type: String,
        default:
          "This AI summary is for understanding only, not for medical advice. Always consult your doctor. / Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi.",
      },
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    processingError: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
reportSchema.index({ userId: 1, reportDate: -1 });
reportSchema.index({ familyMemberId: 1, reportDate: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
