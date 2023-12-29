const order = require("../models/orderd")

exports.orders = async (req, res) => {
  let allorders = await order
    .find({})
    .sort("-createdAt")
    .populate("products.product")
    .exec()
  res.json(allorders)
};

exports.orderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body
  let updated = await order
    .findByIdAndUpdate(orderId, { orderStatus }, { new: true })
    .exec()
  res.json(updated);
};
