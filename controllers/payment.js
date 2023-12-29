const User = require("../models/user");
const Cart = require("../models/cart");
const Razorpay = require("razorpay")

exports.createPaymentIntent = async (req, res) => {
  const { couponApplied } = req.body;
  // 1 find user
  const user = await User.findOne({ email: req.user.email }).exec();
  // 2 get user cart total
  const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderdBy: user._id }).exec();
  // console.log("CART TOTAL", cartTotal, "AFTER DIS%", totalAfterDiscount);
  let finalAmount = 0;
  if (couponApplied && totalAfterDiscount) {
    finalAmount = totalAfterDiscount * 100;
  } else {
    finalAmount = cartTotal * 100;
  }
  res.send(
    {
      cartTotal,
      totalAfterDiscount,
      payable: finalAmount,
    }
  )
}

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
exports.paymentCheckout = async (req, res) => {
  //console.log(req.body)
  const { amount } = req.body
  // later apply coupon
  const options = {
    amount: Number(amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
};

exports.getRazorKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
}