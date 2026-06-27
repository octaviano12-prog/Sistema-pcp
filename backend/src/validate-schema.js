import fs from 'fs';
import { normalizeSql } from './db.js';

const schema = fs.readFileSync(new URL('../../database/schema.sql', import.meta.url), 'utf8');
const normalized = normalizeSql(schema);

if (normalized.includes('DECIMAL(15,4)_')) {
  throw new Error('Invalid schema conversion: DECIMAL token leaked into a column name.');
}

console.log('Schema validation passed.');
