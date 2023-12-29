
const Product = require("../models/product");
const slugify = require("slugify");
const User = require("../models/user")

exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    const slug = slugify(title);
    const product = await Product.create({ ...req.body, slug });
    res.json(product);
  } catch (error) {
    console.error("Create product failed", error);
    //res.status(400).send("Create product failed");
    res.status(400).json({ error: error.message })
  }
}

exports.listAll = async (req, res) => {
  try {
    const products = await Product.find({})
      .limit(parseInt(req.params.count))
      .populate("category")
      .populate("subs")
      .sort([["createdAt", "desc"]])
      .exec();
    res.json(products)
  } catch (error) {
    res.status(500).json(error)
    //console.log(error)
  }
} 

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      slug: req.params.slug
    })
    res.json(deleted);
  } catch (error) {
    console.log(error)
    return res.status(400).send("product delate faild")

  }
}

exports.read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("subs")
      .exec()
    res.json(product)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.slug)
    }
    const updated = await Product.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true })
    res.json(updated)
  } catch (error) {
    console.log("peoduct update error", error)
    res.status(400).send("product update failed")
  }
}

exports.list = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();
    res.json(products)
  } catch (error) {
    console.log(error)
    res.status(400).send("products read failed")
  }
}

exports.productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount()

    res.json(total)
  } catch (error) {
    console.log(error)
    res.status(500).send("products count api is failed ")
  }
}

exports.productStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec()
  const { star } = req.body

  // who is updating?
  // check if currently logged in user have already added rating to this product?

  let existingRatingObject = product.ratings.find(
     (ele) => ele.postedBy.toString() === user._id.toString())
  //  console.log(user)
 
    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
      let ratingAdded = await Product.findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star, postedBy: user._id } },
        },
        { new: true }
      ).exec();
      console.log("ratingAdded", ratingAdded);
      res.json(ratingAdded);
    } else {
      // if user have already left rating, update it
      const ratingUpdated = await Product.updateOne(
        {
          ratings: { $elemMatch: existingRatingObject },
        },
        { $set: { "ratings.$.star": star } },
        { new: true }
      ).exec();
      console.log("ratingUpdated", ratingUpdated);
      res.json(ratingUpdated);
    } 
     }
      
     exports.listRelated= async (req,res)=>{
      try {
        const product= await Product.findById(req.params.productId).exec();
        const related = await Product.find({
          _id:{$ne: product._id},
          category:product.category,
       })
       .limit(3)
       .populate('category')
       .populate('subs')
      // .populate('posteBy')
       .exec()
       res.json(related)
      } catch (error) {
        console.log(error)
        res.status(404).send("related product note found",error)
      }
    }
 const handleQuery = async(req,res,query)=>{
  const product= await Product.find({$text:{$search:query}})
  .populate("category","_id name")
  .populate("subs", "_id name")
  .exec()
  res.json(product)
 }

 const handlePrice =async(req,res,price)=>{
  try{
  const products = await Product.find({
    price:{$gte:price[0] ,$lte:price[1] }
  })
  .populate("category","_id name")
  .populate("subs", "_id name")
  .exec()
  res.json(products)
}catch(err){
  console.log("price error",err)
}
 }

 const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .exec();
    res.json(products);
  } catch (err) {
    console.log("handlecategory-->",err);
  }
};

const handleStar = async (req, res, stars) => {
  try{
 const aggr= await Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        floorAverage: {
          $floor: { $avg: "$ratings.star" }, // floor value of 3.33 will be 3
        },
      },
    },
    { $match: { floorAverage: stars } },
  ])
    .limit(12)
    .exec()
   const products= await Product.find({ _id: aggr })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .exec()
    res.json(products)
}catch(err){
  console.log("starrs err",err)
}
}

const handleSub = async (req, res, subs) => {
  try {
    const products = await Product.find({ subs })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
  } catch (error) {
    console.log("subs search err",error)
  }
};

const handleShipping = async (req, res , shipping)=>{
  try {
    const products = await Product.find({shipping  })
  .populate("category", "_id name")
    .populate("subs", "_id name")
    .exec();
  res.json(products);
  } catch (error) {
    console.log("shipping search err",error)
  }
}

const handleColor = async (req, res , color)=>{
  try {
    const products = await Product.find({ color})
    .populate("category", "_id name")
      .populate("subs", "_id name")
      .exec();
    res.json(products);
  } catch (error) {
    console.log("color search err",error)
  }
}

const handleBrand= async (req, res , brand)=>{
  try {
    const products = await Product.find({brand })
    .populate("category", "_id name")
      .populate("subs", "_id name")
      .exec();
    res.json(products);
  } catch (error) {
    console.log("brand search err",error)
  }
}

exports.searchFilters= async(req,res)=>{
    const {query,price,category,stars,sub,shipping,color,brand} = req.body
    if(query){
      //console.log('query',query)
      await handleQuery(req,res,query)
    }
    if(price !== undefined){
      //console.log("price",price)
      await handlePrice(req,res,price)
    }
    if(category){
      //console.log("category",category)
      await handleCategory(req,res,category)
    }
   
    if (stars) {
      //console.log("stars ---> ", stars);
      await handleStar(req, res, stars);
    }
  
    if (sub) {
      //console.log("sub ---> ", sub);
      await handleSub(req, res, sub);
    }

    if (shipping) {
      //console.log("sub ---> ", shipping);
      await handleShipping(req, res,shipping );
    }

    if (color) {
      //console.log("sub ---> ", color);
      await handleColor(req, res,color );
    }

    if (brand) {
      //console.log("sub ---> ", brand);
      await handleBrand(req, res,brand);
    }
  }


  


   