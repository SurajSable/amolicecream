const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupan");
const stripe = require("stripe") (process.env.STRIPE_SECRET)

exports.createPaymentIntent =async (req,res)=>{
    const { couponApplied} = req.body;
    // later apply coupon
  // later calculate price
  // 1 find user
  const user = await User.findOne({ email: req.user.email }).exec();
  // 2 get user cart total
  const { cartTotal,totalAfterDiscount} = await Cart.findOne({ orderdBy: user._id }).exec();
  let finalAmount = 0;
  if (couponApplied && totalAfterDiscount) {
    finalAmount = totalAfterDiscount * 100;
  } else {
    finalAmount = cartTotal * 100;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "INR",
  });
res.send(
    {
        clientSecret: paymentIntent.client_secret,
        cartTotal,
    totalAfterDiscount,
    payable: finalAmount,
    }
)
  }
