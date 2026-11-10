import { sequelize } from './index.js';
import { logger } from '../middleware/logger.middleware.js';

const DEADLOCK_ERROR_CODE = 1213; // MySQL ER_LOCK_DEADLOCK
const MAX_RETRIES = 3;

/**
 * Executes a database operation within a managed Sequelize transaction
 * with automatic deadlock retry (up to 3 times with exponential backoff + jitter).
 * 
 * @template T
 * @param {(t: import('sequelize').Transaction) => Promise<T>} fn - Transaction callback
 * @param {import('sequelize').TransactionOptions} [options={}] - Transaction options
 * @returns {Promise<T>} Result of the callback
 */
export const withTx = async (fn, options = {}) => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await sequelize.transaction(options, async (t) => {
        return await fn(t);
      });
    } catch (error) {
      attempt++;

      const isDeadlock =
        error?.original?.errno === DEADLOCK_ERROR_CODE ||
        error?.parent?.errno === DEADLOCK_ERROR_CODE ||
        error?.message?.includes('Deadlock found when trying to get lock');

      if (isDeadlock && attempt < MAX_RETRIES) {
        // Exponential backoff with random jitter: (50ms * 2^attempt) + random(0-50ms)
        const delay = Math.pow(2, attempt) * 50 + Math.floor(Math.random() * 50);
        logger.warn(
          { attempt, maxRetries: MAX_RETRIES, delayMs: delay },
          'Database deadlock detected (ER_LOCK_DEADLOCK 1213). Retrying transaction with jitter...'
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If not deadlock or retries exhausted, rethrow
      throw error;
    }
  }
};

