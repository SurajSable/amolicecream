const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupan");
const Order = require("../models/orderd");
const uniqueid = require("uniqueid");

exports.userCart = async (req, res) => {
  const { cart } = req.body;
  let products = [];
  const user = await User.findOne({ email: req.user.email }).exec();
  // check if cart with logged in user id already exist
  let cartExistByThisUser = await Cart.findOne({ orderdBy: user._id }).exec();
  if (cartExistByThisUser) {
    try {
      await cartExistByThisUser.remove();
      console.log("removed old cart");
    } catch (error) {
      console.log("Error removing old cart:", error);
    }
  }
  for (let i = 0; i < cart.length; i++) {
    let object = {};

    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    // get price for creating total
    let { price } = await Product.findById(cart[i]._id).select("price").exec();
    object.price = price;
    products.push(object);
  }
  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  let newCart = await new Cart({
    products,
    cartTotal,
    orderdBy: user._id,
  }).save();
  res.json({ ok: true });
};


exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec()
  let cart = await Cart.findOne({ orderdBy: user._id })
    .populate("products.product", "_id title price totalAfterDiscount")
    .exec();
  const { products, cartTotal, totalAfterDiscount } = cart
  res.json({ products, cartTotal, totalAfterDiscount })
}

exports.emptyUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec()
  let cart = await Cart.findOneAndDelete({ orderdBy: user._id })
  res.json(cart)
}

exports.saveAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate({ email: req.user.email },
    { address: req.body.address }).exec()
  res.json({ ok: true })
}

exports.applyCouponToUserCart = async (req, res) => {
  const { coupon } = req.body;
  const validCoupon = await Coupon.findOne({ name: coupon }).exec();
  if (validCoupon === null) {
    return res.json({
      err: "INVALID COUPON"
    })
  }
  const user = await User.findOne({ email: req.user.email }).exec();

  let { products, cartTotal } = await Cart.findOne({
    orderdBy: user._id
  }).populate("products.product", "_id title price").exec()

  // calculate the total after discount
  let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount / 100)).toFixed(2);
  Cart.findOneAndUpdate({ orderdBy: user._id }, { totalAfterDiscount }, { new: true }).exec()
  res.json(totalAfterDiscount)
}

exports.createOrder = async (req, res) => {
  console.log("reqbody error", req.body)
  const { paymentIntent } = req.body.stripeResponse;
  const user = await User.findOne({ email: req.user.email }).exec();
  let { products } = await Cart.findOne({
    orderdBy: user._id
  }).exec();

  let newOrder = await new Order({
    products,
    paymentIntent,
    orderdBy: user._id,
  }).save()

  // decrement quantity, increment sold
  let bulkOption = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  res.json({ ok: true });
}

exports.orders = async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).exec();
  let userOrders = await Order.find({ orderdBy: user._id })
    .populate("products.product")
    .exec();
  res.json(userOrders);
};

// addToWishlist wishlist removeFromWishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();
  res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("wishlist")
    .populate("wishlist")
    .exec();
  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();
  res.json({ ok: true });
};

exports.createCashOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  // if COD is true, create order with status of Cash On Delivery
  if (!COD) return res.status(400).send("Create cash order failed");
  const user = await User.findOne({ email: req.user.email }).exec();
  let userCart = await Cart.findOne({ orderdBy: user._id }).exec();
  let finalAmount = 0;
  if (couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount * 100;
  } else {
    finalAmount = userCart.cartTotal * 100;
  }

  let newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqueid(),
      amount: finalAmount,
      currency: "INR",
      status: "Cash On Delivery",
      created: Date.now(),
      payment_method_types: ["cash"],
    },
    orderdBy: user._id,
    orderStatus: "Cash On Delivery",
  }).save();

  // decrement quantity, increment sold
  let bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  res.json({ ok: true });
};