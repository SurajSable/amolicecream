const User = require("../models/user")

exports.createOrUpdateUser = async (req, res) => {
    const { name, picture, email } = req.user
    const user = await User.findOneAndUpdate(
        { email },
        { name, picture },
        { new: true }
    )
    if (user) {
        res.json(user)
    } else {
        const newUser = await new User({
            email,
            name: email.split("@")[0],
            picture
        }).save();
        res.json(newUser);
    }
}

exports.currentUser = async (req, res) => {
    User.findOne(
        { email: req.user.email }).then((user) => {
            res.json(user);
        }).catch((err) => { throw new Error(err) })
}