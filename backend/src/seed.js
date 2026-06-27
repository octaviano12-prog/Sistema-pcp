import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';

initDatabase();

const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

// Super Admin company
const superAdminCompany = db.prepare(`INSERT OR IGNORE INTO companies (id, name, trade_name, cnpj, email, phone, plan, status) VALUES (1, 'PCP Pro Industrial', 'PCP Pro', '00.000.000/0001-00', 'admin@pcppro.com', '11999990000', 'industrial', 'active')`).run();

// Super Admin user
const superAdminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('superadmin@pcppro.com');
if (!superAdminExists) {
  db.prepare(`INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES (1, 'Super Administrador', 'superadmin@pcppro.com', ?, 'super_admin', 'active')`).run(hashPassword('admin123'));
}

// Demo company
const demoCompanyExists = db.prepare('SELECT id FROM companies WHERE cnpj = ?').get('12.345.678/0001-90');
if (!demoCompanyExists) {
  db.prepare(`INSERT INTO companies (id, name, trade_name, cnpj, state_registration, email, phone, whatsapp, address, city, state, zip_code, plan, status) VALUES (2, 'Metalúrgica Modelo Ltda', 'Metalúrgica Modelo', '12.345.678/0001-90', '123.456.789.000', 'contato@metalurgicamodelo.com.br', '1133334444', '11999887766', 'Rua Industrial, 500', 'São Paulo', 'SP', '01000-000', 'profissional', 'active')`).run();

  // Demo users
  const demoUsers = [
    { name: 'Carlos Administrador', email: 'carlos@metalurgica.com', role: 'admin' },
    { name: 'Ana PCP', email: 'ana@metalurgica.com', role: 'pcp' },
    { name: 'João Produção', email: 'joao@metalurgica.com', role: 'production' },
    { name: 'Maria Estoque', email: 'maria@metalurgica.com', role: 'stock' },
  ];
  demoUsers.forEach(u => {
    db.prepare(`INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES (2, ?, ?, ?, ?, 'active')`).run(u.name, u.email, hashPassword('demo123'), u.role);
  });

  // Demo customers
  const customers = [
    { name: 'Usina Alfa Ltda', document: '11.222.333/0001-44', email: 'compras@usinaalfa.com.br', phone: '1122223333', city: 'Campinas', state: 'SP' },
    { name: 'Companhia Beta S.A.', document: '22.333.444/0001-55', email: 'producao@betasa.com.br', phone: '1133334444', city: 'Guarulhos', state: 'SP' },
    { name: 'Indústria Gama Ltda', document: '33.444.555/0001-66', email: 'pcp@gamaind.com.br', phone: '1144445555', city: 'Osasco', state: 'SP' },
  ];
  customers.forEach(c => {
    db.prepare(`INSERT INTO customers (company_id, name, document, email, phone, city, state) VALUES (2, ?, ?, ?, ?, ?, ?)`).run(c.name, c.document, c.email, c.phone, c.city, c.state);
  });

  // Demo products
  const products = [
    { code: 'PA-001', name: 'Estrutura Metálica Modelo A', type: 'finished', unit: 'UN', cost_price: 2500, sale_price: 4500, min_stock: 2, max_stock: 20, lead_time_days: 15, weight: 150 },
    { code: 'PA-002', name: 'Suporte Industrial', type: 'finished', unit: 'UN', cost_price: 350, sale_price: 680, min_stock: 5, max_stock: 50, lead_time_days: 7, weight: 25 },
    { code: 'PA-003', name: 'Tanque Inox 500L', type: 'finished', unit: 'UN', cost_price: 8000, sale_price: 15000, min_stock: 1, max_stock: 5, lead_time_days: 30, weight: 200 },
    { code: 'MP-001', name: 'Tubo 50x50x3 mm', type: 'raw_material', unit: 'M', cost_price: 45, sale_price: 0, min_stock: 50, max_stock: 500, lead_time_days: 5, weight: 4.5 },
    { code: 'MP-002', name: 'Chapa A36 3/16"', type: 'raw_material', unit: 'PC', cost_price: 280, sale_price: 0, min_stock: 10, max_stock: 100, lead_time_days: 7, weight: 45 },
    { code: 'MP-003', name: 'Arame de Solda MIG', type: 'raw_material', unit: 'KG', cost_price: 25, sale_price: 0, min_stock: 20, max_stock: 200, lead_time_days: 3, weight: 1 },
    { code: 'MP-004', name: 'Primer Industrial', type: 'input', unit: 'L', cost_price: 35, sale_price: 0, min_stock: 10, max_stock: 100, lead_time_days: 3, weight: 1.2 },
    { code: 'MP-005', name: 'Chapa Inox 304 1.5mm', type: 'raw_material', unit: 'PC', cost_price: 650, sale_price: 0, min_stock: 5, max_stock: 30, lead_time_days: 10, weight: 35 },
    { code: 'MP-006', name: 'Parafuso Sextavado 3/8"', type: 'input', unit: 'CX', cost_price: 85, sale_price: 0, min_stock: 10, max_stock: 100, lead_time_days: 2, weight: 5 },
  ];
  products.forEach(p => {
    db.prepare(`INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight) VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.code, p.name, p.type, p.unit, p.cost_price, p.sale_price, p.min_stock, p.max_stock, p.lead_time_days, p.weight);
  });

  // BOM for Estrutura Metálica
  const estruturaId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('PA-001').id;
  const tuboId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-001').id;
  const chapaId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-002').id;
  const arameId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-003').id;
  const primerId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-004').id;
  const parafusoId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-006').id;

  const boms = [
    { product_id: estruturaId, component_id: tuboId, quantity: 12, unit: 'M', loss_percentage: 5, unit_cost: 45 },
    { product_id: estruturaId, component_id: chapaId, quantity: 2, unit: 'PC', loss_percentage: 10, unit_cost: 280 },
    { product_id: estruturaId, component_id: arameId, quantity: 1.5, unit: 'KG', loss_percentage: 15, unit_cost: 25 },
    { product_id: estruturaId, component_id: primerId, quantity: 0.5, unit: 'L', loss_percentage: 10, unit_cost: 35 },
    { product_id: estruturaId, component_id: parafusoId, quantity: 0.5, unit: 'CX', loss_percentage: 5, unit_cost: 85 },
  ];
  boms.forEach(b => {
    const totalCost = b.quantity * b.unit_cost * (1 + b.loss_percentage / 100);
    db.prepare(`INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)`).run(b.product_id, b.component_id, b.quantity, b.unit, b.loss_percentage, b.unit_cost, totalCost);
  });

  // BOM for Suporte Industrial
  const suporteId = db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('PA-002').id;
  const suporteBoms = [
    { product_id: suporteId, component_id: tuboId, quantity: 3, unit: 'M', loss_percentage: 5, unit_cost: 45 },
    { product_id: suporteId, component_id: chapaId, quantity: 1, unit: 'PC', loss_percentage: 10, unit_cost: 280 },
    { product_id: suporteId, component_id: arameId, quantity: 0.3, unit: 'KG', loss_percentage: 15, unit_cost: 25 },
  ];
  suporteBoms.forEach(b => {
    const totalCost = b.quantity * b.unit_cost * (1 + b.loss_percentage / 100);
    db.prepare(`INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)`).run(b.product_id, b.component_id, b.quantity, b.unit, b.loss_percentage, b.unit_cost, totalCost);
  });

  // Demo machines
  const machines = [
    { name: 'Serra Fita', code: 'maq-001', type: 'Corte', sector: 'Corte', capacity_per_hour: 20, hourly_cost: 45 },
    { name: 'Plasma CNC', code: 'maq-002', type: 'Corte', sector: 'Corte', capacity_per_hour: 15, hourly_cost: 85 },
    { name: 'Dobradeira', code: 'maq-003', type: 'Conformação', sector: 'Conformação', capacity_per_hour: 25, hourly_cost: 55 },
    { name: 'MIG Solda 01', code: 'maq-004', type: 'Soldagem', sector: 'Soldagem', capacity_per_hour: 10, hourly_cost: 65 },
    { name: 'MIG Solda 02', code: 'maq-005', type: 'Soldagem', sector: 'Soldagem', capacity_per_hour: 10, hourly_cost: 65 },
    { name: 'Cabine de Pintura', code: 'maq-006', type: 'Acabamento', sector: 'Pintura', capacity_per_hour: 8, hourly_cost: 75 },
    { name: 'Bancada de Montagem', code: 'maq-007', type: 'Montagem', sector: 'Montagem', capacity_per_hour: 12, hourly_cost: 40 },
  ];
  machines.forEach(m => {
    db.prepare(`INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, status) VALUES (2, ?, ?, ?, ?, ?, ?, 'available')`).run(m.name, m.code, m.type, m.sector, m.capacity_per_hour, m.hourly_cost);
  });

  // Production routes for Estrutura Metálica
  const machineIds = db.prepare('SELECT id, code FROM machines WHERE company_id = 2').all();
  const serraId = machineIds.find(m => m.code === 'maq-001').id;
  const plasmaId = machineIds.find(m => m.code === 'maq-002').id;
  const dobraId = machineIds.find(m => m.code === 'maq-003').id;
  const soldaId = machineIds.find(m => m.code === 'maq-004').id;
  const pinturaId = machineIds.find(m => m.code === 'maq-006').id;
  const montagemId = machineIds.find(m => m.code === 'maq-007').id;

  const routes = [
    { product_id: estruturaId, sequence: 1, operation_name: 'Corte', machine_id: serraId, standard_time_minutes: 30, setup_time_minutes: 15, hourly_cost: 45 },
    { product_id: estruturaId, sequence: 2, operation_name: 'Furação', machine_id: plasmaId, standard_time_minutes: 20, setup_time_minutes: 10, hourly_cost: 85 },
    { product_id: estruturaId, sequence: 3, operation_name: 'Dobra', machine_id: dobraId, standard_time_minutes: 25, setup_time_minutes: 10, hourly_cost: 55 },
    { product_id: estruturaId, sequence: 4, operation_name: 'Soldagem', machine_id: soldaId, standard_time_minutes: 60, setup_time_minutes: 15, hourly_cost: 65 },
    { product_id: estruturaId, sequence: 5, operation_name: 'Acabamento', machine_id: soldaId, standard_time_minutes: 30, setup_time_minutes: 0, hourly_cost: 65 },
    { product_id: estruturaId, sequence: 6, operation_name: 'Pintura', machine_id: pinturaId, standard_time_minutes: 45, setup_time_minutes: 15, hourly_cost: 75 },
    { product_id: estruturaId, sequence: 7, operation_name: 'Montagem Final', machine_id: montagemId, standard_time_minutes: 40, setup_time_minutes: 10, hourly_cost: 40 },
    { product_id: estruturaId, sequence: 8, operation_name: 'Inspeção', machine_id: montagemId, standard_time_minutes: 15, setup_time_minutes: 0, hourly_cost: 40 },
  ];
  routes.forEach(r => {
    db.prepare(`INSERT INTO production_routes (company_id, product_id, sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)`).run(r.product_id, r.sequence, r.operation_name, r.machine_id, r.standard_time_minutes, r.setup_time_minutes, r.hourly_cost);
  });

  // Demo stock movements (initial stock)
  const stockEntries = [
    { product_id: tuboId, type: 'entrada_manual', quantity: 200, unit_cost: 45 },
    { product_id: chapaId, type: 'entrada_manual', quantity: 30, unit_cost: 280 },
    { product_id: arameId, type: 'entrada_manual', quantity: 50, unit_cost: 25 },
    { product_id: primerId, type: 'entrada_manual', quantity: 25, unit_cost: 35 },
    { product_id: parafusoId, type: 'entrada_manual', quantity: 40, unit_cost: 85 },
    { product_id: db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('MP-005').id, type: 'entrada_manual', quantity: 8, unit_cost: 650 },
  ];
  stockEntries.forEach(s => {
    db.prepare(`INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, created_by) VALUES (2, ?, ?, ?, ?, ?, 'Estoque inicial', 2)`).run(s.product_id, s.type, s.quantity, s.unit_cost, s.quantity * s.unit_cost);
  });

  // Demo sales orders
  const today = new Date();
  const inDays = (d) => { const dt = new Date(today); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };

  db.prepare(`INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 1, 'PV-0001', ?, ?, 'alta', 'in_production')`).run(inDays(-10), inDays(5));
  const so1 = db.prepare('SELECT last_insert_rowid() as id').get().id;
  db.prepare(`INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 5, 4500, 22500)`).run(so1, estruturaId);

  db.prepare(`INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 2, 'PV-0002', ?, ?, 'normal', 'open')`).run(inDays(-3), inDays(15));
  const so2 = db.prepare('SELECT last_insert_rowid() as id').get().id;
  db.prepare(`INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 20, 680, 13600)`).run(so2, suporteId);

  db.prepare(`INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 3, 'PV-0003', ?, ?, 'urgente', 'in_planning')`).run(inDays(-5), inDays(-2));
  const so3 = db.prepare('SELECT last_insert_rowid() as id').get().id;
  db.prepare(`INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 2, 15000, 30000)`).run(so3, db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('PA-003').id);

  // Demo production orders
  db.prepare(`INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0001', ?, ?, 1, 5, 2, ?, ?, ?, 'in_production', 'alta', 12500, 5200, 2)`).run(estruturaId, so1, inDays(-5), inDays(5), inDays(-4));
  const op1 = db.prepare('SELECT last_insert_rowid() as id').get().id;

  db.prepare(`INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, status, priority, planned_cost, created_by) VALUES (2, 'OP-0002', ?, ?, 2, 20, 0, ?, ?, 'planned', 'normal', 7000, 2)`).run(suporteId, so2, inDays(2), inDays(12));
  const op2 = db.prepare('SELECT last_insert_rowid() as id').get().id;

  db.prepare(`INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0003', ?, ?, 3, 2, 0, ?, ?, ?, 'delayed', 'urgente', 16000, 0, 2)`).run(db.prepare('SELECT id FROM products WHERE code = ? AND company_id = 2').get('PA-003').id, so3, inDays(-15), inDays(-2), inDays(-14));

  db.prepare(`INSERT INTO production_orders (company_id, order_number, product_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, real_end_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0004', ?, 3, 3, ?, ?, ?, ?, 'finished', 'normal', 7500, 7800, 2)`).run(estruturaId, inDays(-30), inDays(-15), inDays(-30), inDays(-16));
  const op4 = db.prepare('SELECT last_insert_rowid() as id').get().id;

  // OP materials for OP-0001
  const opMaterials = [
    { production_order_id: op1, product_id: tuboId, planned_quantity: 60, reserved_quantity: 60, consumed_quantity: 24, unit_cost: 45, status: 'in_progress' },
    { production_order_id: op1, product_id: chapaId, planned_quantity: 10, reserved_quantity: 10, consumed_quantity: 4, unit_cost: 280, status: 'in_progress' },
    { production_order_id: op1, product_id: arameId, planned_quantity: 7.5, reserved_quantity: 7.5, consumed_quantity: 3, unit_cost: 25, status: 'in_progress' },
    { production_order_id: op1, product_id: primerId, planned_quantity: 2.5, reserved_quantity: 2.5, consumed_quantity: 0, unit_cost: 35, status: 'pending' },
  ];
  opMaterials.forEach(m => {
    db.prepare(`INSERT INTO production_order_materials (company_id, production_order_id, product_id, planned_quantity, reserved_quantity, consumed_quantity, unit_cost, total_cost, status) VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?)`).run(m.production_order_id, m.product_id, m.planned_quantity, m.reserved_quantity, m.consumed_quantity, m.unit_cost, m.planned_quantity * m.unit_cost, m.status);
  });

  // OP operations for OP-0001
  const opOps = [
    { production_order_id: op1, sequence: 1, operation_name: 'Corte', machine_id: serraId, planned_time_minutes: 150, real_time_minutes: 140, status: 'finished' },
    { production_order_id: op1, sequence: 2, operation_name: 'Furação', machine_id: plasmaId, planned_time_minutes: 100, real_time_minutes: 95, status: 'finished' },
    { production_order_id: op1, sequence: 3, operation_name: 'Dobra', machine_id: dobraId, planned_time_minutes: 125, real_time_minutes: 130, status: 'in_progress' },
    { production_order_id: op1, sequence: 4, operation_name: 'Soldagem', machine_id: soldaId, planned_time_minutes: 300, real_time_minutes: 0, status: 'pending' },
    { production_order_id: op1, sequence: 5, operation_name: 'Acabamento', machine_id: soldaId, planned_time_minutes: 150, real_time_minutes: 0, status: 'pending' },
    { production_order_id: op1, sequence: 6, operation_name: 'Pintura', machine_id: pinturaId, planned_time_minutes: 225, real_time_minutes: 0, status: 'pending' },
    { production_order_id: op1, sequence: 7, operation_name: 'Montagem Final', machine_id: montagemId, planned_time_minutes: 200, real_time_minutes: 0, status: 'pending' },
    { production_order_id: op1, sequence: 8, operation_name: 'Inspeção', machine_id: montagemId, planned_time_minutes: 75, real_time_minutes: 0, status: 'pending' },
  ];
  opOps.forEach(o => {
    db.prepare(`INSERT INTO production_order_operations (company_id, production_order_id, sequence, operation_name, machine_id, planned_time_minutes, real_time_minutes, status) VALUES (2, ?, ?, ?, ?, ?, ?, ?)`).run(o.production_order_id, o.sequence, o.operation_name, o.machine_id, o.planned_time_minutes, o.real_time_minutes, o.status);
  });

  // Production logs
  db.prepare(`INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity) VALUES (2, ?, (SELECT id FROM production_order_operations WHERE production_order_id = ? AND sequence = 1), 4, ?, ?, ?, 140, 5, 0)`).run(op1, op1, serraId, inDays(-4) + ' 08:00:00', inDays(-4) + ' 10:20:00');
  db.prepare(`INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity) VALUES (2, ?, (SELECT id FROM production_order_operations WHERE production_order_id = ? AND sequence = 2), 4, ?, ?, ?, 95, 5, 0)`).run(op1, op1, plasmaId, inDays(-3) + ' 08:00:00', inDays(-3) + ' 09:35:00');

  // Subscription
  db.prepare(`INSERT INTO subscriptions (company_id, plan, status, monthly_value, start_date, next_billing_date, payment_provider, payment_status) VALUES (2, 'profissional', 'active', 297, ?, ?, 'stripe', 'paid')`).run(inDays(-30), inDays(0));

  console.log('Seed data created successfully!');
} else {
  console.log('Seed data already exists.');
}
