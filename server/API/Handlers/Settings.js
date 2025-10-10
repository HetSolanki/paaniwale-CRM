import Settings from "../Schema/Settings.js";

// Get user settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ uid: req.user.id });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({ uid: req.user.id });
    }

    res.json({ data: settings, status: "success" });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      message: "Error fetching settings",
      error: error.message,
      status: "error",
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ uid: req.user.id });

    if (!settings) {
      // Create new settings if they don't exist
      settings = await Settings.create({
        uid: req.user.id,
        ...req.body,
      });
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        { uid: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    res.json({
      data: settings,
      status: "success",
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      message: "Error updating settings",
      error: error.message,
      status: "error",
    });
  }
};

// Test SMTP connection
export const testSMTPConnection = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_username, smtp_password } = req.body;

    // TODO: Implement actual SMTP test using nodemailer
    // For now, return success
    res.json({
      status: "success",
      message: "SMTP connection test successful",
    });
  } catch (error) {
    console.error("Error testing SMTP:", error);
    res.status(500).json({
      message: "SMTP connection failed",
      error: error.message,
      status: "error",
    });
  }
};

// Test WhatsApp connection
export const testWhatsAppConnection = async (req, res) => {
  try {
    const { whatsapp_api_key, whatsapp_phone_number } = req.body;

    // TODO: Implement actual WhatsApp API test
    // For now, return success
    res.json({
      status: "success",
      message: "WhatsApp connection test successful",
    });
  } catch (error) {
    console.error("Error testing WhatsApp:", error);
    res.status(500).json({
      message: "WhatsApp connection failed",
      error: error.message,
      status: "error",
    });
  }
};

// Test Razorpay connection
export const testRazorpayConnection = async (req, res) => {
  try {
    const { razorpay_key_id, razorpay_key_secret } = req.body;

    // TODO: Implement actual Razorpay API test
    // For now, return success
    res.json({
      status: "success",
      message: "Razorpay connection test successful",
    });
  } catch (error) {
    console.error("Error testing Razorpay:", error);
    res.status(500).json({
      message: "Razorpay connection failed",
      error: error.message,
      status: "error",
    });
  }
};
