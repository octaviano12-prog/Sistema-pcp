import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase, getDb, saveDatabase } from './db.js';
import { authenticateToken, requireRole, requireCompany, JWT_SECRET } from './middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const frontendDistPath = join(__dirname, '..', '..', 'frontend', 'dist');
const uploadsPath = join(__dirname, '..', 'uploads');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(frontendDistPath));
app.use('/uploads', express.static(uploadsPath));

app.get('/health', async (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Helper: get company_id filter
function companyFilter(req) {
  if (req.user.role === 'super_admin') return {};
  return { company_id: req.user.company_id };
}

// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const user = await getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Credenciais inválidas' });
  if (user.status !== 'active') return res.status(403).json({ error: 'Usuário inativo' });

  const company = user.company_id ? await getDb().prepare('SELECT * FROM companies WHERE id = ?').get(user.company_id) : null;
  const token = jwt.sign({ id: user.id, company_id: user.company_id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id, company_name: company?.trade_name || company?.name || 'PCP Pro' } });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await getDb().prepare('SELECT id, name, email, role, company_id, status, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const company = user.company_id ? await getDb().prepare('SELECT id, name, trade_name, plan, status FROM companies WHERE id = ?').get(user.company_id) : null;
  res.json({ ...user, company });
});

// ==================== COMPANIES ====================
app.get('/api/companies', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const companies = await getDb().prepare('SELECT * FROM companies ORDER BY created_at DESC').all();
  res.json(companies);
});

app.post('/api/companies', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const { name, trade_name, cnpj, email, phone, plan } = req.body;
  const result = await getDb().prepare('INSERT INTO companies (name, trade_name, cnpj, email, phone, plan) VALUES (?, ?, ?, ?, ?, ?)').run(name, trade_name, cnpj, email, phone, plan || 'starter');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/companies/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const { name, trade_name, cnpj, email, phone, plan, status } = req.body;
  await getDb().prepare('UPDATE companies SET name=?, trade_name=?, cnpj=?, email=?, phone=?, plan=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name, trade_name, cnpj, email, phone, plan, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/companies/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  await getDb().prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== USERS ====================
app.get('/api/users', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const users = await getDb().prepare('SELECT id, name, email, role, status, created_at FROM users WHERE company_id = ?').all(filter.company_id);
  res.json(users);
});

app.post('/api/users', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  const company_id = req.user.role === 'super_admin' ? req.body.company_id : req.user.company_id;
  const password_hash = bcrypt.hashSync(password || 'demo123', 10);
  try {
    const result = await getDb().prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(company_id, name, email, password_hash, role || 'viewer');
    res.json({ id: result.lastInsertRowid, name, email, role });
  } catch (e) {
    res.status(400).json({ error: 'Email já cadastrado' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { name, email, role, status } = req.body;
  await getDb().prepare('UPDATE users SET name=?, email=?, role=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name, email, role, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/users/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  await getDb().prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const customers = await getDb().prepare('SELECT * FROM customers WHERE company_id = ? ORDER BY name').all(filter.company_id);
  res.json(customers);
});

app.post('/api/customers', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { name, document, email, phone, whatsapp, address, city, state, notes } = req.body;
  const result = await getDb().prepare('INSERT INTO customers (company_id, name, document, email, phone, whatsapp, address, city, state, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, name, document, email, phone, whatsapp, address, city, state, notes);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  const { name, document, email, phone, whatsapp, address, city, state, notes, active } = req.body;
  await getDb().prepare('UPDATE customers SET name=?, document=?, email=?, phone=?, whatsapp=?, address=?, city=?, state=?, notes=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name, document, email, phone, whatsapp, address, city, state, notes, active, req.params.id);
  res.json({ success: true });
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== PRODUCTS ====================
app.get('/api/products', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const { type, search } = req.query;
  let query = 'SELECT * FROM products WHERE company_id = ?';
  const params = [filter.company_id];
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (search) { query += ' AND (name LIKE ? OR code LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY code';
  res.json(await getDb().prepare(query).all(...params));
});

app.get('/api/products/:id', authenticateToken, async (req, res) => {
  const product = await getDb().prepare('SELECT * FROM products WHERE id = ? AND company_id = ?').get(req.params.id, req.user.company_id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { code, name, description, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight, dimensions } = req.body;
  const result = await getDb().prepare('INSERT INTO products (company_id, code, name, description, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight, dimensions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, code, name, description, type || 'finished', unit || 'UN', cost_price || 0, sale_price || 0, min_stock || 0, max_stock || 0, lead_time_days || 0, weight || 0, dimensions);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { code, name, description, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight, dimensions, active } = req.body;
  await getDb().prepare('UPDATE products SET code=?, name=?, description=?, type=?, unit=?, cost_price=?, sale_price=?, min_stock=?, max_stock=?, lead_time_days=?, weight=?, dimensions=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND company_id=?').run(code, name, description, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight, dimensions, active, req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM products WHERE id = ? AND company_id = ?').run(req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== BOM (FICHA TÉCNICA) ====================
app.get('/api/boms', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const boms = await getDb().prepare(`SELECT pb.*, p.name as component_name, p.code as component_code, p.unit as component_unit, p.cost_price as component_cost
    FROM product_boms pb JOIN products p ON pb.component_id = p.id WHERE pb.company_id = ? ORDER BY pb.product_id, pb.id`).all(filter.company_id);
  res.json(boms);
});

app.get('/api/boms/product/:productId', authenticateToken, async (req, res) => {
  const boms = await getDb().prepare(`SELECT pb.*, p.name as component_name, p.code as component_code, p.unit as component_unit, p.cost_price as component_cost
    FROM product_boms pb JOIN products p ON pb.component_id = p.id WHERE pb.product_id = ? AND pb.company_id = ?`).all(req.params.productId, req.user.company_id);
  res.json(boms);
});

app.post('/api/boms', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { product_id, component_id, quantity, unit, loss_percentage, unit_cost, notes } = req.body;
  const total_cost = (quantity || 0) * (unit_cost || 0) * (1 + (loss_percentage || 0) / 100);
  const result = await getDb().prepare('INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, product_id, component_id, quantity, unit, loss_percentage || 0, unit_cost || 0, total_cost, notes);
  res.json({ id: result.lastInsertRowid, ...req.body, total_cost });
});

app.put('/api/boms/:id', authenticateToken, async (req, res) => {
  const { quantity, unit, loss_percentage, unit_cost, notes } = req.body;
  const total_cost = (quantity || 0) * (unit_cost || 0) * (1 + (loss_percentage || 0) / 100);
  await getDb().prepare('UPDATE product_boms SET quantity=?, unit=?, loss_percentage=?, unit_cost=?, total_cost=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND company_id=?').run(quantity, unit, loss_percentage, unit_cost, total_cost, notes, req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.delete('/api/boms/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM product_boms WHERE id = ? AND company_id = ?').run(req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== PRODUCTION ROUTES ====================
app.get('/api/routes', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const routes = await getDb().prepare(`SELECT pr.*, m.name as machine_name FROM production_routes pr LEFT JOIN machines m ON pr.machine_id = m.id WHERE pr.company_id = ? ORDER BY pr.product_id, pr.sequence`).all(filter.company_id);
  res.json(routes);
});

app.get('/api/routes/product/:productId', authenticateToken, async (req, res) => {
  const routes = await getDb().prepare(`SELECT pr.*, m.name as machine_name FROM production_routes pr LEFT JOIN machines m ON pr.machine_id = m.id WHERE pr.product_id = ? AND pr.company_id = ? ORDER BY pr.sequence`).all(req.params.productId, req.user.company_id);
  res.json(routes);
});

app.post('/api/routes', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { product_id, sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost, notes } = req.body;
  const result = await getDb().prepare('INSERT INTO production_routes (company_id, product_id, sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, product_id, sequence, operation_name, machine_id, standard_time_minutes || 0, setup_time_minutes || 0, hourly_cost || 0, notes);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/routes/:id', authenticateToken, async (req, res) => {
  const { sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost, notes } = req.body;
  await getDb().prepare('UPDATE production_routes SET sequence=?, operation_name=?, machine_id=?, standard_time_minutes=?, setup_time_minutes=?, hourly_cost=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND company_id=?').run(sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost, notes, req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.delete('/api/routes/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM production_routes WHERE id = ? AND company_id = ?').run(req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== MACHINES ====================
app.get('/api/machines', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const machines = await getDb().prepare('SELECT * FROM machines WHERE company_id = ? ORDER BY name').all(filter.company_id);
  res.json(machines);
});

app.post('/api/machines', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { name, code, type, sector, capacity_per_hour, hourly_cost, notes } = req.body;
  const result = await getDb().prepare('INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, name, code, type, sector, capacity_per_hour || 0, hourly_cost || 0, notes);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/machines/:id', authenticateToken, async (req, res) => {
  const { name, code, type, sector, capacity_per_hour, hourly_cost, status, notes } = req.body;
  await getDb().prepare('UPDATE machines SET name=?, code=?, type=?, sector=?, capacity_per_hour=?, hourly_cost=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND company_id=?').run(name, code, type, sector, capacity_per_hour, hourly_cost, status, notes, req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.delete('/api/machines/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM machines WHERE id = ? AND company_id = ?').run(req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== STOCK ====================
async function getStockForProduct(company_id, product_id) {
  const movements = await getDb().prepare('SELECT * FROM stock_movements WHERE company_id = ? AND product_id = ? ORDER BY created_at').all(company_id, product_id);
  let stock = 0;
  for (const m of movements) {
    if (['entrada_manual', 'compra', 'producao'].includes(m.type)) stock += m.quantity;
    else if (['saida_manual', 'consumo_op', 'ajuste_negativo'].includes(m.type)) stock -= m.quantity;
    else if (m.type === 'ajuste_positivo') stock += m.quantity;
    else if (m.type === 'estorno') stock += m.quantity;
  }
  return stock;
}

app.get('/api/stock', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const products = await getDb().prepare('SELECT * FROM products WHERE company_id = ? AND active = 1 ORDER BY name').all(filter.company_id);
  const stock = await Promise.all(products.map(async (p) => {
    const current = await getStockForProduct(filter.company_id, p.id);
    const reserved = (await getDb().prepare('SELECT COALESCE(SUM(reserved_quantity - consumed_quantity), 0) as reserved FROM production_order_materials WHERE company_id = ? AND product_id = ? AND status IN (?, ?)').get(filter.company_id, p.id, 'reserved', 'in_progress')).reserved;
    const available = current - reserved;
    let status = 'normal';
    if (current <= p.min_stock * 0.5) status = 'critical';
    else if (current <= p.min_stock) status = 'low';
    return { ...p, current_stock: current, reserved_stock: reserved, available_stock: available, stock_status: status };
  }));
  res.json(stock);
  });

app.get('/api/stock/product/:productId', authenticateToken, async (req, res) => {
  const movements = await getDb().prepare('SELECT sm.*, u.name as user_name, p.name as product_name FROM stock_movements sm LEFT JOIN users u ON sm.created_by = u.id JOIN products p ON sm.product_id = p.id WHERE sm.product_id = ? AND sm.company_id = ? ORDER BY sm.created_at DESC').all(req.params.productId, req.user.company_id);
  res.json(movements);
});

app.post('/api/stock/movement', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { product_id, type, quantity, unit_cost, reason, reference_type, reference_id } = req.body;
  const total_cost = (quantity || 0) * (unit_cost || 0);
  const result = await getDb().prepare('INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, reference_type, reference_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, product_id, type, quantity, unit_cost || 0, total_cost, reason, reference_type, reference_id, req.user.id);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.get('/api/stock/movements', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const movements = await getDb().prepare('SELECT sm.*, p.name as product_name, p.code as product_code, u.name as user_name FROM stock_movements sm JOIN products p ON sm.product_id = p.id LEFT JOIN users u ON sm.created_by = u.id WHERE sm.company_id = ? ORDER BY sm.created_at DESC LIMIT 200').all(filter.company_id);
  res.json(movements);
});

// ==================== SALES ORDERS ====================
app.get('/api/sales-orders', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const orders = await getDb().prepare(`SELECT so.*, c.name as customer_name FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE so.company_id = ? ORDER BY so.created_at DESC`).all(filter.company_id);
  const items = await getDb().prepare(`SELECT soi.*, p.name as product_name, p.code as product_code FROM sales_order_items soi JOIN products p ON soi.product_id = p.id WHERE soi.company_id = ?`).all(filter.company_id);
  const result = orders.map(o => ({ ...o, items: items.filter(i => i.sales_order_id === o.id) }));
  res.json(result);
});

app.get('/api/sales-orders/:id', authenticateToken, async (req, res) => {
  const order = await getDb().prepare('SELECT so.*, c.name as customer_name FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE so.id = ? AND so.company_id = ?').get(req.params.id, req.user.company_id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  const items = await getDb().prepare('SELECT soi.*, p.name as product_name, p.code as product_code FROM sales_order_items soi JOIN products p ON soi.product_id = p.id WHERE soi.sales_order_id = ?').all(req.params.id);
  res.json({ ...order, items });
});

app.post('/api/sales-orders', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { customer_id, order_date, delivery_date, priority, notes, items } = req.body;
  const lastOrder = await getDb().prepare('SELECT order_number FROM sales_orders WHERE company_id = ? ORDER BY id DESC LIMIT 1').get(company_id);
  const nextNum = lastOrder ? parseInt(lastOrder.order_number.replace('PV-', '')) + 1 : 1;
  const order_number = `PV-${String(nextNum).padStart(4, '0')}`;

  const result = await getDb().prepare('INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, notes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(company_id, customer_id, order_number, order_date || new Date().toISOString().split('T')[0], delivery_date, priority || 'normal', notes);
  const orderId = result.lastInsertRowid;

  if (items && items.length > 0) {
    for (const item of items) {
      const total_price = (item.quantity || 0) * (item.unit_price || 0);
      await getDb().prepare('INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)').run(company_id, orderId, item.product_id, item.quantity, item.unit_price, total_price);

    }
  }
  res.json({ id: orderId, order_number, ...req.body });
});

app.put('/api/sales-orders/:id', authenticateToken, async (req, res) => {
  const { customer_id, delivery_date, priority, status, notes } = req.body;
  await getDb().prepare('UPDATE sales_orders SET customer_id=?, delivery_date=?, priority=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND company_id=?').run(customer_id, delivery_date, priority, status, notes, req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.delete('/api/sales-orders/:id', authenticateToken, async (req, res) => {
  await getDb().prepare('DELETE FROM sales_order_items WHERE sales_order_id = ?').run(req.params.id);
  await getDb().prepare('DELETE FROM sales_orders WHERE id = ? AND company_id = ?').run(req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== PRODUCTION ORDERS ====================
app.get('/api/production-orders', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const orders = await getDb().prepare(`SELECT po.*, p.name as product_name, p.code as product_code, c.name as customer_name, so.order_number as sales_order_number
    FROM production_orders po
    JOIN products p ON po.product_id = p.id
    LEFT JOIN customers c ON po.customer_id = c.id
    LEFT JOIN sales_orders so ON po.sales_order_id = so.id
    WHERE po.company_id = ? ORDER BY po.created_at DESC`).all(filter.company_id);
  res.json(orders);
});

app.get('/api/production-orders/:id', authenticateToken, async (req, res) => {
  const order = await getDb().prepare(`SELECT po.*, p.name as product_name, p.code as product_code, c.name as customer_name
    FROM production_orders po JOIN products p ON po.product_id = p.id LEFT JOIN customers c ON po.customer_id = c.id
    WHERE po.id = ? AND po.company_id = ?`).get(req.params.id, req.user.company_id);
  if (!order) return res.status(404).json({ error: 'OP não encontrada' });

  const materials = await getDb().prepare('SELECT pom.*, p.name as product_name, p.code as product_code FROM production_order_materials pom JOIN products p ON pom.product_id = p.id WHERE pom.production_order_id = ?').all(req.params.id);
  const operations = await getDb().prepare('SELECT poo.*, m.name as machine_name FROM production_order_operations poo LEFT JOIN machines m ON poo.machine_id = m.id WHERE poo.production_order_id = ? ORDER BY poo.sequence').all(req.params.id);
  const logs = await getDb().prepare('SELECT pl.*, u.name as user_name, m.name as machine_name FROM production_logs pl LEFT JOIN users u ON pl.user_id = u.id LEFT JOIN machines m ON pl.machine_id = m.id WHERE pl.production_order_id = ? ORDER BY pl.created_at DESC').all(req.params.id);

  res.json({ ...order, materials, operations, logs });
});

app.post('/api/production-orders', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { product_id, sales_order_id, customer_id, planned_quantity, planned_start_date, planned_end_date, priority, notes } = req.body;

  // Check BOM exists
  const bomCount = (await getDb().prepare('SELECT COUNT(*) as count FROM product_boms WHERE product_id = ? AND company_id = ?').get(product_id, company_id)).count;
  if (bomCount === 0) return res.status(400).json({ error: 'Este produto ainda não possui ficha técnica. Cadastre a composição antes de liberar a produção.' });

  const lastOP = await getDb().prepare('SELECT order_number FROM production_orders WHERE company_id = ? ORDER BY id DESC LIMIT 1').get(company_id);
  const nextNum = lastOP ? parseInt(lastOP.order_number.replace('OP-', '')) + 1 : 1;
  const order_number = `OP-${String(nextNum).padStart(4, '0')}`;

  const result = await getDb().prepare('INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, planned_start_date, planned_end_date, priority, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, planned_start_date, planned_end_date, priority || 'normal', notes, req.user.id);
  const opId = result.lastInsertRowid;

  // Create materials from BOM
  const boms = await getDb().prepare('SELECT * FROM product_boms WHERE product_id = ? AND company_id = ?').all(product_id, company_id);
  for (const b of boms) {
    const qty = b.quantity * planned_quantity * (1 + b.loss_percentage / 100);
    await getDb().prepare('INSERT INTO production_order_materials (company_id, production_order_id, product_id, planned_quantity, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?, ?)').run(company_id, opId, b.component_id, qty, b.unit_cost, qty * b.unit_cost);
  }

  // Create operations from route
  const routes = await getDb().prepare('SELECT * FROM production_routes WHERE product_id = ? AND company_id = ? ORDER BY sequence').all(product_id, company_id);
  for (const r of routes) {
    await getDb().prepare('INSERT INTO production_order_operations (company_id, production_order_id, sequence, operation_name, machine_id, planned_time_minutes) VALUES (?, ?, ?, ?, ?, ?)').run(company_id, opId, r.sequence, r.operation_name, r.machine_id, r.standard_time_minutes * planned_quantity);
  }

  // Calculate planned cost
  const matCost = (await getDb().prepare('SELECT COALESCE(SUM(total_cost), 0) as total FROM production_order_materials WHERE production_order_id = ?').get(opId)).total;
  const opCost = routes.reduce((sum, r) => sum + (r.standard_time_minutes * planned_quantity / 60 * r.hourly_cost), 0);
  await getDb().prepare('UPDATE production_orders SET planned_cost = ? WHERE id = ?').run(matCost + opCost, opId);

  res.json({ id: opId, order_number });
});

app.post('/api/production-orders/:id/release', authenticateToken, async (req, res) => {
  const op = await getDb().prepare('SELECT * FROM production_orders WHERE id = ? AND company_id = ?').get(req.params.id, req.user.company_id);
  if (!op) return res.status(404).json({ error: 'OP não encontrada' });
  if (op.status !== 'planned') return res.status(400).json({ error: 'OP deve estar planejada para ser liberada' });

  // Reserve materials
  const materials = await getDb().prepare('SELECT * FROM production_order_materials WHERE production_order_id = ?').all(op.id);
  for (const m of materials) {
    const stock = await getStockForProduct(req.user.company_id, m.product_id);
    if (stock < m.planned_quantity) {
      return res.status(400).json({ error: `Estoque insuficiente para o produto ${m.product_id}. Disponível: ${stock}, Necessário: ${m.planned_quantity}` });
    }
  }
  // Reserve
  for (const m of materials) {
    await getDb().prepare('UPDATE production_order_materials SET reserved_quantity = planned_quantity, status = ? WHERE id = ?').run('reserved', m.id);
  }

  await getDb().prepare('UPDATE production_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('released', op.id);
  res.json({ success: true });
});

app.post('/api/production-orders/:id/start', authenticateToken, async (req, res) => {
  await getDb().prepare('UPDATE production_orders SET status = ?, real_start_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?').run('in_production', new Date().toISOString().split('T')[0], req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.post('/api/production-orders/:id/pause', authenticateToken, async (req, res) => {
  await getDb().prepare('UPDATE production_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?').run('paused', req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.post('/api/production-orders/:id/resume', authenticateToken, async (req, res) => {
  await getDb().prepare('UPDATE production_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?').run('in_production', req.params.id, req.user.company_id);
  res.json({ success: true });
});

app.post('/api/production-orders/:id/finish', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const op = await getDb().prepare('SELECT * FROM production_orders WHERE id = ? AND company_id = ?').get(req.params.id, company_id);
  if (!op) return res.status(404).json({ error: 'OP não encontrada' });

  // Consume materials
  const materials = await getDb().prepare('SELECT * FROM production_order_materials WHERE production_order_id = ?').all(op.id);
  for (const m of materials) {
    await getDb().prepare('UPDATE production_order_materials SET consumed_quantity = planned_quantity, status = ? WHERE id = ?').run('consumed', m.id);
    await getDb().prepare('INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, reference_type, reference_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, m.product_id, 'consumo_op', m.planned_quantity, m.unit_cost, m.planned_quantity * m.unit_cost, `Consumo OP ${op.order_number}`, 'production_order', op.id, req.user.id);
  }

  // Add finished product to stock
  await getDb().prepare('INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, reference_type, reference_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, op.product_id, 'producao', op.produced_quantity || op.planned_quantity, op.planned_cost / (op.planned_quantity || 1), op.planned_cost, `Produção OP ${op.order_number}`, 'production_order', op.id, req.user.id);

  await getDb().prepare('UPDATE production_orders SET status = ?, real_end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('finished', new Date().toISOString().split('T')[0], op.id);
  res.json({ success: true });
});

app.post('/api/production-orders/:id/cancel', authenticateToken, async (req, res) => {
  // Unreserve materials
  const materials = await getDb().prepare('SELECT * FROM production_order_materials WHERE production_order_id = ?').all(req.params.id);
  for (const m of materials) {
    await getDb().prepare('UPDATE production_order_materials SET reserved_quantity = 0, status = ? WHERE id = ?').run('cancelled', m.id);
  }
  await getDb().prepare('UPDATE production_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?').run('cancelled', req.params.id, req.user.company_id);
  res.json({ success: true });
});

// ==================== PRODUCTION LOGS ====================
app.get('/api/production-logs', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const logs = await getDb().prepare('SELECT pl.*, po.order_number, p.name as product_name, u.name as user_name, m.name as machine_name, poo.operation_name FROM production_logs pl JOIN production_orders po ON pl.production_order_id = po.id JOIN products p ON po.product_id = p.id LEFT JOIN users u ON pl.user_id = u.id LEFT JOIN machines m ON pl.machine_id = m.id LEFT JOIN production_order_operations poo ON pl.operation_id = poo.id WHERE pl.company_id = ? ORDER BY pl.created_at DESC LIMIT 200').all(filter.company_id);
  res.json(logs);
});

app.get('/api/production-logs/order/:productionOrderId', authenticateToken, async (req, res) => {
  const logs = await getDb().prepare('SELECT pl.*, u.name as user_name, m.name as machine_name, poo.operation_name FROM production_logs pl LEFT JOIN users u ON pl.user_id = u.id LEFT JOIN machines m ON pl.machine_id = m.id LEFT JOIN production_order_operations poo ON pl.operation_id = poo.id WHERE pl.production_order_id = ? AND pl.company_id = ? ORDER BY pl.created_at DESC').all(req.params.productionOrderId, req.user.company_id);
  res.json(logs);
});

app.post('/api/production-logs', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { production_order_id, operation_id, machine_id, start_time, end_time, produced_quantity, rejected_quantity, stop_reason, notes } = req.body;
  const total_time_minutes = start_time && end_time ? Math.round((new Date(end_time) - new Date(start_time)) / 60000) : 0;

  const result = await getDb().prepare('INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity, stop_reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company_id, production_order_id, operation_id, req.user.id, machine_id, start_time, end_time, total_time_minutes, produced_quantity || 0, rejected_quantity || 0, stop_reason, notes);

  // Update OP quantities
  if (produced_quantity) {
    await getDb().prepare('UPDATE production_orders SET produced_quantity = produced_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(produced_quantity, production_order_id);
  }
  if (rejected_quantity) {
    await getDb().prepare('UPDATE production_orders SET rejected_quantity = rejected_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(rejected_quantity, production_order_id);
  }

  // Update operation time
  if (operation_id && total_time_minutes > 0) {
    await getDb().prepare('UPDATE production_order_operations SET real_time_minutes = real_time_minutes + ? WHERE id = ?').run(total_time_minutes, operation_id);
  }

  // Calculate real cost
  const op = await getDb().prepare('SELECT * FROM production_orders WHERE id = ?').get(production_order_id);
  const logs = await getDb().prepare('SELECT * FROM production_logs WHERE production_order_id = ?').all(production_order_id);
  let machineCost = 0;
  for (const l of logs) {
    const machine = l.machine_id ? await getDb().prepare('SELECT hourly_cost FROM machines WHERE id = ?').get(l.machine_id) : null;
    machineCost += machine ? l.total_time_minutes / 60 * machine.hourly_cost : 0;
  }
  const matCost = (await getDb().prepare('SELECT COALESCE(SUM(total_cost), 0) as total FROM production_order_materials WHERE production_order_id = ?').get(production_order_id)).total;
  await getDb().prepare('UPDATE production_orders SET real_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(matCost + machineCost, production_order_id);

  res.json({ id: result.lastInsertRowid });
});

// ==================== PLANNING ====================
app.get('/api/planning', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const orders = await getDb().prepare(`SELECT so.*, c.name as customer_name FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE so.company_id = ? AND so.status IN ('open', 'in_planning') ORDER BY so.delivery_date ASC`).all(filter.company_id);
  const result = await Promise.all(orders.map(async (o) => {
    const items = await getDb().prepare(`SELECT soi.*, p.name as product_name, p.code as product_code, p.type as product_type FROM sales_order_items soi JOIN products p ON soi.product_id = p.id WHERE soi.sales_order_id = ?`).all(o.id);
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const stock = await getStockForProduct(filter.company_id, item.product_id);
      const bom = await getDb().prepare('SELECT COUNT(*) as count FROM product_boms WHERE product_id = ?').get(item.product_id);
      return { ...item, current_stock: stock, has_bom: bom.count > 0, needs_production: stock < item.quantity };
    }));
    return { ...o, items: enrichedItems };
  }));
  res.json(result);
});

app.post('/api/planning/check-materials', authenticateToken, async (req, res) => {
  const company_id = req.user.company_id;
  const { product_id, quantity } = req.body;
  const boms = await getDb().prepare('SELECT pb.*, p.name as component_name FROM product_boms pb JOIN products p ON pb.component_id = p.id WHERE pb.product_id = ?').all(product_id);
  const check = await Promise.all(boms.map(async (b) => {
    const needed = b.quantity * quantity * (1 + b.loss_percentage / 100);
    const stock = await getStockForProduct(company_id, b.component_id);
    return { ...b, needed, available: stock, sufficient: stock >= needed, deficit: Math.max(0, needed - stock) };
  }));
  res.json(check);
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  if (!cid) return res.json({});

  const openOps = (await getDb().prepare('SELECT COUNT(*) as count FROM production_orders WHERE company_id = ? AND status IN (?, ?, ?, ?)').get(cid, 'planned', 'released', 'in_production', 'paused')).count;
  const delayedOps = (await getDb().prepare("SELECT COUNT(*) as count FROM production_orders WHERE company_id = ? AND status IN ('in_production', 'released') AND planned_end_date < date('now')").get(cid)).count;
  const finishedThisMonth = (await getDb().prepare("SELECT COUNT(*) as count FROM production_orders WHERE company_id = ? AND status = 'finished' AND strftime('%Y-%m', real_end_date) = strftime('%Y-%m', 'now')").get(cid)).count;
  const todayProduction = (await getDb().prepare("SELECT COALESCE(SUM(produced_quantity), 0) as total FROM production_logs WHERE company_id = ? AND date(start_time) = date('now')").get(cid)).total;
  const activeProducts = await getDb().prepare('SELECT * FROM products WHERE company_id = ? AND active = 1').all(cid);
  let criticalStock = 0;
  for (const p of activeProducts) {
    const stock = await getStockForProduct(cid, p.id);
    if (stock <= p.min_stock) criticalStock += 1;
  }
  const plannedCostMonth = (await getDb().prepare("SELECT COALESCE(SUM(planned_cost), 0) as total FROM production_orders WHERE company_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get(cid)).total;
  const realCostMonth = (await getDb().prepare("SELECT COALESCE(SUM(real_cost), 0) as total FROM production_orders WHERE company_id = ? AND status = 'finished' AND strftime('%Y-%m', real_end_date) = strftime('%Y-%m', 'now')").get(cid)).total;
  const totalScrap = (await getDb().prepare("SELECT COALESCE(SUM(rejected_quantity), 0) as total FROM production_orders WHERE company_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get(cid)).total;

  res.json({ openOps, delayedOps, finishedThisMonth, todayProduction, criticalStock, plannedCostMonth, realCostMonth, totalScrap });
  });

app.get('/api/dashboard/charts', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  if (!cid) return res.json({});

  // Production by day (last 7 days)
  const dailyProd = await getDb().prepare("SELECT date(start_time) as day, COALESCE(SUM(produced_quantity), 0) as total FROM production_logs WHERE company_id = ? AND start_time >= date('now', '-7 days') GROUP BY date(start_time) ORDER BY day").all(cid);

  // OP status distribution
  const statusDist = await getDb().prepare('SELECT status, COUNT(*) as count FROM production_orders WHERE company_id = ? GROUP BY status').all(cid);

  // Top products
  const topProducts = await getDb().prepare('SELECT p.name, SUM(po.planned_quantity) as total FROM production_orders po JOIN products p ON po.product_id = p.id WHERE po.company_id = ? GROUP BY po.product_id ORDER BY total DESC LIMIT 5').all(cid);

  res.json({ dailyProd, statusDist, topProducts });
});

app.get('/api/dashboard/alerts', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  if (!cid) return res.json([]);
  const alerts = [];

  // Low stock
  const products = await getDb().prepare('SELECT * FROM products WHERE company_id = ? AND active = 1').all(cid);
  for (const p of products) {
    const stock = await getStockForProduct(cid, p.id);
    if (stock <= p.min_stock * 0.5) alerts.push({ type: 'critical', message: `${p.name}: estoque crítico (${stock} ${p.unit})`, entity: 'stock' });
    else if (stock <= p.min_stock) alerts.push({ type: 'warning', message: `${p.name}: estoque baixo (${stock} ${p.unit})`, entity: 'stock' });
  }

  // Delayed OPs
  const delayedOps = await getDb().prepare("SELECT order_number, p.name as product_name, planned_end_date FROM production_orders po JOIN products p ON po.product_id = p.id WHERE po.company_id = ? AND po.status IN ('in_production', 'released') AND po.planned_end_date < date('now')").all(cid);
  delayedOps.forEach(op => alerts.push({ type: 'danger', message: `OP ${op.order_number} (${op.product_name}) atrasada - prevista para ${op.planned_end_date}`, entity: 'production_order' }));

  // Products without BOM
  const noBom = await getDb().prepare("SELECT p.name FROM products p WHERE p.company_id = ? AND p.type = 'finished' AND p.active = 1 AND NOT EXISTS (SELECT 1 FROM product_boms WHERE product_id = p.id)").all(cid);
  noBom.forEach(p => alerts.push({ type: 'warning', message: `${p.name}: sem ficha técnica cadastrada`, entity: 'product' }));

  res.json(alerts);
  });

// ==================== REPORTS ====================
app.get('/api/reports/production', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  const { start_date, end_date } = req.query;
  let query = `SELECT po.*, p.name as product_name, c.name as customer_name FROM production_orders po JOIN products p ON po.product_id = p.id LEFT JOIN customers c ON po.customer_id = c.id WHERE po.company_id = ?`;
  const params = [cid];
  if (start_date) { query += ' AND po.created_at >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND po.created_at <= ?'; params.push(end_date + ' 23:59:59'); }
  query += ' ORDER BY po.created_at DESC';
  res.json(await getDb().prepare(query).all(...params));
});

app.get('/api/reports/costs', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  const orders = await getDb().prepare(`SELECT po.order_number, p.name as product_name, po.planned_quantity, po.produced_quantity, po.planned_cost, po.real_cost, po.status, ROUND(po.real_cost - po.planned_cost, 2) as difference, CASE WHEN po.planned_cost > 0 THEN ROUND((po.real_cost - po.planned_cost) / po.planned_cost * 100, 1) ELSE 0 END as variation_pct FROM production_orders po JOIN products p ON po.product_id = p.id WHERE po.company_id = ? AND po.status = 'finished' ORDER BY po.real_end_date DESC`).all(cid);
  res.json(orders);
});

app.get('/api/reports/stock', authenticateToken, async (req, res) => {
  const cid = req.user.company_id;
  const products = await getDb().prepare('SELECT * FROM products WHERE company_id = ? AND active = 1 ORDER BY name').all(cid);
  const report = (await Promise.all(products.map(async (p) => {
    const stock = await getStockForProduct(cid, p.id);
    return { code: p.code, name: p.name, unit: p.unit, current_stock: stock, min_stock: p.min_stock, max_stock: p.max_stock, cost_price: p.cost_price, total_value: stock * p.cost_price, status: stock <= p.min_stock * 0.5 ? 'critical' : stock <= p.min_stock ? 'low' : 'normal' };
  }))).filter(p => p.status !== 'normal');
  res.json(report);
});

// ==================== SUBSCRIPTIONS ====================
app.get('/api/subscriptions', authenticateToken, async (req, res) => {
  const filter = companyFilter(req);
  const subs = await getDb().prepare('SELECT s.*, c.name as company_name FROM subscriptions s JOIN companies c ON s.company_id = c.id WHERE s.company_id = ?').all(filter.company_id);
  res.json(subs);
  });

app.put('/api/subscriptions/:id', authenticateToken, requireRole('super_admin', 'admin'), async (req, res) => {
  const { plan, status, monthly_value, next_billing_date } = req.body;
  await getDb().prepare('UPDATE subscriptions SET plan=?, status=?, monthly_value=?, next_billing_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(plan, status, monthly_value, next_billing_date, req.params.id);
  res.json({ success: true });
});

// ==================== AUDIT LOGS ====================
async function logAudit(company_id, user_id, action, entity, entity_id, old_value, new_value) {
  await getDb().prepare('INSERT INTO audit_logs (company_id, user_id, action, entity, entity_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)').run(company_id, user_id, action, entity, entity_id, old_value ? JSON.stringify(old_value) : null, new_value ? JSON.stringify(new_value) : null);
}

// SPA fallback
app.get('*', async (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function startServer() {
  await initDatabase();
  
  // Auto-seed if empty
  const companyCount = (await getDb().prepare('SELECT COUNT(*) as count FROM companies').get()).count;
  if (companyCount === 0) {
    console.log('Seeding demo data...');
    const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);
    const db = getDb();
    
    // Super Admin company
    await db.prepare("INSERT INTO companies (id, name, trade_name, cnpj, email, phone, plan, status) VALUES (1, 'PCP Pro Industrial', 'PCP Pro', '00.000.000/0001-00', 'admin@pcppro.com', '11999990000', 'industrial', 'active')").run();
    
    // Super Admin user
    await db.prepare("INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES (1, 'Super Administrador', 'superadmin@pcppro.com', ?, 'super_admin', 'active')").run(hashPassword('admin123'));
    
    // Demo company
    await db.prepare("INSERT INTO companies (id, name, trade_name, cnpj, state_registration, email, phone, whatsapp, address, city, state, zip_code, plan, status) VALUES (2, 'Metalúrgica Modelo Ltda', 'Metalúrgica Modelo', '12.345.678/0001-90', '123.456.789.000', 'contato@metalurgicamodelo.com.br', '1133334444', '11999887766', 'Rua Industrial, 500', 'São Paulo', 'SP', '01000-000', 'profissional', 'active')").run();
    
    // Demo users
    const demoUsers = [
      { name: 'Carlos Administrador', email: 'carlos@metalurgica.com', role: 'admin' },
      { name: 'Ana PCP', email: 'ana@metalurgica.com', role: 'pcp' },
      { name: 'João Produção', email: 'joao@metalurgica.com', role: 'production' },
      { name: 'Maria Estoque', email: 'maria@metalurgica.com', role: 'stock' },
    ];
    for (const u of demoUsers) {
      await db.prepare("INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES (2, ?, ?, ?, ?, 'active')").run(u.name, u.email, hashPassword('demo123'), u.role);

    }
    
    // Demo customers
    const customers = [
      { name: 'Usina Alfa Ltda', document: '11.222.333/0001-44', email: 'compras@usinaalfa.com.br', phone: '1122223333', city: 'Campinas', state: 'SP' },
      { name: 'Companhia Beta S.A.', document: '22.333.444/0001-55', email: 'producao@betasa.com.br', phone: '1133334444', city: 'Guarulhos', state: 'SP' },
      { name: 'Indústria Gama Ltda', document: '33.444.555/0001-66', email: 'pcp@gamaind.com.br', phone: '1144445555', city: 'Osasco', state: 'SP' },
    ];
    for (const c of customers) {
      await db.prepare("INSERT INTO customers (company_id, name, document, email, phone, city, state) VALUES (2, ?, ?, ?, ?, ?, ?)").run(c.name, c.document, c.email, c.phone, c.city, c.state);

    }
    
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
    for (const p of products) {
      await db.prepare("INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight) VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(p.code, p.name, p.type, p.unit, p.cost_price, p.sale_price, p.min_stock, p.max_stock, p.lead_time_days, p.weight);

    }
    
    // BOM for Estrutura Metálica
    const estruturaId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('PA-001')).id;
    const tuboId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-001')).id;
    const chapaId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-002')).id;
    const arameId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-003')).id;
    const primerId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-004')).id;
    const parafusoId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-006')).id;
    
    const boms = [
      { product_id: estruturaId, component_id: tuboId, quantity: 12, unit: 'M', loss_percentage: 5, unit_cost: 45 },
      { product_id: estruturaId, component_id: chapaId, quantity: 2, unit: 'PC', loss_percentage: 10, unit_cost: 280 },
      { product_id: estruturaId, component_id: arameId, quantity: 1.5, unit: 'KG', loss_percentage: 15, unit_cost: 25 },
      { product_id: estruturaId, component_id: primerId, quantity: 0.5, unit: 'L', loss_percentage: 10, unit_cost: 35 },
      { product_id: estruturaId, component_id: parafusoId, quantity: 0.5, unit: 'CX', loss_percentage: 5, unit_cost: 85 },
    ];
    for (const b of boms) {
      const totalCost = b.quantity * b.unit_cost * (1 + b.loss_percentage / 100);
      await db.prepare("INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)").run(b.product_id, b.component_id, b.quantity, b.unit, b.loss_percentage, b.unit_cost, totalCost);

    }
    
    // BOM for Suporte Industrial
    const suporteId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('PA-002')).id;
    const suporteBoms = [
      { product_id: suporteId, component_id: tuboId, quantity: 3, unit: 'M', loss_percentage: 5, unit_cost: 45 },
      { product_id: suporteId, component_id: chapaId, quantity: 1, unit: 'PC', loss_percentage: 10, unit_cost: 280 },
      { product_id: suporteId, component_id: arameId, quantity: 0.3, unit: 'KG', loss_percentage: 15, unit_cost: 25 },
    ];
    for (const b of suporteBoms) {
      const totalCost = b.quantity * b.unit_cost * (1 + b.loss_percentage / 100);
      await db.prepare("INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)").run(b.product_id, b.component_id, b.quantity, b.unit, b.loss_percentage, b.unit_cost, totalCost);

    }
    
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
    for (const m of machines) {
      await db.prepare("INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, status) VALUES (2, ?, ?, ?, ?, ?, ?, 'available')").run(m.name, m.code, m.type, m.sector, m.capacity_per_hour, m.hourly_cost);

    }
    
    // Production routes for Estrutura Metálica
    const machineIds = await db.prepare("SELECT id, code FROM machines WHERE company_id = 2").all();
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
    for (const r of routes) {
      await db.prepare("INSERT INTO production_routes (company_id, product_id, sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost) VALUES (2, ?, ?, ?, ?, ?, ?, ?)").run(r.product_id, r.sequence, r.operation_name, r.machine_id, r.standard_time_minutes, r.setup_time_minutes, r.hourly_cost);

    }
    
    // Demo stock movements (initial stock)
    const stockEntries = [
      { product_id: tuboId, type: 'entrada_manual', quantity: 200, unit_cost: 45 },
      { product_id: chapaId, type: 'entrada_manual', quantity: 30, unit_cost: 280 },
      { product_id: arameId, type: 'entrada_manual', quantity: 50, unit_cost: 25 },
      { product_id: primerId, type: 'entrada_manual', quantity: 25, unit_cost: 35 },
      { product_id: parafusoId, type: 'entrada_manual', quantity: 40, unit_cost: 85 },
      { product_id: (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('MP-005')).id, type: 'entrada_manual', quantity: 8, unit_cost: 650 },
    ];
    for (const s of stockEntries) {
      await db.prepare("INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, created_by) VALUES (2, ?, ?, ?, ?, ?, 'Estoque inicial', 2)").run(s.product_id, s.type, s.quantity, s.unit_cost, s.quantity * s.unit_cost);

    }
    
    // Demo sales orders
    const today = new Date();
    const inDays = (d) => { const dt = new Date(today); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };
    
    await db.prepare("INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 1, 'PV-0001', ?, ?, 'alta', 'in_production')").run(inDays(-10), inDays(5));
    const so1 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    await db.prepare("INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 5, 4500, 22500)").run(so1, estruturaId);
    
    await db.prepare("INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 2, 'PV-0002', ?, ?, 'normal', 'open')").run(inDays(-3), inDays(15));
    const so2 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    await db.prepare("INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 20, 680, 13600)").run(so2, suporteId);
    
    await db.prepare("INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES (2, 3, 'PV-0003', ?, ?, 'urgente', 'in_planning')").run(inDays(-5), inDays(-2));
    const so3 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    const tanqueId = (await db.prepare("SELECT id FROM products WHERE code = ? AND company_id = 2").get('PA-003')).id;
    await db.prepare("INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES (2, ?, ?, 2, 15000, 30000)").run(so3, tanqueId);
    
    // Demo production orders
    await db.prepare("INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0001', ?, ?, 1, 5, 2, ?, ?, ?, 'in_production', 'alta', 12500, 5200, 2)").run(estruturaId, so1, inDays(-5), inDays(5), inDays(-4));
    const op1 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    
    await db.prepare("INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, status, priority, planned_cost, created_by) VALUES (2, 'OP-0002', ?, ?, 2, 20, 0, ?, ?, 'planned', 'normal', 7000, 2)").run(suporteId, so2, inDays(2), inDays(12));
    const op2 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    
    await db.prepare("INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0003', ?, ?, 3, 2, 0, ?, ?, ?, 'delayed', 'urgente', 16000, 0, 2)").run(tanqueId, so3, inDays(-15), inDays(-2), inDays(-14));
    
    await db.prepare("INSERT INTO production_orders (company_id, order_number, product_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, real_end_date, status, priority, planned_cost, real_cost, created_by) VALUES (2, 'OP-0004', ?, 3, 3, ?, ?, ?, ?, 'finished', 'normal', 7500, 7800, 2)").run(estruturaId, inDays(-30), inDays(-15), inDays(-30), inDays(-16));
    const op4 = (await db.prepare("SELECT last_insert_rowid() as id").get()).id;
    
    // OP materials for OP-0001
    const opMaterials = [
      { production_order_id: op1, product_id: tuboId, planned_quantity: 60, reserved_quantity: 60, consumed_quantity: 24, unit_cost: 45, status: 'in_progress' },
      { production_order_id: op1, product_id: chapaId, planned_quantity: 10, reserved_quantity: 10, consumed_quantity: 4, unit_cost: 280, status: 'in_progress' },
      { production_order_id: op1, product_id: arameId, planned_quantity: 7.5, reserved_quantity: 7.5, consumed_quantity: 3, unit_cost: 25, status: 'in_progress' },
      { production_order_id: op1, product_id: primerId, planned_quantity: 2.5, reserved_quantity: 2.5, consumed_quantity: 0, unit_cost: 35, status: 'pending' },
    ];
    for (const m of opMaterials) {
      await db.prepare("INSERT INTO production_order_materials (company_id, production_order_id, product_id, planned_quantity, reserved_quantity, consumed_quantity, unit_cost, total_cost, status) VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?)").run(m.production_order_id, m.product_id, m.planned_quantity, m.reserved_quantity, m.consumed_quantity, m.unit_cost, m.planned_quantity * m.unit_cost, m.status);

    }
    
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
    for (const o of opOps) {
      await db.prepare("INSERT INTO production_order_operations (company_id, production_order_id, sequence, operation_name, machine_id, planned_time_minutes, real_time_minutes, status) VALUES (2, ?, ?, ?, ?, ?, ?, ?)").run(o.production_order_id, o.sequence, o.operation_name, o.machine_id, o.planned_time_minutes, o.real_time_minutes, o.status);

    }
    
    // Production logs
    await db.prepare("INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity) VALUES (2, ?, (SELECT id FROM production_order_operations WHERE production_order_id = ? AND sequence = 1), 4, ?, ?, ?, 140, 5, 0)").run(op1, op1, serraId, inDays(-4) + ' 08:00:00', inDays(-4) + ' 10:20:00');
    await db.prepare("INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity) VALUES (2, ?, (SELECT id FROM production_order_operations WHERE production_order_id = ? AND sequence = 2), 4, ?, ?, ?, 95, 5, 0)").run(op1, op1, plasmaId, inDays(-3) + ' 08:00:00', inDays(-3) + ' 09:35:00');
    
    // Subscription
    await db.prepare("INSERT INTO subscriptions (company_id, plan, status, monthly_value, start_date, next_billing_date, payment_provider, payment_status) VALUES (2, 'profissional', 'active', 297, ?, ?, 'stripe', 'paid')").run(inDays(-30), inDays(0));
    
    saveDatabase();
    console.log('Demo data seeded successfully!');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PCP Pro Industrial server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
