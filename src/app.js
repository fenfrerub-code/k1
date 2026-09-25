const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const { corsOrigin, rateLimitWindowMs, rateLimitMax, isProduction } = require('./config/env');
const swaggerSpec = require('./docs/swagger');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ---- Bao mat co ban ----
app.use(helmet()); // secure headers (X-Content-Type-Options, HSTS, v.v.)
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limit ap dung cho toan bo /api - han che brute-force, spam sync...
app.use('/api', rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Qua nhieu request, vui long thu lai sau.' } },
}));

// Log HTTP request - "combined" khi production, "dev" (gon hon) khi dev.
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// API docs: http://localhost:PORT/api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
