const express = require("express")
//controllers
const { create, read, update, remove, list } = require("../controllers/sub")
const router = express.Router()
//middlewares
const { authCheck, adminCheck } = require("../middlewares/auth")

router.post("/sub", authCheck, adminCheck, create)
router.get("/subs", list)
router.get("/sub/:slug", authCheck, read)
router.put("/sub/:slug", authCheck, adminCheck, update)
router.delete("/sub/:slug", authCheck, adminCheck, remove)


module.exports = router