import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './db/index.js';
import { logger } from './middleware/logger.middleware.js';

const startServer = async () => {
  logger.info('Initializing Kannur University R&D Cell Unified Portal API...');

  // Verify database connectivity
  const dbConnected = await testConnection();
  if (!dbConnected && env.NODE_ENV === 'production') {
    logger.error('CRITICAL: Cannot boot production server without database connectivity.');
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode.`);
    logger.info(`API Base URL: http://localhost:${env.PORT}/api/v1`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error({ err }, 'Fatal startup error:');
  process.exit(1);
});

