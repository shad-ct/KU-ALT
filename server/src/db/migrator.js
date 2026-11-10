import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './index.js';
import { logger } from '../middleware/logger.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const migrator = new Umzug({
  migrations: {
    glob: path.resolve(__dirname, '../../migrations/*.js'),
    resolve: ({ name, path: migrationPath, context }) => {
      return {
        name,
        up: async () => {
          const migration = await import(`file://${migrationPath}`);
          return migration.up(context, sequelize.constructor);
        },
        down: async () => {
          const migration = await import(`file://${migrationPath}`);
          return migration.down(context, sequelize.constructor);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'sequelize_meta',
  }),
  logger: console,
});

// CLI invocation support (e.g. node src/db/migrator.js up)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2] || 'up';
  if (cmd === 'up') {
    migrator.up()
      .then((migrations) => {
        logger.info(`Executed ${migrations.length} migrations successfully.`);
        process.exit(0);
      })
      .catch((err) => {
        logger.error({ err }, 'Migration failed:');
        process.exit(1);
      });
  } else if (cmd === 'down') {
    migrator.down()
      .then(() => {
        logger.info('Rolled back last migration successfully.');
        process.exit(0);
      })
      .catch((err) => {
        logger.error({ err }, 'Migration rollback failed:');
        process.exit(1);
      });
  }
}

