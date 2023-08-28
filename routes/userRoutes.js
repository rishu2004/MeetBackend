const express = require("express");
const router = express.Router();
const {changeStatusTrue, changeStatusFalse,setDeviceInfo, getAnnouncement, changeUserPassword, changeLogTime, changeDevice} = require("../controllers/userControllers.js");

router.get("/getAnnouncement/:id",getAnnouncement);

router.post("/changePassword",changeUserPassword);
router.post("/changeLogTime/:id", changeLogTime);

router.put("/changeStatusTrue/:id", changeStatusTrue);
router.put("/changeStatusFalse/:id", changeStatusFalse);
router.put("/setDeviceInfo/:id",setDeviceInfo);
router.put("/changeDevice/:id", changeDevice);


module.exports = router;