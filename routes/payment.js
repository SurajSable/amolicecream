const express = require("express");
const router = express.Router();
const { paymentCheckout, getRazorKey, createPaymentIntent } = require("../controllers/payment");
const { route } = require("./user");
// middleware
const { authCheck } = require("../middlewares/auth");
router.post("/paymentcheckout", authCheck,paymentCheckout);
router.get("/getrazorkey",authCheck,getRazorKey)
router.post("/create-payment-intent-razor", authCheck, createPaymentIntent);

module.exports = router;