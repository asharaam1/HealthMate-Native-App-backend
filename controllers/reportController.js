// controllers/reportController.js
import Report from "../models/Report.js";
import { uploadImage } from "../config/cloudinary.js";
import { analyzeMedicalReport } from "../config/gemini.js";

export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const { title, reportType, reportDate, notes, familyMemberId } = req.body;

    if (!title || !reportType || !reportDate || !familyMemberId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, report type, report date, and family member",
      });
    }

    console.log("📁 File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Create base64 string properly
    const base64String = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64String}`;

    console.log("☁️ Uploading to Cloudinary...");

    // Upload to Cloudinary
    const uploadResult = await uploadImage(dataUri, "healthmate/reports");

    console.log("✅ Uploaded to Cloudinary:", uploadResult.url);

    const report = await Report.create({
      userId: req.user.id,
      familyMemberId,
      title,
      reportType,
      reportDate,
      file: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        fileType: req.file.mimetype.includes("pdf") ? "pdf" : "image",
      },
      notes,
      isProcessed: false,
    });

    // Start AI processing in background
    processReportWithAI(report._id, uploadResult.url, reportType);

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully. AI analysis in progress...",
      report,
    });
  } catch (error) {
    console.error("❌ Upload report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error uploading report",
    });
  }
};

const processReportWithAI = async (reportId, fileUrl, reportType) => {
  try {
    console.log(`\n🤖 Starting AI processing for report: ${reportId}`);
    console.log(`📋 Report Type: ${reportType}`);
    console.log(`� File URL: ${fileUrl}`);
    console.log(`🔑 Gemini API Key present:`, !!process.env.GEMINI_API_KEY);

    const aiAnalysis = await analyzeMedicalReport(fileUrl, reportType);

    console.log(
      `📊 AI Response received:`,
      aiAnalysis.success ? "✅ Success" : "❌ Failed",
    );
    console.log(`📊 AI Response:`, aiAnalysis.data);

    if (aiAnalysis.success) {
      console.log(`✅ AI analysis successful for report: ${reportId}`);
      console.log(
        `📊 Summary length: ${
          aiAnalysis.data.englishSummary?.length || 0
        } chars`,
      );
      console.log(
        `🔢 Abnormal values found: ${
          aiAnalysis.data.abnormalValues?.length || 0
        }`,
      );

      await Report.findByIdAndUpdate(reportId, {
        aiSummary: aiAnalysis.data,
        isProcessed: true,
        processingError: null,
      });

      console.log(`💾 Report ${reportId} updated successfully`);
    } else {
      console.log(
        `⚠️ AI analysis returned success=false for report: ${reportId}`,
      );
      await Report.findByIdAndUpdate(reportId, {
        isProcessed: false,
        processingError: "AI analysis completed but returned no data",
      });
    }
  } catch (error) {
    console.error(
      `❌ AI processing error for report ${reportId}:`,
      error.message,
    );
    console.error("Full error:", error);

    await Report.findByIdAndUpdate(reportId, {
      isProcessed: false,
      processingError: error.message || "Failed to analyze report with AI",
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      familyMemberId,
      limit = 50,
      page = 1,
    } = req.query;

    const query = { userId: req.user.id };

    if (familyMemberId) {
      query.familyMemberId = familyMemberId;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .populate("familyMemberId", "name relationship profileImage")
      .sort({ reportDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report",
    });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { title, notes, reportType, reportDate } = req.body;

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (title) report.title = title;
    if (notes !== undefined) report.notes = notes;
    if (reportType) report.reportType = reportType;
    if (reportDate) report.reportDate = reportDate;

    await report.save();

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating report",
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete from Cloudinary
    // await deleteImage(report.file.publicId);

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting report",
    });
  }
};

export const getReportsStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ userId: req.user.id });

    const reportsByType = await Report.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: "$reportType", count: { $sum: 1 } } },
    ]);

    const recentReports = await Report.find({ userId: req.user.id })
      .sort({ reportDate: -1 })
      .limit(5)
      .select("title reportType reportDate isProcessed");

    res.status(200).json({
      success: true,
      stats: {
        totalReports,
        reportsByType,
        recentReports,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
};
