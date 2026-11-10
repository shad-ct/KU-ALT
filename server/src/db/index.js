import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { logger } from '../middleware/logger.middleware.js';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  timezone: '+00:00', // Stored in UTC
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    acquire: 30000,
    idle: 10000,
  },
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL Database connection established successfully (UTC, utf8mb4).');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Unable to connect to MySQL database:');
    return false;
  }
};

