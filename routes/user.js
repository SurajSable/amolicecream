const express = require("express");

const router = express.Router();

//middlewares
const { authCheck } = require("../middlewares/auth")
//controlers
const { userCart, getUserCart, emptyUserCart, saveAddress, applyCouponToUserCart,
    createOrder, orders, addToWishlist,
    wishlist,
    removeFromWishlist, createCashOrder } = require("../controllers/user")

router.post("/user/cart", authCheck, userCart); // save cart
router.get("/user/cart", authCheck, getUserCart); // get cart
router.delete("/user/cart", authCheck, emptyUserCart); // delete cart
router.post("/user/address", authCheck, saveAddress)
//order
router.post("/user/order", authCheck, createOrder)
router.post("/user/cash-order", authCheck, createCashOrder); // cod
router.get("/user/orders", authCheck, orders)
//COUPON
router.post("/user/cart/coupon", authCheck, applyCouponToUserCart)
// wishlist
router.post("/user/wishlist", authCheck, addToWishlist)
router.get("/user/wishlist", authCheck, wishlist)
router.put("/user/wishlist/:productId", authCheck, removeFromWishlist)

module.exports = router;