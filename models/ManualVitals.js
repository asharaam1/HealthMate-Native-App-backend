// models/ManualVitals.js
import mongoose from "mongoose";

const manualVitalsSchema = new mongoose.Schema(
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
    recordDate: {
      type: Date,
      required: [true, "Record date is required"],
      index: true,
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [0, "Systolic must be positive"],
        max: [300, "Systolic seems too high"],
      },
      diastolic: {
        type: Number,
        min: [0, "Diastolic must be positive"],
        max: [200, "Diastolic seems too high"],
      },
      unit: {
        type: String,
        default: "mmHg",
      },
    },
    bloodSugar: {
      value: {
        type: Number,
        min: [0, "Blood sugar must be positive"],
        max: [1000, "Blood sugar seems too high"],
      },
      type: {
        type: String,
        enum: ["fasting", "random", "post-meal", "hba1c"],
      },
      unit: {
        type: String,
        default: "mg/dL",
      },
    },
    weight: {
      value: {
        type: Number,
        min: [0, "Weight must be positive"],
        max: [500, "Weight seems too high"],
      },
      unit: {
        type: String,
        enum: ["kg", "lbs"],
        default: "kg",
      },
    },
    height: {
      value: {
        type: Number,
        min: [0, "Height must be positive"],
        max: [300, "Height seems too high"],
      },
      unit: {
        type: String,
        enum: ["cm", "inches"],
        default: "cm",
      },
    },
    heartRate: {
      value: {
        type: Number,
        min: [0, "Heart rate must be positive"],
        max: [300, "Heart rate seems too high"],
      },
      unit: {
        type: String,
        default: "bpm",
      },
    },
    temperature: {
      value: {
        type: Number,
        min: [0, "Temperature must be positive"],
        max: [120, "Temperature seems too high"],
      },
      unit: {
        type: String,
        enum: ["celsius", "fahrenheit"],
        default: "celsius",
      },
    },
    oxygenLevel: {
      value: {
        type: Number,
        min: [0, "Oxygen level must be positive"],
        max: [100, "Oxygen level cannot exceed 100%"],
      },
      unit: {
        type: String,
        default: "%",
      },
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    aiAnalysis: {
      englishSummary: {
        type: String,
        default: "",
      },
      romanUrduSummary: {
        type: String,
        default: "",
      },
      abnormalValues: [
        {
          parameter: String,
          value: String,
          normalRange: String,
          status: String,
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
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

manualVitalsSchema.index({ userId: 1, recordDate: -1 });
manualVitalsSchema.index({ familyMemberId: 1, recordDate: -1 });

manualVitalsSchema.virtual("bmi").get(function () {
  if (this.weight?.value && this.height?.value) {
    const heightInMeters = this.height.value / 100;
    return (this.weight.value / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

manualVitalsSchema.set("toJSON", { virtuals: true });
manualVitalsSchema.set("toObject", { virtuals: true });

const ManualVitals = mongoose.model("ManualVitals", manualVitalsSchema);

export default ManualVitals;
