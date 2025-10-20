import Inquiry from "../Schema/inquiry.js";
import nodemailer from "nodemailer";
import process from "process";

// Create email transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // or your email service
    auth: {
      user: process.env.EMAIL_USER || "paaniwale7@gmail.com",
      pass: process.env.EMAIL_PASS || "", // Use app password for Gmail
    },
  });
};

// Submit a new inquiry
export const submitInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      inquiryType = "general",
      source = "website",
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        status: "error",
        message: "All required fields must be provided",
      });
    }

    // Create new inquiry
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      company,
      subject,
      message,
      inquiryType,
      source,
    });

    await inquiry.save();

    // Send email notification to admin
    try {
      const transporter = createTransporter();

      const adminEmailContent = {
        from: process.env.EMAIL_USER || "paaniwale7@gmail.com",
        to: ["dhruvprajapati66572@gmail.com", "het.solanki090@gmail.com"],
        subject: `New Inquiry: ${subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Inquiry Received</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Type:</strong> ${inquiryType}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Submitted on: ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        </div>
      `,
      };

      await transporter.sendMail(adminEmailContent);

      // Send confirmation email to user
      const userEmailContent = {
        from: process.env.EMAIL_USER || "paaniwale7@gmail.com",
        to: email,
        subject: "Thank you for contacting Paani Wale",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 8px 8px 0 0;">
              <h1>Paani Wale</h1>
              <p>Smart Water Supply Management</p>
            </div>
            
            <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937;">Thank you for your inquiry!</h2>
              
              <p>Dear ${name},</p>
              
              <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Your Inquiry Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Type:</strong> ${inquiryType}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString(
                  "en-IN",
                  { timeZone: "Asia/Kolkata" }
                )}</p>
              </div>
              
              <p>In the meantime, feel free to:</p>
              <ul style="color: #4b5563;">
                <li>📞 Call us directly at: <a href="tel:+916355459412" style="color: #2563eb;">+91 6355459412</a></li>
                <li>📧 Email us at: <a href="mailto:paaniwale7@gmail.com" style="color: #2563eb;">paaniwale7@gmail.com</a></li>
                <li>🌐 Visit our website for more information</li>
              </ul>
              
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>💡 Quick Setup:</strong> Get started with Paani Wale in just 2 minutes - No setup cost required!</p>
              </div>
              
              <p>Best regards,<br>
              <strong>Paani Wale Team</strong><br>
              Smart Water Supply Management</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(userEmailContent);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue without failing the request
    }

    res.status(201).json({
      status: "success",
      message: "Inquiry submitted successfully. We'll get back to you soon!",
      data: {
        inquiryId: inquiry._id,
        submittedAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit inquiry. Please try again.",
      error: error.message,
    });
  }
};

// Get all inquiries (Admin only)
export const getAllInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      inquiryType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (inquiryType) filter.inquiryType = inquiryType;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const inquiries = await Inquiry.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("repliedBy", "name email");

    const total = await Inquiry.countDocuments(filter);

    res.json({
      status: "success",
      data: {
        inquiries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

// Get inquiry statistics
export const getInquiryStats = async (req, res) => {
  try {
    const [
      totalInquiries,
      newInquiries,
      resolvedInquiries,
      inquiriesByType,
      recentInquiries,
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.countDocuments({ status: "resolved" }),
      Inquiry.aggregate([
        {
          $group: {
            _id: "$inquiryType",
            count: { $sum: 1 },
          },
        },
      ]),
      Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email subject inquiryType status createdAt"),
    ]);

    res.json({
      status: "success",
      data: {
        total: totalInquiries,
        new: newInquiries,
        resolved: resolvedInquiries,
        pending: totalInquiries - resolvedInquiries,
        byType: inquiriesByType,
        recent: recentInquiries,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inquiry statistics",
      error: error.message,
    });
  }
};

// Update inquiry status (Admin only)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status, notes, priority } = req.body;

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (priority) updateData.priority = priority;

    const inquiry = await Inquiry.findByIdAndUpdate(inquiryId, updateData, {
      new: true,
    });

    if (!inquiry) {
      return res.status(404).json({
        status: "error",
        message: "Inquiry not found",
      });
    }

    res.json({
      status: "success",
      message: "Inquiry status updated successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update inquiry",
      error: error.message,
    });
  }
};

// Get inquiry by ID
export const getInquiryById = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({
        status: "error",
        message: "Inquiry not found",
      });
    }

    res.json({
      status: "success",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inquiry",
      error: error.message,
    });
  }
};

// Get inquiries by status
export const getInquiriesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const inquiries = await Inquiry.find({ status })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Inquiry.countDocuments({ status });

    res.json({
      status: "success",
      data: {
        inquiries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries by status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

// Get inquiries by type
export const getInquiriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const inquiries = await Inquiry.find({ inquiryType: type })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Inquiry.countDocuments({ inquiryType: type });

    res.json({
      status: "success",
      data: {
        inquiries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries by type:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};
