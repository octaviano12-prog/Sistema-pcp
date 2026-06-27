-- =============================================
-- PCP Pro Industrial - Dados de Demonstração
-- MySQL 8.0+
-- =============================================

USE sistema_pcp;

-- =============================================
-- EMPRESA PRINCIPAL (Super Admin)
-- =============================================
INSERT INTO companies (id, name, trade_name, cnpj, email, phone, plan, status) 
VALUES (1, 'PCP Pro Industrial', 'PCP Pro', '00.000.000/0001-00', 'admin@pcppro.com', '11999990000', 'industrial', 'active');

-- Usuário Super Admin
-- Senha: admin123 (bcrypt hash)
INSERT INTO users (company_id, name, email, password_hash, role, status) 
VALUES (1, 'Super Administrador', 'superadmin@pcppro.com', '$2a$10$YourHashHere', 'super_admin', 'active');

-- =============================================
-- EMPRESA DE DEMONSTRAÇÃO
-- =============================================
INSERT INTO companies (id, name, trade_name, cnpj, state_registration, email, phone, whatsapp, address, city, state, zip_code, plan, status) 
VALUES (2, 'Metalúrgica Modelo Ltda', 'Metalúrgica Modelo', '12.345.678/0001-90', '123.456.789.000', 'contato@metalurgicamodelo.com.br', '1133334444', '11999887766', 'Rua Industrial, 500', 'São Paulo', 'SP', '01000-000', 'profissional', 'active');

-- Usuários da empresa demo
-- Senha para todos: demo123 (bcrypt hash)
INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES
(2, 'Carlos Administrador', 'carlos@metalurgica.com', '$2a$10$YourHashHere', 'admin', 'active'),
(2, 'Ana PCP', 'ana@metalurgica.com', '$2a$10$YourHashHere', 'pcp', 'active'),
(2, 'João Produção', 'joao@metalurgica.com', '$2a$10$YourHashHere', 'production', 'active'),
(2, 'Maria Estoque', 'maria@metalurgica.com', '$2a$10$YourHashHere', 'stock', 'active');

-- =============================================
-- CLIENTES
-- =============================================
INSERT INTO customers (company_id, name, document, email, phone, city, state) VALUES
(2, 'Usina Alfa Ltda', '11.222.333/0001-44', 'compras@usinaalfa.com.br', '1122223333', 'Campinas', 'SP'),
(2, 'Companhia Beta S.A.', '22.333.444/0001-55', 'producao@betasa.com.br', '1133334444', 'Guarulhos', 'SP'),
(2, 'Indústria Gama Ltda', '33.444.555/0001-66', 'pcp@gamaind.com.br', '1144445555', 'Osasco', 'SP');

-- =============================================
-- PRODUTOS
-- =============================================
-- Produtos Acabados
INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight) VALUES
(2, 'PA-001', 'Estrutura Metálica Modelo A', 'finished', 'UN', 2500.00, 4500.00, 2, 20, 15, 150.00),
(2, 'PA-002', 'Suporte Industrial', 'finished', 'UN', 350.00, 680.00, 5, 50, 7, 25.00),
(2, 'PA-003', 'Tanque Inox 500L', 'finished', 'UN', 8000.00, 15000.00, 1, 5, 30, 200.00);

-- Matérias-primas
INSERT INTO products (company_id, code, name, type, unit, cost_price, sale_price, min_stock, max_stock, lead_time_days, weight) VALUES
(2, 'MP-001', 'Tubo 50x50x3 mm', 'raw_material', 'M', 45.00, 0, 50, 500, 5, 4.50),
(2, 'MP-002', 'Chapa A36 3/16"', 'raw_material', 'PC', 280.00, 0, 10, 100, 7, 45.00),
(2, 'MP-003', 'Arame de Solda MIG', 'raw_material', 'KG', 25.00, 0, 20, 200, 3, 1.00),
(2, 'MP-004', 'Primer Industrial', 'input', 'L', 35.00, 0, 10, 100, 3, 1.20),
(2, 'MP-005', 'Chapa Inox 304 1.5mm', 'raw_material', 'PC', 650.00, 0, 5, 30, 10, 35.00),
(2, 'MP-006', 'Parafuso Sextavado 3/8"', 'input', 'CX', 85.00, 0, 10, 100, 2, 5.00);

-- =============================================
-- FICHAS TÉCNICAS (BOM)
-- =============================================
-- Estrutura Metálica Modelo A
INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES
(2, 1, 4, 12.0000, 'M', 5.00, 45.00, 567.00),    -- Tubo 50x50x3 mm
(2, 1, 5, 2.0000, 'PC', 10.00, 280.00, 616.00),   -- Chapa A36 3/16"
(2, 1, 6, 1.5000, 'KG', 15.00, 25.00, 43.13),     -- Arame de Solda MIG
(2, 1, 7, 0.5000, 'L', 10.00, 35.00, 19.25),      -- Primer Industrial
(2, 1, 9, 0.5000, 'CX', 5.00, 85.00, 44.63);      -- Parafuso Sextavado

-- Suporte Industrial
INSERT INTO product_boms (company_id, product_id, component_id, quantity, unit, loss_percentage, unit_cost, total_cost) VALUES
(2, 2, 4, 3.0000, 'M', 5.00, 45.00, 141.75),      -- Tubo 50x50x3 mm
(2, 2, 5, 1.0000, 'PC', 10.00, 280.00, 308.00),   -- Chapa A36 3/16"
(2, 2, 6, 0.3000, 'KG', 15.00, 25.00, 8.63);      -- Arame de Solda MIG

-- =============================================
-- MÁQUINAS
-- =============================================
INSERT INTO machines (company_id, name, code, type, sector, capacity_per_hour, hourly_cost, status) VALUES
(2, 'Serra Fita', 'maq-001', 'Corte', 'Corte', 20.00, 45.00, 'available'),
(2, 'Plasma CNC', 'maq-002', 'Corte', 'Corte', 15.00, 85.00, 'available'),
(2, 'Dobradeira', 'maq-003', 'Conformação', 'Conformação', 25.00, 55.00, 'available'),
(2, 'MIG Solda 01', 'maq-004', 'Soldagem', 'Soldagem', 10.00, 65.00, 'available'),
(2, 'MIG Solda 02', 'maq-005', 'Soldagem', 'Soldagem', 10.00, 65.00, 'available'),
(2, 'Cabine de Pintura', 'maq-006', 'Acabamento', 'Pintura', 8.00, 75.00, 'available'),
(2, 'Bancada de Montagem', 'maq-007', 'Montagem', 'Montagem', 12.00, 40.00, 'available');

-- =============================================
-- ROTEIROS DE PRODUÇÃO
-- =============================================
-- Estrutura Metálica Modelo A
INSERT INTO production_routes (company_id, product_id, sequence, operation_name, machine_id, standard_time_minutes, setup_time_minutes, hourly_cost) VALUES
(2, 1, 1, 'Corte', 1, 30.00, 15.00, 45.00),
(2, 1, 2, 'Furação', 2, 20.00, 10.00, 85.00),
(2, 1, 3, 'Dobra', 3, 25.00, 10.00, 55.00),
(2, 1, 4, 'Soldagem', 4, 60.00, 15.00, 65.00),
(2, 1, 5, 'Acabamento', 4, 30.00, 0.00, 65.00),
(2, 1, 6, 'Pintura', 6, 45.00, 15.00, 75.00),
(2, 1, 7, 'Montagem Final', 7, 40.00, 10.00, 40.00),
(2, 1, 8, 'Inspeção', 7, 15.00, 0.00, 40.00);

-- =============================================
-- ESTOQUE INICIAL (Movimentações)
-- =============================================
INSERT INTO stock_movements (company_id, product_id, type, quantity, unit_cost, total_cost, reason, created_by) VALUES
(2, 4, 'entrada_manual', 200.0000, 45.00, 9000.00, 'Estoque inicial', 2),
(2, 5, 'entrada_manual', 30.0000, 280.00, 8400.00, 'Estoque inicial', 2),
(2, 6, 'entrada_manual', 50.0000, 25.00, 1250.00, 'Estoque inicial', 2),
(2, 7, 'entrada_manual', 25.0000, 35.00, 875.00, 'Estoque inicial', 2),
(2, 9, 'entrada_manual', 40.0000, 85.00, 3400.00, 'Estoque inicial', 2),
(2, 8, 'entrada_manual', 8.0000, 650.00, 5200.00, 'Estoque inicial', 2);

-- =============================================
-- PEDIDOS DE VENDA
-- =============================================
INSERT INTO sales_orders (company_id, customer_id, order_number, order_date, delivery_date, priority, status) VALUES
(2, 1, 'PV-0001', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'alta', 'in_production'),
(2, 2, 'PV-0002', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'normal', 'open'),
(2, 3, 'PV-0003', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'urgente', 'in_planning');

-- Itens dos pedidos
INSERT INTO sales_order_items (company_id, sales_order_id, product_id, quantity, unit_price, total_price) VALUES
(2, 1, 1, 5.0000, 4500.00, 22500.00),
(2, 2, 2, 20.0000, 680.00, 13600.00),
(2, 3, 3, 2.0000, 15000.00, 30000.00);

-- =============================================
-- ORDENS DE PRODUÇÃO
-- =============================================
INSERT INTO production_orders (company_id, order_number, product_id, sales_order_id, customer_id, planned_quantity, produced_quantity, planned_start_date, planned_end_date, real_start_date, status, priority, planned_cost, real_cost, created_by) VALUES
(2, 'OP-0001', 1, 1, 1, 5.0000, 2.0000, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'in_production', 'alta', 12500.00, 5200.00, 2),
(2, 'OP-0002', 2, 2, 2, 20.0000, 0.0000, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), NULL, 'planned', 'normal', 7000.00, 0.00, 2),
(2, 'OP-0003', 3, 3, 3, 2.0000, 0.0000, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'delayed', 'urgente', 16000.00, 0.00, 2),
(2, 'OP-0004', 1, NULL, NULL, 3.0000, 3.0000, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'finished', 'normal', 7500.00, 7800.00, 2);

-- Materiais da OP-0001
INSERT INTO production_order_materials (company_id, production_order_id, product_id, planned_quantity, reserved_quantity, consumed_quantity, unit_cost, total_cost, status) VALUES
(2, 1, 4, 60.0000, 60.0000, 24.0000, 45.00, 2700.00, 'in_progress'),
(2, 1, 5, 10.0000, 10.0000, 4.0000, 280.00, 2800.00, 'in_progress'),
(2, 1, 6, 7.5000, 7.5000, 3.0000, 25.00, 187.50, 'in_progress'),
(2, 1, 7, 2.5000, 2.5000, 0.0000, 35.00, 87.50, 'pending');

-- Operações da OP-0001
INSERT INTO production_order_operations (company_id, production_order_id, sequence, operation_name, machine_id, planned_time_minutes, real_time_minutes, status) VALUES
(2, 1, 1, 'Corte', 1, 150.00, 140.00, 'finished'),
(2, 1, 2, 'Furação', 2, 100.00, 95.00, 'finished'),
(2, 1, 3, 'Dobra', 3, 125.00, 130.00, 'in_progress'),
(2, 1, 4, 'Soldagem', 4, 300.00, 0.00, 'pending'),
(2, 1, 5, 'Acabamento', 4, 150.00, 0.00, 'pending'),
(2, 1, 6, 'Pintura', 6, 225.00, 0.00, 'pending'),
(2, 1, 7, 'Montagem Final', 7, 200.00, 0.00, 'pending'),
(2, 1, 8, 'Inspeção', 7, 75.00, 0.00, 'pending');

-- Apontamentos de produção
INSERT INTO production_logs (company_id, production_order_id, operation_id, user_id, machine_id, start_time, end_time, total_time_minutes, produced_quantity, rejected_quantity) VALUES
(2, 1, 1, 4, 1, CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 10:20:00'), 140.00, 5.0000, 0.0000),
(2, 1, 2, 4, 2, CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 09:35:00'), 95.00, 5.0000, 0.0000);

-- =============================================
-- ASSINATURA
-- =============================================
INSERT INTO subscriptions (company_id, plan, status, monthly_value, start_date, next_billing_date, payment_provider, payment_status) 
VALUES (2, 'profissional', 'active', 297.00, DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 'stripe', 'paid');

-- =============================================
-- FIM DO SEED
-- =============================================
