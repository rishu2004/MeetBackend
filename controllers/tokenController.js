const asyncHandler = require("express-async-handler");
const {AccessToken} = require('livekit-server-sdk');
const dotenv = require('dotenv').config();

//@desc Generate Meeting Token
//@route POST /api/livekit/token
//@access public
const generateMeetingToken = asyncHandler(async (req, res) => {
    const {identity, room} = req.body;
    if (!identity || !room) {
        res.status(400);
        throw new Error("All fields are mandatory");
      }
    const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,{
        identity: identity,
    });

    token.addGrant({
        roomJoin: true,
        room: room,
    });
    console.log(req.body)

    res.status(200).json({token: token.toJwt()});
});

module.exports = {generateMeetingToken};