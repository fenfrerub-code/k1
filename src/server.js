const app = require('./app');
const { port, env } = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(port, () => {
  logger.info(`OrderHub backend dang chay`, { port, env, docs: `http://localhost:${port}/api/docs` });
});

// Tat gracefully khi nhan tin hieu dung (Docker, Ctrl+C...) de khong cat
// ngang cac request/transaction dang chay do.
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

module.exports = server;
