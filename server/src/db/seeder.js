import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';
import { logger } from '../middleware/logger.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const runSeeders = async (action = 'up') => {
  const queryInterface = sequelize.getQueryInterface();

  // Create sequelize_data table to track executed seeders
  await queryInterface.createTable('sequelize_data', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
  });

  // Check if initial tables already have data
  const [roleCount] = await queryInterface.sequelize.query('SELECT COUNT(*) as cnt FROM `roles`');
  if (roleCount[0]?.cnt > 0) {
    await queryInterface.sequelize.query(
      'INSERT IGNORE INTO `sequelize_data` (`name`) VALUES (?)',
      { replacements: ['20261108000000-seed-roles-and-demo-users.js'] }
    );
  }
  const [deptCount] = await queryInterface.sequelize.query('SELECT COUNT(*) as cnt FROM `departments`');
  if (deptCount[0]?.cnt > 0) {
    await queryInterface.sequelize.query(
      'INSERT IGNORE INTO `sequelize_data` (`name`) VALUES (?)',
      { replacements: ['20261108000001-seed-master-data.js'] }
    );
  }

  const [executedRows] = await queryInterface.sequelize.query(
    'SELECT `name` FROM `sequelize_data`'
  );
  const executedSet = new Set(executedRows.map((r) => r.name));

  const seedersDir = path.resolve(__dirname, '../../seeders');
  const seederFiles = fs
    .readdirSync(seedersDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  if (action === 'up') {
    logger.info('Executing database seeders in sequential order...');
    for (const seederFile of seederFiles) {
      if (executedSet.has(seederFile)) {
        continue;
      }
      logger.info(`Running seeder: ${seederFile}`);
      const seederPath = path.resolve(seedersDir, seederFile);
      const seeder = await import(`file://${seederPath}`);
      await seeder.up(queryInterface, sequelize.constructor);
      await queryInterface.sequelize.query(
        'INSERT INTO `sequelize_data` (`name`) VALUES (?)',
        { replacements: [seederFile] }
      );
      logger.info(`Seeder finished: ${seederFile}`);
    }
    logger.info('All pending seeders executed successfully.');
  } else {
    logger.info('Rolling back database seeders...');
    for (const seederFile of [...seederFiles].reverse()) {
      if (!executedSet.has(seederFile)) {
        continue;
      }
      logger.info(`Undoing seeder: ${seederFile}`);
      const seederPath = path.resolve(seedersDir, seederFile);
      const seeder = await import(`file://${seederPath}`);
      await seeder.down(queryInterface, sequelize.constructor);
      await queryInterface.sequelize.query(
        'DELETE FROM `sequelize_data` WHERE `name` = ?',
        { replacements: [seederFile] }
      );
    }
    logger.info('All seeders rolled back.');
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2] || 'up';
  runSeeders(cmd)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
