const Coupon = require("../models/coupan");
//create,list,remove

exports.create=async (req,res)=>{
    try {
        //console.log(req.body.coupon)
        const {name,expiry,discount}=req.body.coupon
        // res.json( await new Coupon ({name,expiry,discount}).save())
        const coupon =await new Coupon ({name,expiry,discount}).save();
        res.json(coupon)
    } catch (error) {
        console.log ("create coupon error",error)
    }
}
exports.remove=async (req,res)=>{
    try {
        res.json( await  Coupon.findByIdAndDelete(req.params.couponId).exec())
    } catch (error) {
        console.log ("remove coupon error",error)
    }
}

exports.list=async (req,res)=>{
    try {
        res.json( await  Coupon.find({}).sort({ createdAt: -1 }).exec())
    } catch (error) {
        console.log ("create coupon error",error)
    }
}