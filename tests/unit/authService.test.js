jest.mock('../../src/repositories/userRepository');
jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const userRepository = require('../../src/repositories/userRepository');
const authService = require('../../src/services/authService');

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('register: tu choi neu email da ton tai', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    await expect(authService.register({ email: 'a@b.com', password: '12345678', name: 'A' }))
      .rejects.toMatchObject({ code: 'CONFLICT' });
  });

  test('register: hash mat khau truoc khi luu, KHONG bao gio luu plaintext', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-value');
    userRepository.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', status: 'active' });

    await authService.register({ email: 'a@b.com', password: 'plain-password', name: 'A' });

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', expect.any(Number));
    const createArgs = userRepository.create.mock.calls[0][0];
    expect(createArgs.passwordHash).toBe('hashed-value');
    expect(createArgs).not.toHaveProperty('password'); // khong truyen plaintext xuong repository
  });

  test('login: sai mat khau -> 401, khong tiet lo email co ton tai hay khong', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', password_hash: 'hashed', status: 'active' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login({ email: 'a@b.com', password: 'wrong' }))
      .rejects.toMatchObject({ code: 'UNAUTHORIZED', statusCode: 401 });
  });

  test('login: email khong ton tai cung tra ve 401 giong het sai mat khau', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(authService.login({ email: 'khong-ton-tai@b.com', password: 'x' }))
      .rejects.toMatchObject({ code: 'UNAUTHORIZED', statusCode: 401 });
  });

  test('login: tai khoan bi khoa (status != active) -> 403', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', password_hash: 'hashed', status: 'suspended' });
    bcrypt.compare.mockResolvedValue(true);
    await expect(authService.login({ email: 'a@b.com', password: 'correct' }))
      .rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
  });

  test('toPublicUser khong bao gio tra password_hash ve client', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-value');
    userRepository.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', password_hash: 'hashed-value', status: 'active' });

    const { user } = await authService.register({ email: 'a@b.com', password: 'plain-password', name: 'A' });
    expect(user).not.toHaveProperty('password_hash');
  });
});
