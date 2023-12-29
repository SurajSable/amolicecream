const cloudinary = require("cloudinary")

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

// req.files.file.path
exports.upload = async (req, res) => {
    try {
        let result = await cloudinary.uploader.upload(req.body.images, {
            public_id: `${Date.now()}`,// jpeg, png
            resource_type: "auto"
        });
        res.json({
            public_id: result.public_id,
            uri: result.secure_url,
        });
    } catch (error) {
        console.log("coudinary error", error)
        res.status(500).json(error)
    }
};

exports.remove = (req, res) => {
    let image_id = req.body.public_id
    cloudinary.uploader.destroy(image_id, (err, result) => {
        if (err) return res.json({ success: false, err })
        res.send("ok image is remove")
    });

};