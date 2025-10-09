import PartyOrder from "../Schema/partyOrder.js";

// Create new party order
export const createPartyOrder = async (req, res) => {
  try {
    const {
      party_name,
      party_phone,
      party_address,
      party_location,
      cold_bottle_quantity,
      cold_bottle_price,
      normal_bottle_quantity,
      normal_bottle_price,
      delivery_date,
      event_type,
      notes,
    } = req.body;

    const total_amount =
      cold_bottle_quantity * cold_bottle_price +
      normal_bottle_quantity * normal_bottle_price;

    const partyOrder = new PartyOrder({
      uid: req.user.id,
      party_name,
      party_phone,
      party_address,
      party_location,
      cold_bottle_quantity,
      cold_bottle_price,
      normal_bottle_quantity,
      normal_bottle_price,
      total_amount,
      delivery_date,
      event_type,
      notes,
    });

    await partyOrder.save();

    res.status(201).json({
      success: true,
      message: "Party order created successfully",
      data: partyOrder,
    });
  } catch (error) {
    console.error("Error creating party order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create party order",
      error: error.message,
    });
  }
};

// Get all party orders for a user
export const getPartyOrders = async (req, res) => {
  try {
    const partyOrders = await PartyOrder.find({ uid: req.user.id }).sort({
      created_at: -1,
    });

    res.status(200).json({
      success: true,
      data: partyOrders,
    });
  } catch (error) {
    console.error("Error fetching party orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch party orders",
      error: error.message,
    });
  }
};

// Get single party order
export const getPartyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const partyOrder = await PartyOrder.findOne({
      _id: id,
      uid: req.user.id,
    });

    if (!partyOrder) {
      return res.status(404).json({
        success: false,
        message: "Party order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: partyOrder,
    });
  } catch (error) {
    console.error("Error fetching party order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch party order",
      error: error.message,
    });
  }
};

// Update party order
export const updatePartyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate total if quantities or prices changed
    if (
      updateData.cold_bottle_quantity !== undefined ||
      updateData.cold_bottle_price !== undefined ||
      updateData.normal_bottle_quantity !== undefined ||
      updateData.normal_bottle_price !== undefined
    ) {
      const partyOrder = await PartyOrder.findOne({
        _id: id,
        uid: req.user.id,
      });

      const coldQty =
        updateData.cold_bottle_quantity !== undefined
          ? updateData.cold_bottle_quantity
          : partyOrder.cold_bottle_quantity;
      const coldPrice =
        updateData.cold_bottle_price !== undefined
          ? updateData.cold_bottle_price
          : partyOrder.cold_bottle_price;
      const normalQty =
        updateData.normal_bottle_quantity !== undefined
          ? updateData.normal_bottle_quantity
          : partyOrder.normal_bottle_quantity;
      const normalPrice =
        updateData.normal_bottle_price !== undefined
          ? updateData.normal_bottle_price
          : partyOrder.normal_bottle_price;

      updateData.total_amount = coldQty * coldPrice + normalQty * normalPrice;
    }

    const partyOrder = await PartyOrder.findOneAndUpdate(
      { _id: id, uid: req.user.id },
      updateData,
      { new: true }
    );

    if (!partyOrder) {
      return res.status(404).json({
        success: false,
        message: "Party order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Party order updated successfully",
      data: partyOrder,
    });
  } catch (error) {
    console.error("Error updating party order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update party order",
      error: error.message,
    });
  }
};

// Delete party order
export const deletePartyOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const partyOrder = await PartyOrder.findOneAndDelete({
      _id: id,
      uid: req.user.id,
    });

    if (!partyOrder) {
      return res.status(404).json({
        success: false,
        message: "Party order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Party order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting party order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete party order",
      error: error.message,
    });
  }
};

// Update invoice sent status and payment link
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_link } = req.body;

    const partyOrder = await PartyOrder.findOneAndUpdate(
      { _id: id, uid: req.user.id },
      {
        invoice_sent: true,
        payment_link: payment_link || "",
      },
      { new: true }
    );

    if (!partyOrder) {
      return res.status(404).json({
        success: false,
        message: "Party order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      data: partyOrder,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update invoice status",
      error: error.message,
    });
  }
};
