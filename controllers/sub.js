const Sub = require("../models/sub")
const Product = require("../models/product")
const slugify = require("slugify")

exports.create = async (req, res) => {
    try {
        const { name, parent } = req.body
        const sub = await new Sub({ name, parent, slug: slugify(name) }).save()
        res.json(sub)
    } catch (error) {
        res.status(400).send('create Sub category failed', error)
        //console.log(error)
    }
}

exports.read = async (req, res) => {
    try {
        const { slug } = req.params
        const sub = await Sub.findOne({ slug })
        const product = await Product.find({ subs: sub })
            .populate('category')
            .exec()
        res.json({ sub, product })
    } catch (error) {
        res.status(500).send(' get sub category failed, ', error)
        //console.log(error)
    }
}

exports.list = async (req, res) => {
    try {
        const sub = await Sub.find({}).sort({ createdAt: -1 }).exec();
        res.json(sub)
    } catch (error) {
        res.status(500).send(' get sub categories failed, ', error)
        console.log(error)
    }
}

exports.update = async (req, res) => {
    try {
        const { slug } = req.params
        const { name, parent } = req.body
        const sub = await Sub.findOneAndUpdate({ slug: slug }, { name, parent, slug: slugify(name) }, { new: true })
        res.json(sub)
    } catch (error) {
        res.status(400).send(' update sub category failed, ', error)
        console.log(error)
    }
}

exports.remove = async (req, res) => {
    try {
        const { slug } = req.params
        const sub = await Sub.findOneAndDelete({ slug })
        res.json(sub)
    } catch (error) {
        res.status(400).send(' update sub category failed, ', error)
        console.log(error)
    }
}
