const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getProfile = asyncHandler(async (req, res) => {
  res.json(await userService.getProfile(req.user.id));
});

const updateProfile = asyncHandler(async (req, res) => {
  // Chi lay dung 2 truong duoc phep sua - du body co gui them user_id/role
  // cung bi bo qua hoan toan, khong bao gio duoc dung toi service/DB.
  const { name, phone } = req.body;
  res.json(await userService.updateProfile(req.user.id, { name, phone }));
});

module.exports = { getProfile, updateProfile };
