// models/FamilyMember.js
import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Family member name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    relationship: {
      type: String,
      required: [true, "Relationship is required"],
      enum: [
        "self",
        "spouse",
        "son",
        "daughter",
        "father",
        "mother",
        "brother",
        "sister",
        "grandfather",
        "grandmother",
        "grandson",
        "granddaughter",
        "other",
      ],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    medicalConditions: [
      {
        type: String,
        trim: true,
      },
    ],
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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

// Index for faster queries
familyMemberSchema.index({ userId: 1, isActive: 1 });
familyMemberSchema.index({ userId: 1, relationship: 1 });

// Calculate age virtual field
familyMemberSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtuals are included in JSON
familyMemberSchema.set("toJSON", { virtuals: true });
familyMemberSchema.set("toObject", { virtuals: true });

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);

export default FamilyMember;
