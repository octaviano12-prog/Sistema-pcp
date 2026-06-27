import mysql from 'mysql2/promise';

let pool = null;
let lastInsertId = 0;

function env(...names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

function requireDatabaseConfig() {
  const required = {
    DB_HOST: env('DB_HOST', 'MYSQL_HOST', 'MYSQLHOST'),
    DB_USER: env('DB_USER', 'MYSQL_USER', 'MYSQLUSER'),
    DB_PASSWORD: env('DB_PASSWORD', 'MYSQL_PASSWORD', 'MYSQLPASSWORD'),
    DB_NAME: env('DB_NAME', 'MYSQL_DATABASE', 'MYSQLDATABASE'),
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing MySQL environment variables: ${missing.join(', ')}`);
  }
  return required;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  for (const [key, value] of Object.entries(row)) {
    if (typeof value !== 'string') continue;
    const isNumericValue = /^-?\d+(?:\.\d+)?$/.test(value);
    const looksNumericColumn = /(quantity|price|cost|stock|total|weight|minutes|hour|value|percentage|capacity|scrap|produced|planned|reserved|consumed|rejected|variation|difference|count)$/i.test(key);
    if (isNumericValue && looksNumericColumn) row[key] = Number(value);
  }
  return row;
}

function normalizeRows(rows) {
  return rows.map((row) => normalizeRow(row));
}

async function connectWithRetry(config) {
  const attempts = Number(process.env.DB_CONNECT_RETRIES || 5);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const dbPool = mysql.createPool({
        host: config.DB_HOST,
        port: Number(env('DB_PORT', 'MYSQL_PORT', 'MYSQLPORT') || 3306),
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
        queueLimit: 0,
        charset: 'utf8mb4',
      });

      await dbPool.query('SELECT 1');
      return dbPool;
    } catch (error) {
      lastError = error;
      console.error(`MySQL connection attempt ${attempt}/${attempts} failed: ${error.message}`);
      if (attempt < attempts) await wait(1500 * attempt);
    }
  }

  throw lastError;
}

export function normalizeSql(sql) {
  return sql
    .replace(/INSERT\s+OR\s+IGNORE/gi, 'INSERT IGNORE')
    .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
    .replace(/\bREAL\b/gi, 'DECIMAL(15,4)')
    .replace(/DATETIME\s+DEFAULT\s+CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/DATE\s+DEFAULT\s+CURRENT_DATE/gi, 'DATE DEFAULT (CURRENT_DATE)')
    .replace(/date\('now',\s*'-7 days'\)/gi, 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)')
    .replace(/date\('now'\)/gi, 'CURDATE()')
    .replace(/date\(([^)]+)\)/gi, 'DATE($1)')
    .replace(/strftime\('%Y-%m',\s*'now'\)/gi, "DATE_FORMAT(CURDATE(), '%Y-%m')")
    .replace(/strftime\('%Y-%m',\s*([^)]+)\)/gi, "DATE_FORMAT($1, '%Y-%m')");
}

class MySqlDatabase {
  prepare(sql) {
    const statement = normalizeSql(sql);
    return {
      run: async (...params) => {
        const [result] = await pool.execute(statement, params);
        lastInsertId = result.insertId || lastInsertId;
        return {
          lastInsertRowid: result.insertId || 0,
          insertId: result.insertId || 0,
          changes: result.affectedRows || 0,
        };
      },
      get: async (...params) => {
        if (/SELECT\s+last_insert_rowid\(\)\s+as\s+id/i.test(statement)) {
          return { id: lastInsertId };
        }
        const [rows] = await pool.execute(statement, params);
        return normalizeRow(rows[0]);
      },
      all: async (...params) => {
        const [rows] = await pool.execute(statement, params);
        return normalizeRows(rows);
      },
    };
  }

  async exec(sql) {
    const statements = normalizeSql(sql)
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }
  }

  async pragma() {
    // SQLite compatibility no-op.
  }
}

const schemaSql = `
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  cnpj VARCHAR(32),
  state_registration VARCHAR(64),
  email VARCHAR(255),
  phone VARCHAR(64),
  whatsapp VARCHAR(64),
  address VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(32),
  zip_code VARCHAR(32),
  logo_url TEXT,
  plan VARCHAR(64) DEFAULT 'starter',
  status VARCHAR(64) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'viewer',
  status VARCHAR(64) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(64),
  email VARCHAR(255),
  phone VARCHAR(64),
  whatsapp VARCHAR(64),
  address VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(32),
  notes TEXT,
  active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  code VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(64) DEFAULT 'finished',
  unit VARCHAR(32) DEFAULT 'UN',
  cost_price DECIMAL(15,4) DEFAULT 0,
  sale_price DECIMAL(15,4) DEFAULT 0,
  min_stock DECIMAL(15,4) DEFAULT 0,
  max_stock DECIMAL(15,4) DEFAULT 0,
  lead_time_days INT DEFAULT 0,
  weight DECIMAL(15,4) DEFAULT 0,
  dimensions VARCHAR(255),
  image_url TEXT,
  active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_boms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  component_id INT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(32) DEFAULT 'UN',
  loss_percentage DECIMAL(15,4) DEFAULT 0,
  unit_cost DECIMAL(15,4) DEFAULT 0,
  total_cost DECIMAL(15,4) DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  sequence INT NOT NULL,
  operation_name VARCHAR(255) NOT NULL,
  machine_id INT,
  standard_time_minutes DECIMAL(15,4) DEFAULT 0,
  setup_time_minutes DECIMAL(15,4) DEFAULT 0,
  hourly_cost DECIMAL(15,4) DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64),
  type VARCHAR(120),
  sector VARCHAR(120),
  capacity_per_hour DECIMAL(15,4) DEFAULT 0,
  hourly_cost DECIMAL(15,4) DEFAULT 0,
  status VARCHAR(64) DEFAULT 'available',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  type VARCHAR(120) NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4) DEFAULT 0,
  total_cost DECIMAL(15,4) DEFAULT 0,
  reason TEXT,
  reference_type VARCHAR(120),
  reference_id INT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  customer_id INT,
  order_number VARCHAR(120) NOT NULL,
  order_date DATE DEFAULT (CURRENT_DATE),
  delivery_date DATE,
  priority VARCHAR(64) DEFAULT 'normal',
  status VARCHAR(64) DEFAULT 'open',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  sales_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  unit_price DECIMAL(15,4) DEFAULT 0,
  total_price DECIMAL(15,4) DEFAULT 0,
  status VARCHAR(64) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fiscal_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  sales_order_id INT,
  customer_id INT,
  invoice_number VARCHAR(120) NOT NULL,
  series VARCHAR(20) DEFAULT '1',
  model VARCHAR(20) DEFAULT '55',
  type VARCHAR(32) DEFAULT 'nfe',
  status VARCHAR(64) DEFAULT 'draft',
  environment VARCHAR(32) DEFAULT 'homologation',
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_value DECIMAL(15,4) DEFAULT 0,
  access_key VARCHAR(80),
  protocol VARCHAR(80),
  provider VARCHAR(120) DEFAULT 'Demo Fiscal',
  error_message TEXT,
  xml_url TEXT,
  pdf_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_fiscal_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  tax_regime VARCHAR(64) DEFAULT 'simples_nacional',
  fiscal_environment VARCHAR(32) DEFAULT 'homologation',
  certificate_status VARCHAR(64) DEFAULT 'pending',
  certificate_expiration DATE,
  nfe_provider VARCHAR(120) DEFAULT 'Demo Fiscal',
  nfe_enabled BOOLEAN DEFAULT TRUE,
  auto_backup BOOLEAN DEFAULT TRUE,
  last_backup_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  order_number VARCHAR(120) NOT NULL,
  product_id INT NOT NULL,
  sales_order_id INT,
  customer_id INT,
  planned_quantity DECIMAL(15,4) NOT NULL,
  produced_quantity DECIMAL(15,4) DEFAULT 0,
  rejected_quantity DECIMAL(15,4) DEFAULT 0,
  planned_start_date DATE,
  planned_end_date DATE,
  real_start_date DATE,
  real_end_date DATE,
  responsible_id INT,
  status VARCHAR(64) DEFAULT 'planned',
  priority VARCHAR(64) DEFAULT 'normal',
  notes TEXT,
  planned_cost DECIMAL(15,4) DEFAULT 0,
  real_cost DECIMAL(15,4) DEFAULT 0,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_order_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  product_id INT NOT NULL,
  planned_quantity DECIMAL(15,4) NOT NULL,
  reserved_quantity DECIMAL(15,4) DEFAULT 0,
  consumed_quantity DECIMAL(15,4) DEFAULT 0,
  unit_cost DECIMAL(15,4) DEFAULT 0,
  total_cost DECIMAL(15,4) DEFAULT 0,
  status VARCHAR(64) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_order_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  sequence INT NOT NULL,
  operation_name VARCHAR(255) NOT NULL,
  machine_id INT,
  planned_time_minutes DECIMAL(15,4) DEFAULT 0,
  real_time_minutes DECIMAL(15,4) DEFAULT 0,
  status VARCHAR(64) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  operation_id INT,
  user_id INT,
  machine_id INT,
  start_time DATETIME,
  end_time DATETIME,
  total_time_minutes DECIMAL(15,4) DEFAULT 0,
  produced_quantity DECIMAL(15,4) DEFAULT 0,
  rejected_quantity DECIMAL(15,4) DEFAULT 0,
  stop_reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  plan VARCHAR(64) NOT NULL,
  status VARCHAR(64) DEFAULT 'active',
  monthly_value DECIMAL(15,4) DEFAULT 0,
  start_date DATE DEFAULT (CURRENT_DATE),
  next_billing_date DATE,
  payment_provider VARCHAR(120),
  payment_status VARCHAR(64) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  user_id INT,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120),
  entity_id INT,
  old_value JSON,
  new_value JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export async function initDatabase() {
  const config = requireDatabaseConfig();
  pool = await connectWithRetry(config);

  const db = new MySqlDatabase();
  await db.exec(schemaSql);
  return db;
}

export function getDb() {
  return new MySqlDatabase();
}

export function saveDatabase() {
  // MySQL persists each write immediately.
}

export default { initDatabase, getDb, saveDatabase };
