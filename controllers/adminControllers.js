const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Room = require("../models/roomModels");
const Admin = require("../models/adminModel");
const Announcement = require("../models/announcementModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc get all users
//@route GET /api/admin/getusers
//@access public
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: "User",
  });
  // console.log(users);
  res.json(users);
});

//@desc get all admins
//@route GET /api/admin/getadmins
//@access public
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({
    role: "Admin",
  });
  res.json(admins);
});

//@desc get all admins
//@route GET /api/admin/getadmins
//@access public
const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({});
  res.json(rooms);
});

//@desc create a new room
//@route GET /api/admin/createRoom
//@access public
const createNewRoom = asyncHandler(async (req, res) => {
  const { roomId, password, description } = req.body;
  if (!roomId) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const roomExists = await Room.findOne({
    roomId,
  });
  if (roomExists) {
    res.status(400);
    throw new Error("Room already exists, Kindly create a new roomId");
  }
  const room = await Room.create({
    roomId,
    password,
    users: [],
    description,
  });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: roomId,
    password: hashedPassword,
    name: roomId,
    roomId,
    role: "Host",
  });
  const hmm = await Room.findOneAndUpdate(
    { roomId: roomId },
    {
      $push: { users: roomId },
    },
    {
      new: true,
    }
  );

  const an = await Announcement.create({
    roomId,
    message: " ",
  });

  if (room) {
    console.log("Room created");
    res.status(201).json({
      _id: room.id,
      roomId,
      users: room.users,
      description,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc Delete a User
//@route DELETE /api/admin/deleteUser/:id
//@access public
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //first delete the User in corresponding Room
  const user = await User.findOne({ username: id });
  const room = await Room.findOneAndUpdate(
    { roomId: user.roomId },
    { $pull: { users: id } }
  );
  await User.findOneAndDelete({ username: id });
  res.json({
    message: "User Successfully Deleted",
  });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const admin = await Admin.findOne({ username: id });
  console.log(admin.username);
  console.log(admin.roomId);
  for (const roomId in admin.roomId) {
    console.log(admin.roomId[roomId]);
    const room = await Room.findOne({ roomId: admin.roomId[roomId] });
    // console.log(room.roomId);
    if (room) {
      console.log(room.roomId);
      for (const user in room.users) {
        console.log(room.users[user]);
        await User.findOneAndDelete({ username: room.users[user] });
        if (room.users[user] !== id) {
          const admin = await Admin.findOne({ username: room.users[username] });
          if (admin) {
            for (const roomId in admin.roomId) {
              console.log(admin.roomId[roomId]);
              if (admin.roomId[roomId] === id) {
                var updated = admin.roomId.splice(roomId, 1);
                //  await admin.save();
              }
            }
          }
        }
      }
      await Room.findOneAndDelete({ roomId: admin.roomId[roomId] });
      console.log("Room Deleted");
    } else {
      console.log("Room not found");
    }
  }
  await Admin.findOneAndDelete({ username: id });
  console.log("Admin Deleted");
  res.json({
    message: "Admin Successfully Deleted",
  });
});

//@desc Login the user
//@route POST /api/users/login
//@access public
const loginAdmin = asyncHandler(async (req, res) => {
  console.log("Logging in User");
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const admin = await Admin.findOne({ username });
  console.log(admin);
  if (admin.isDisabled) {
    res.status(201);
    throw new Error("You are disabled, Kindly contact the Owner.");
  } else {
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const accessToken = jwt.sign(
        {
          admin: {
            _id: admin._id,
            username: admin.username,
            name: admin.name,
            roomId: admin.roomId,
            role: admin.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(200).json({
        accessToken,
        username: admin.username,
        roomId: admin.roomId,
        role: admin.role,
      });
    } else {
      res.status(401);
      throw new Error("Invalid username or password");
    }
  }
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const room = await Room.findOne({ roomId: id });
  console.log("room found");
  console.log(room.users);
  for (username in room.users) {
    console.log(room.users[username]);
    await User.findOneAndDelete({ username: room.users[username] });
    const admin = await Admin.findOne({ username: room.users[username] });
    if (admin) {
      for (const roomId in admin.roomId) {
        console.log(admin.roomId[roomId]);
        if (admin.roomId[roomId] === id) {
          var updated = admin.roomId.splice(roomId, 1);
        }
      }
      await admin.save();
    }
  }
  await Room.findOneAndDelete({ roomId: id });
  res.status(200).json({
    message: "Room Successfully Deleted",
  });
});

const addRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roomId } = req.params;
  console.log(roomId);
  const admin = await Admin.findOne({ username: id });
  admin.roomId.push(roomId);
  await admin.save();
  console.log("Room added to admin");
  const room = await Room.findOne({ roomId });
  console.log(room.roomId);
  room.users.push(id);
  await room.save();
  console.log("Admin added to room");
  res.status(200).json({
    message: "Room Successfully Added",
  });
});

const disableRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  console.log(roomId);
  const room = await Room.findOne({ roomId });
  room.isDisabled = true;
  await room.save();
  res.status(200).json({
    message: "Room Successfully Disabled",
  });
});

const enableRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const room = await Room.findOne({ roomId: id });
  room.isDisabled = false;
  await room.save();
  res.status(200).json({
    message: "Room Successfully Enabled",
  });
});

const getAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findOne({ username: id });
  res.status(200).json({
    admin,
  });
});

const getRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const room = await Room.findOne({ roomId: id });
  res.status(200).json(room);
});

const newAnnouncement = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { announcement } = req.body;
  console.log(announcement);
  const room = Announcement.findOne({ roomId });
  if (room) {
    room.message = announcement;
    await Announcement.findOneAndUpdate({ roomId }, { message: announcement });
    res.status(200).json({
      message: "Announcement Updated",
    });
  } else {
    res.status(404);
    throw new Error("Room not found");
  }
});

const changeAdminPassword = asyncHandler(async (req, res) => {
  const { userId, password, newPassword } = req.body;
  console.log(userId);
  console.log(password);
  console.log(newPassword);
  const admin = await Admin.findOne({ username: userId });
  if (admin && (await bcrypt.compare(password, admin.password))) {
    const newEncryptedpassword = await bcrypt.hash(newPassword, 10);
    await Admin.findOneAndUpdate(
      { username: userId },
      { password: newEncryptedpassword }
    );
    console.log("Password Updated");
    res.status(200).json({
      message: "Password Updated",
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

const setHostInRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const host = Room.findOneAndUpdate(
    { roomId },
    {
      isHostIn: true,
    }
  );
  res.status(200).json({
    message: "Host In The Room",
  });
});

const setHostOutRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const host = Room.findOneAndUpdate(
    { roomId },
    {
      isHostIn: false,
    }
  );
  res.status(200).json({
    message: "Host Out The Room",
  });
});

const setUserDisabled = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    { username: userId },
    {
      isDisabled: true,
    }
  );
  res.status(200).json({
    message: "User Disabled",
  });
});

const setUserEnabled = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    { username: userId },
    {
      isDisabled: false,
    }
  );
  res.status(200).json({
    message: "User Enabled",
  });
});

const setIsMuted = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    { username: userId },
    {
      isMuted: true,
    }
  );
  res.status(200).json({
    message: "User is Muted",
  });
});

const setIsUnmuted = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    { username: userId },
    {
      isMuted: false,
    }
  );
  res.status(200).json({
    message: "User is Unmuted",
  });
});

const setAudioSubscribed = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    {
      username: userId,
    },
    {
      isAudioSubscribed: true,
    }
  );
  res.status(200).json({
    message: "Audio Subscribed",
  });
});

const setAudioUnSubscribed = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = User.findOneAndUpdate(
    {
      username: userId,
    },
    {
      isAudioSubscribed: false,
    }
  );
  res.status(200).json({
    message: "Audio Unsubscribed",
  });
});

const disableAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findOne({ username: id });
  admin.isDisabled = true;
  await admin.save();
  res.status(200).json({
    message: "Admin Successfully Disabled",
  });
});

const enableAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findOne({ username: id });
  admin.isDisabled = false;
  await admin.save();
  res.status(200).json({
    message: "Admin Successfully Disabled",
  });
});

module.exports = {
  getAllUsers,
  getAllAdmins,
  createNewRoom,
  getAllRooms,
  deleteUser,
  deleteAdmin,
  loginAdmin,
  deleteRoom,
  enableRoom,
  disableRoom,
  addRoom,
  getAdmin,
  getRoom,
  newAnnouncement,
  changeAdminPassword,
  setHostInRoom,
  setHostOutRoom,
  setUserDisabled,
  setUserEnabled,
  setIsMuted,
  setIsUnmuted,
  setAudioSubscribed,
  setAudioUnSubscribed,
  enableAdmin,
  disableAdmin,
};
