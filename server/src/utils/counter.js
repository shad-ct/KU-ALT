export async function getNextSequence(tx, key, prefix = '', padding = 6) {
  await tx.sequelize.query(
    'INSERT INTO counters (`key`, `seq`, `created_at`, `updated_at`) VALUES (?, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE `seq` = `seq` + 1, `updated_at` = NOW()',
    { replacements: [key], transaction: tx }
  );

  const [rows] = await tx.sequelize.query(
    'SELECT `seq` FROM counters WHERE `key` = ?',
    { replacements: [key], transaction: tx }
  );

  const seq = rows[0]?.seq || 1;
  const year = new Date().getFullYear();
  return `${prefix ? `${prefix}-${year}-` : ''}${String(seq).padStart(padding, '0')}`;
}
