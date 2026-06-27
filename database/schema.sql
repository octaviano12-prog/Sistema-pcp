CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_boms (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_routes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE machines (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_orders (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  customer_id INTEGER,
  order_number TEXT NOT NULL,
  order_date DATE,
  delivery_date DATE,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_order_items (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  sales_order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL DEFAULT 0,
  total_price REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_orders (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  order_number TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  sales_order_id INTEGER,
  customer_id INTEGER,
  planned_quantity REAL NOT NULL,
  produced_quantity REAL DEFAULT 0,
  planned_start_date DATE,
  planned_end_date DATE,
  real_start_date DATE,
  real_end_date DATE,
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'normal',
  planned_cost REAL DEFAULT 0,
  real_cost REAL DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_order_materials (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  production_order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  planned_quantity REAL DEFAULT 0,
  reserved_quantity REAL DEFAULT 0,
  consumed_quantity REAL DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  total_cost REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_order_operations (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  production_order_id INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  operation_name TEXT NOT NULL,
  machine_id INTEGER,
  planned_time_minutes REAL DEFAULT 0,
  real_time_minutes REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  plan TEXT DEFAULT 'starter',
  status TEXT DEFAULT 'active',
  monthly_value REAL DEFAULT 0,
  start_date DATE DEFAULT (CURRENT_DATE),
  next_billing_date DATE,
  payment_provider TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
