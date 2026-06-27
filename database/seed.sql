INSERT INTO companies (id, name, trade_name, cnpj, email, phone, plan, status)
VALUES
  (1, 'PCP Pro Industrial', 'PCP Pro', '00.000.000/0001-00', 'admin@pcppro.com', '11999990000', 'industrial', 'active'),
  (2, 'Metalurgica Modelo Ltda', 'Metalurgica Modelo', '12.345.678/0001-90', 'contato@metalurgicamodelo.com.br', '1133334444', 'profissional', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (company_id, name, email, password_hash, role, status)
VALUES
  (1, 'Super Administrador', 'superadmin@pcppro.com', '$2a$10$0tjMLwJW1eS6JHhn4ciJTejVBI5rl43QI8d/2notpXEWXfAVsby4O', 'super_admin', 'active'),
  (2, 'Carlos Administrador', 'carlos@metalurgica.com', '$2a$10$Y.lobRlQNID445ONRhYoT.DrYNDhDNfBSbThlF6gZZb0F7Swt8C7a', 'admin', 'active'),
  (2, 'Ana PCP', 'ana@metalurgica.com', '$2a$10$Y.lobRlQNID445ONRhYoT.DrYNDhDNfBSbThlF6gZZb0F7Swt8C7a', 'pcp', 'active'),
  (2, 'Joao Producao', 'joao@metalurgica.com', '$2a$10$Y.lobRlQNID445ONRhYoT.DrYNDhDNfBSbThlF6gZZb0F7Swt8C7a', 'production', 'active'),
  (2, 'Maria Estoque', 'maria@metalurgica.com', '$2a$10$Y.lobRlQNID445ONRhYoT.DrYNDhDNfBSbThlF6gZZb0F7Swt8C7a', 'stock', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, status)
VALUES
  (2, 'Serra Fita', 'MAQ-001', 'Corte', 'Producao', 12, 85, 'available'),
  (2, 'Dobra CNC', 'MAQ-002', 'Dobra', 'Producao', 8, 120, 'available');

INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock)
VALUES
  (2, 'PA-001', 'Estrutura Metalica', 'finished', 'UN', 2500, 4500, 2),
  (2, 'MP-001', 'Tubo de Aco', 'raw_material', 'M', 45, 0, 50);
