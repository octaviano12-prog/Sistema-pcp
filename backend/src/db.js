import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'pcp_pro.db');

let db = null;

// Wrapper to provide better-sqlite3-like API
class DatabaseWrapper {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  prepare(sql) {
    return {
      run: (...params) => {
        this.db.run(sql, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        const lastId = this.db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0] || 0;
        const changes = this.db.getRowsModified();
        return { lastInsertRowid: lastId, changes };
      },
      get: (...params) => {
        const stmt = this.db.prepare(sql);
        stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          stmt.free();
          const result = {};
          columns.forEach((col, i) => result[col] = values[i]);
          return result;
        }
        stmt.free();
        return undefined;
      },
      all: (...params) => {
        const results = [];
        const stmt = this.db.prepare(sql);
        stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        const columns = stmt.getColumnNames();
        while (stmt.step()) {
          const values = stmt.get();
          const row = {};
          columns.forEach((col, i) => row[col] = values[i]);
          results.push(row);
        }
        stmt.free();
        return results;
      }
    };
  }

  exec(sql) {
    this.db.run(sql);
  }

  pragma(pragma) {
    try {
      this.db.run(`PRAGMA ${pragma}`);
    } catch (e) {
      // Ignore pragma errors
    }
  }
}

export async function initDatabase() {
  const SQL = await initSqlJs();
  fs.mkdirSync(dataDir, { recursive: true });
  
  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new DatabaseWrapper(new SQL.Database(buffer));
  } else {
    db = new DatabaseWrapper(new SQL.Database());
  }

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      trade_name TEXT,
      cnpj TEXT,
      state_registration TEXT,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      logo_url TEXT,
      plan TEXT DEFAULT 'starter',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      document TEXT,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'finished',
      unit TEXT DEFAULT 'UN',
      cost_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      min_stock REAL DEFAULT 0,
      max_stock REAL DEFAULT 0,
      lead_time_days INTEGER DEFAULT 0,
      weight REAL DEFAULT 0,
      dimensions TEXT,
      image_url TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS product_boms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      component_id INTEGER NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT DEFAULT 'UN',
      loss_percentage REAL DEFAULT 0,
      unit_cost REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (component_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS production_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      sequence INTEGER NOT NULL,
      operation_name TEXT NOT NULL,
      machine_id INTEGER,
      standard_time_minutes REAL DEFAULT 0,
      setup_time_minutes REAL DEFAULT 0,
      hourly_cost REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (machine_id) REFERENCES machines(id)
    );

    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      type TEXT,
      sector TEXT,
      capacity_per_hour REAL DEFAULT 0,
      hourly_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'available',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_cost REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      reason TEXT,
      reference_type TEXT,
      reference_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      order_number TEXT NOT NULL,
      order_date DATE DEFAULT CURRENT_DATE,
      delivery_date DATE,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'open',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      sales_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL DEFAULT 0,
      total_price REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS production_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      order_number TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      sales_order_id INTEGER,
      customer_id INTEGER,
      planned_quantity REAL NOT NULL,
      produced_quantity REAL DEFAULT 0,
      rejected_quantity REAL DEFAULT 0,
      planned_start_date DATE,
      planned_end_date DATE,
      real_start_date DATE,
      real_end_date DATE,
      responsible_id INTEGER,
      status TEXT DEFAULT 'planned',
      priority TEXT DEFAULT 'normal',
      notes TEXT,
      planned_cost REAL DEFAULT 0,
      real_cost REAL DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (responsible_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS production_order_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      production_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      planned_quantity REAL NOT NULL,
      reserved_quantity REAL DEFAULT 0,
      consumed_quantity REAL DEFAULT 0,
      unit_cost REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS production_order_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      production_order_id INTEGER NOT NULL,
      sequence INTEGER NOT NULL,
      operation_name TEXT NOT NULL,
      machine_id INTEGER,
      planned_time_minutes REAL DEFAULT 0,
      real_time_minutes REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
      FOREIGN KEY (machine_id) REFERENCES machines(id)
    );

    CREATE TABLE IF NOT EXISTS production_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      production_order_id INTEGER NOT NULL,
      operation_id INTEGER,
      user_id INTEGER,
      machine_id INTEGER,
      start_time DATETIME,
      end_time DATETIME,
      total_time_minutes REAL DEFAULT 0,
      produced_quantity REAL DEFAULT 0,
      rejected_quantity REAL DEFAULT 0,
      stop_reason TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
      FOREIGN KEY (operation_id) REFERENCES production_order_operations(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (machine_id) REFERENCES machines(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      monthly_value REAL DEFAULT 0,
      start_date DATE DEFAULT CURRENT_DATE,
      next_billing_date DATE,
      payment_provider TEXT,
      payment_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
}

export function getDb() {
  return db;
}

export function saveDatabase() {
  if (db && db.db) {
    const data = db.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export default { initDatabase, getDb, saveDatabase };
