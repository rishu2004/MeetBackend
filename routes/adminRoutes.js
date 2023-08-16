const express = require("express");
const router = express.Router();
const {getAllUsers,getAllAdmins, createNewRoom, getAllRooms, deleteUser, deleteAdmin, loginAdmin, deleteRoom, enableRoom, disableRoom, addRoom, getAdmin, getRoom, newAnnouncement, changeAdminPassword, setHostInRoom, setHostOutRoom, setUserDisabled, setUserEnabled} = require("../controllers/adminControllers.js");
// const {loginUser} = require("../controllers/authControllers.js");
// const checkOwner = require("../middleware/checkOwnerHandler.js");

router.get("/getusers",getAllUsers);
router.get("/getadmins",getAllAdmins);
router.get("/getrooms",getAllRooms);
router.get("/getAdmin/:id",getAdmin);
router.get("/getRoom/:id",getRoom);

router.post('/auth/login',loginAdmin); 
router.post('/createRoom',createNewRoom);
router.post("/changePassword",changeAdminPassword);

router.delete("/deleteUser/:id",deleteUser);
router.delete("/deleteAdmin/:id",deleteAdmin);
router.delete("/deleteRoom/:id",deleteRoom);

router.put("/enableRoom/:id",enableRoom);
router.put("/disableRoom/:roomId",disableRoom);
router.put("/addRoom/:id/:roomId",addRoom);
router.put("/announcement/:roomId",newAnnouncement);
router.put("/setHostInRoom/:roomId",setHostInRoom);
router.put("/setHostOutRoom/:roomId",setHostOutRoom);
router.put("setUserDisabled/:userId",setUserDisabled);
router.put("/setUserEnabled/:userId",setUserEnabled);


module.exports = router;