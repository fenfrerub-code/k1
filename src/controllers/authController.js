const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(200).json({ message: 'Da dang xuat. Vui long xoa token o phia client.' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json(user);
});

module.exports = { register, login, logout, me };
