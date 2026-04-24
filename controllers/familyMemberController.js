// controllers/familyMemberController.js
import FamilyMember from "../models/FamilyMember.js";
import { cloudinary, uploadImage, deleteImage } from "../config/cloudinary.js";

export const getFamilyMembers = async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: familyMembers.length,
      data: familyMembers,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch family members",
      error: error.message,
    });
  }
};

export const getFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: familyMember,
    });
  } catch (error) {
    console.error("Error fetching family member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch family member",
      error: error.message,
    });
  }
};

export const createFamilyMember = async (req, res) => {
  try {
    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      medicalConditions,
      allergies,
      currentMedications,
      emergencyContact,
      notes,
    } = req.body;

    // Check if "self" already exists
    if (relationship === "self") {
      const existingSelf = await FamilyMember.findOne({
        userId: req.user._id,
        relationship: "self",
        isActive: true,
      });

      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message: "You can only have one 'self' member",
        });
      }
    }

    const familyMemberData = {
      userId: req.user._id,
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      medicalConditions,
      allergies,
      currentMedications,
      emergencyContact,
      notes,
    };

    // Handle profile image upload if provided
    if (req.file) {
      const result = await uploadImage(
        req.file.path,
        "health-app/family-members",
      );

      familyMemberData.profileImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const familyMember = await FamilyMember.create(familyMemberData);

    res.status(201).json({
      success: true,
      message: "Family member added successfully",
      data: familyMember,
    });
  } catch (error) {
    console.error("Error creating family member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add family member",
      error: error.message,
    });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      medicalConditions,
      allergies,
      currentMedications,
      emergencyContact,
      notes,
    } = req.body;

    // Check if trying to change to "self" when another "self" exists
    if (relationship === "self" && familyMember.relationship !== "self") {
      const existingSelf = await FamilyMember.findOne({
        userId: req.user._id,
        relationship: "self",
        isActive: true,
        _id: { $ne: req.params.id },
      });

      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message: "You can only have one 'self' member",
        });
      }
    }

    // Update fields
    if (name) familyMember.name = name;
    if (relationship) familyMember.relationship = relationship;
    if (dateOfBirth) familyMember.dateOfBirth = dateOfBirth;
    if (gender) familyMember.gender = gender;
    if (bloodGroup) familyMember.bloodGroup = bloodGroup;
    if (phone !== undefined) familyMember.phone = phone;
    if (medicalConditions) familyMember.medicalConditions = medicalConditions;
    if (allergies) familyMember.allergies = allergies;
    if (currentMedications)
      familyMember.currentMedications = currentMedications;
    if (emergencyContact) familyMember.emergencyContact = emergencyContact;
    if (notes !== undefined) familyMember.notes = notes;

    // Handle profile image upload
    if (req.file) {
      // Delete old image if exists
      if (familyMember.profileImage?.publicId) {
        await cloudinary.uploader.destroy(familyMember.profileImage.publicId);
      }

      const result = await uploadImage(
        req.file.path,
        "health-app/family-members"
      );

      familyMember.profileImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    await familyMember.save();

    res.status(200).json({
      success: true,
      message: "Family member updated successfully",
      data: familyMember,
    });
  } catch (error) {
    console.error("Error updating family member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update family member",
      error: error.message,
    });
  }
};

export const deleteFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    // Soft delete
    familyMember.isActive = false;
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: "Family member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting family member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete family member",
      error: error.message,
    });
  }
};

export const deleteFamilyMemberImage = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    if (!familyMember.profileImage?.publicId) {
      return res.status(400).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(familyMember.profileImage.publicId);

    // Remove from database
    familyMember.profileImage = undefined;
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting family member image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile image",
      error: error.message,
    });
  }
};
