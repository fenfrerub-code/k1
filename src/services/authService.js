const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const SALT_ROUNDS = 12;

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function toPublicUser(user) {
  // KHONG BAO GIO tra password_hash ve cho client.
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

async function register({ email, password, name, phone }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw AppError.conflict('Email nay da duoc dang ky');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, passwordHash, name, phone });
  logger.info('User registered', { userId: user.id });
  const token = issueToken(user);
  return { user: toPublicUser(user), token };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  // Co tinh khong phan biet "sai email" vs "sai mat khau" trong message tra
  // ve, de tranh lo ai co tai khoan trong he thong.
  if (!user) throw AppError.unauthorized('Email hoac mat khau khong dung');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw AppError.unauthorized('Email hoac mat khau khong dung');

  if (user.status !== 'active') throw AppError.forbidden('Tai khoan da bi khoa/vo hieu hoa');

  logger.info('User logged in', { userId: user.id });
  const token = issueToken(user);
  return { user: toPublicUser(user), token };
}

// Dung JWT stateless nen "logout" thuc chat la client tu xoa token.
// Ham nay ton tai de co 1 endpoint ro rang + log lai thoi diem logout,
// va la noi de sau nay gan token-blacklist/refresh-token that neu can.
async function logout(userId) {
  logger.info('User logged out', { userId });
  return true;
}

async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw AppError.notFound('Khong tim thay user');
  return toPublicUser(user);
}

module.exports = { register, login, logout, getCurrentUser, toPublicUser };
