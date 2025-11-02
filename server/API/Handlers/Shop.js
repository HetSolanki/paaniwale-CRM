import Shop from "../Schema/shop.js";

export const getShop = async (req, res) => {
  const shop = await Shop.findOne({ uid: req.params.id }).populate("uid");

  if (!shop) {
    return res.json({ data: "No Shop Found", status: "failed" });
  }

  res.json({ data: shop, status: "success" });
};

export const createShop = async (req, res) => {
  try {
    const newShop = await Shop.create({
      shop_name: req.body.shop_name,
      gst_number: req.body.gst_number,
      uid: req.user.id,
    });

    res.json({ data: newShop, status: "success" });
  } catch (error) {
    res.json({ error });
  }
};

export const updateShop = async (req, res) => {
  // console.log(req.body.image_url);
  const updatedShop = await Shop.findOneAndUpdate(
    { uid: req.user.id },
    {
      shop_name: req.body.shop_name,
      shop_address: req.body.shop_address,
      gst_number: req.body.gst_number,
      image_url: req.body.image_url,
    },
    { new: true }
  );

  res.json({ data: updatedShop, status: "success" });
};

export const deleteShop = async (req, res) => {
  const deletedShop = await Shop.findByIdAndDelete(req.params.id);

  if (!deletedShop) {
    return res.json({ data: "No Shop Found", status: "failed" });
  }

  res.json({ data: deletedShop, status: "success" });
};

export const uploadQR = async (req, res) => {
  const deletedShop = await Shop.findByIdAndDelete(req.params.id);

  if (!deletedShop) {
    return res.json({ data: "No Shop Found", status: "failed" });
  }

  res.json({ data: deletedShop, status: "success" });
};
