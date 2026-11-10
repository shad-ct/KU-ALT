import { sequelize } from '../../db/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getHealth = (req, res) => {
  return successResponse(res, {
    status: 'UP',
    service: 'Kannur University R&D Cell Unified Portal API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  }, 'Service is operational');
};

export const getDbHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const latencyMs = Date.now() - startTime;

    return successResponse(res, {
      status: 'UP',
      database: 'MySQL 8.0',
      connected: true,
      latencyMs,
      timestamp: new Date().toISOString(),
    }, 'Database connection is healthy and responsive');
  } catch (error) {
    return errorResponse(
      res,
      'Database connection failed',
      503,
      { error: error.message },
      'DATABASE_UNAVAILABLE'
    );
  }
};

