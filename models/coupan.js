const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: "Name is required ",
      minlenght: [6, "To short"],
      maxlength: [15, "Too long"],
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      requred: true,
    }
  },
  { timestamps: true }
);



module.exports = mongoose.model("Coupon", couponSchema);
