const { Router } = require("express");
const router = Router();
const productoController = require("../controllers/productoController.js");
const dialogflowController = require("../controllers/dialogflowController.js");
const bodyParser = require("body-parser");
// support encoded bodies
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
router.use(bodyParser.json({ limit: "50mb", extended: true }));

router.get("/", productoController.index);
router.post("/api/chatbot", dialogflowController.sendTwilio);

module.exports = router;
