const express = require("express");
const router = new express.Router();
const {getPageTitleAndLinks, startWorkerJob} = require("../middleware/scrape");
router.post("/", startWorkerJob)


module.exports = router;
