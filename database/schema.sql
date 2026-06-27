-- =============================================
-- PCP Pro Industrial - Schema do Banco de Dados
-- MySQL 8.0+
-- =============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_pcp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_pcp;

-- =============================================
-- TABELA: companies (empresas)
-- =============================================
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  cnpj VARCHAR(20),
  state_registration VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  logo_url TEXT,
  plan ENUM('starter', 'profissional', 'industrial') DEFAULT 'starter',
  status ENUM('active', 'blocked', 'trial', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: users (usuários)
-- =============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'pcp', 'production', 'stock', 'purchases', 'financial', 'viewer') DEFAULT 'viewer',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: customers (clientes)
-- =============================================
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: products (produtos)
-- =============================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('finished', 'intermediate', 'raw_material', 'input', 'packaging', 'service') DEFAULT 'finished',
  unit VARCHAR(10) DEFAULT 'UN',
  cost_price DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  min_stock DECIMAL(12,2) DEFAULT 0,
  max_stock DECIMAL(12,2) DEFAULT 0,
  lead_time_days INT DEFAULT 0,
  weight DECIMAL(10,2) DEFAULT 0,
  dimensions VARCHAR(100),
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: product_boms (fichas técnicas)
-- =============================================
CREATE TABLE product_boms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  component_id INT NOT NULL,
  quantity DECIMAL(12,4) NOT NULL DEFAULT 1,
  unit VARCHAR(10) DEFAULT 'UN',
  loss_percentage DECIMAL(5,2) DEFAULT 0,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: machines (máquinas/centros de trabalho)
-- =============================================
CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  type VARCHAR(100),
  sector VARCHAR(100),
  capacity_per_hour DECIMAL(10,2) DEFAULT 0,
  hourly_cost DECIMAL(10,2) DEFAULT 0,
  status ENUM('available', 'occupied', 'maintenance', 'inactive') DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: production_routes (roteiros de produção)
-- =============================================
CREATE TABLE production_routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  sequence INT NOT NULL,
  operation_name VARCHAR(255) NOT NULL,
  machine_id INT,
  standard_time_minutes DECIMAL(10,2) DEFAULT 0,
  setup_time_minutes DECIMAL(10,2) DEFAULT 0,
  hourly_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
);

-- =============================================
-- TABELA: stock_movements (movimentações de estoque)
-- =============================================
CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  product_id INT NOT NULL,
  type ENUM('entrada_manual', 'saida_manual', 'compra', 'consumo_op', 'producao', 'ajuste_positivo', 'ajuste_negativo', 'reserva', 'estorno') NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  reason TEXT,
  reference_type VARCHAR(50),
  reference_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- TABELA: sales_orders (pedidos de venda)
-- =============================================
CREATE TABLE sales_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  customer_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  order_date DATE DEFAULT (CURRENT_DATE),
  delivery_date DATE,
  priority ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
  status ENUM('open', 'in_planning', 'in_production', 'partially_produced', 'produced', 'delivered', 'cancelled') DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: sales_order_items (itens do pedido)
-- =============================================
CREATE TABLE sales_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  sales_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0,
  status ENUM('pending', 'in_production', 'produced', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: production_orders (ordens de produção)
-- =============================================
CREATE TABLE production_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  product_id INT NOT NULL,
  sales_order_id INT,
  customer_id INT,
  planned_quantity DECIMAL(12,4) NOT NULL,
  produced_quantity DECIMAL(12,4) DEFAULT 0,
  rejected_quantity DECIMAL(12,4) DEFAULT 0,
  planned_start_date DATE,
  planned_end_date DATE,
  real_start_date DATE,
  real_end_date DATE,
  responsible_id INT,
  status ENUM('planned', 'released', 'in_production', 'paused', 'finished', 'cancelled', 'delayed') DEFAULT 'planned',
  priority ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
  notes TEXT,
  planned_cost DECIMAL(12,2) DEFAULT 0,
  real_cost DECIMAL(12,2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- TABELA: production_order_materials (materiais da OP)
-- =============================================
CREATE TABLE production_order_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  product_id INT NOT NULL,
  planned_quantity DECIMAL(12,4) NOT NULL,
  reserved_quantity DECIMAL(12,4) DEFAULT 0,
  consumed_quantity DECIMAL(12,4) DEFAULT 0,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  status ENUM('pending', 'reserved', 'in_progress', 'consumed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: production_order_operations (operações da OP)
-- =============================================
CREATE TABLE production_order_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  sequence INT NOT NULL,
  operation_name VARCHAR(255) NOT NULL,
  machine_id INT,
  planned_time_minutes DECIMAL(10,2) DEFAULT 0,
  real_time_minutes DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'in_progress', 'finished', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
);

-- =============================================
-- TABELA: production_logs (apontamentos de produção)
-- =============================================
CREATE TABLE production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  production_order_id INT NOT NULL,
  operation_id INT,
  user_id INT,
  machine_id INT,
  start_time DATETIME,
  end_time DATETIME,
  total_time_minutes DECIMAL(10,2) DEFAULT 0,
  produced_quantity DECIMAL(12,4) DEFAULT 0,
  rejected_quantity DECIMAL(12,4) DEFAULT 0,
  stop_reason VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES production_order_operations(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
);

-- =============================================
-- TABELA: subscriptions (assinaturas)
-- =============================================
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  plan ENUM('starter', 'profissional', 'industrial') NOT NULL,
  status ENUM('active', 'trial', 'overdue', 'blocked', 'cancelled') DEFAULT 'active',
  monthly_value DECIMAL(10,2) DEFAULT 0,
  start_date DATE DEFAULT (CURRENT_DATE),
  next_billing_date DATE,
  payment_provider VARCHAR(50),
  payment_status ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- TABELA: audit_logs (logs de auditoria)
-- =============================================
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100),
  entity_id INT,
  old_value JSON,
  new_value JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_sales_orders_company ON sales_orders(company_id);
CREATE INDEX idx_production_orders_company ON production_orders(company_id);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_logs_order ON production_logs(production_order_id);

-- =============================================
-- FIM DO SCHEMA
-- =============================================
