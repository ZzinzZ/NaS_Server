const express = require("express");
const stringeeController = require("../Controllers/stringee.controller");

const router = express.Router();

router.get('/token/:userId', stringeeController.genToken);

module.exports = router;