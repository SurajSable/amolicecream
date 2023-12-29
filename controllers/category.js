const Category = require("../models/category")
const Product = require("../models/product")
const slugify = require("slugify")
const Sub = require("../models/sub")
exports.create = async (req, res) => {
    try {
        const { name } = req.body
        const category = await new Category({ name, slug: slugify(name) }).save()
        res.json(category)
    } catch (error) {
        res.status(400).send('create category failed', error)
        //console.log(error)
    }
}

exports.read = async (req, res) => {
    try {
        const { slug } = req.params
        const category = await Category.findOne({ slug })
        //res.json(category)
        const product = await Product.find({ category })
            .populate('category')
            .populate('subs')
            .exec()
        res.json({
            category,
            product
        })
    } catch (error) {
        res.status(500).send(' get category failed, ', error)
        //console.log(error)
    }
}

exports.list = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 }).exec();
        // const categories = await Category.find()
        res.json(categories)
    } catch (error) {
        res.status(500).send(' get categories failed, ', error)
        // console.log(error)
    }
}

exports.update = async (req, res) => {
    try {
        const { slug } = req.params
        const { name } = req.body
        const category = await Category.findOneAndUpdate({ slug }, { name, slug: slugify(name) }, { new: true })
        res.json(category)
    } catch (error) {
        res.status(400).send(' update category failed, ', error)
        //console.log(error)
    }
}

exports.remove = async (req, res) => {
    try {
        const { slug } = req.params
        const category = await Category.findOneAndDelete({ slug })
        res.json(category)
    } catch (error) {
        res.status(400).send(' update category failed, ', error)
        //console.log(error)
    }
}

exports.getSubs = async (req, res) => {
    try {
        const getsubs = await Sub.find({ parent: req.params._id })
        res.json(getsubs)
    } catch (error) {
        res.status(400).send(' sub failed, ', error)
        //console.log(error)
    }
}