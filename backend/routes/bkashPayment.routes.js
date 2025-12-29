const {
  createPayment,
  bkashCallback,
} = require("../controller/bkashPayment.controller");
const grantToken = require("../utils/grantToken");

const router = require("express").Router();

router.use(grantToken);

router.post("/create", createPayment);

router.get("/callback", bkashCallback);

module.exports = router;