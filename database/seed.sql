INSERT INTO companies (id, name, trade_name, email, plan, status)
VALUES
  (1, 'PCP Pro', 'PCP Pro', 'contato@pcppro.com', 'enterprise', 'active'),
  (2, 'Metalurgica Modelo LTDA', 'Metalurgica Modelo', 'contato@metalurgica.com', 'profissional', 'active');

-- Senhas usadas na demo do app atual:
-- superadmin@pcppro.com / admin123
-- carlos@metalurgica.com / demo123
-- O backend tambem pode popular dados completos com: npm run seed
INSERT INTO users (company_id, name, email, password_hash, role, status)
VALUES
  (1, 'Super Administrador', 'superadmin@pcppro.com', '$2a$10$example.hash.replace.before.production', 'super_admin', 'active'),
  (2, 'Carlos Silva', 'carlos@metalurgica.com', '$2a$10$example.hash.replace.before.production', 'admin', 'active');

INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, status)
VALUES
  (2, 'Serra Fita', 'MAQ-001', 'Corte', 'Producao', 12, 85, 'available'),
  (2, 'Dobra CNC', 'MAQ-002', 'Dobra', 'Producao', 8, 120, 'available');

INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock)
VALUES
  (2, 'PA-001', 'Estrutura Metalica', 'finished', 'UN', 2500, 4500, 2),
  (2, 'MP-001', 'Tubo de Aco', 'raw', 'M', 45, 0, 50);
