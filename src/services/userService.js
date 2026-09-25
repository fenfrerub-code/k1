const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const { toPublicUser } = require('./authService');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw AppError.notFound('Khong tim thay user');
  return toPublicUser(user);
}

// Chi cho phep sua name/phone - KHONG bao gio nhan user_id, role, email,
// status tu request body de tranh user tu nang quyen cho minh.
async function updateProfile(userId, { name, phone }) {
  const updated = await userRepository.updateProfile(userId, { name, phone });
  if (!updated) throw AppError.notFound('Khong tim thay user');
  return updated;
}

module.exports = { getProfile, updateProfile };
