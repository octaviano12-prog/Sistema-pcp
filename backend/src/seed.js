import bcrypt from 'bcryptjs';
import { initDatabase, getDb } from './db.js';

await initDatabase();
const db = getDb();
const hash = (password) => bcrypt.hashSync(password, 10);

await db.prepare(`
  INSERT IGNORE INTO companies (id, name, trade_name, cnpj, email, phone, plan, status)
  VALUES
    (1, 'PCP Pro Industrial', 'PCP Pro', '00.000.000/0001-00', 'admin@pcppro.com', '11999990000', 'industrial', 'active'),
    (2, 'Metalurgica Modelo Ltda', 'Metalurgica Modelo', '12.345.678/0001-90', 'contato@metalurgicamodelo.com.br', '1133334444', 'profissional', 'active')
`).run();

const users = [
  { company_id: 1, name: 'Super Administrador', email: 'superadmin@pcppro.com', password: 'admin123', role: 'super_admin' },
  { company_id: 2, name: 'Carlos Administrador', email: 'carlos@metalurgica.com', password: 'demo123', role: 'admin' },
  { company_id: 2, name: 'Ana PCP', email: 'ana@metalurgica.com', password: 'demo123', role: 'pcp' },
  { company_id: 2, name: 'Joao Producao', email: 'joao@metalurgica.com', password: 'demo123', role: 'production' },
  { company_id: 2, name: 'Maria Estoque', email: 'maria@metalurgica.com', password: 'demo123', role: 'stock' },
];

for (const user of users) {
  await db.prepare(`
    INSERT IGNORE INTO users (company_id, name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(user.company_id, user.name, user.email, hash(user.password), user.role);
}

console.log('Seed MySQL concluido.');
