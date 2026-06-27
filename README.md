# PCP Pro Industrial

Sistema SaaS completo de Planejamento e Controle da Produção (PCP) para empresas industriais.

## 🚀 Funcionalidades

### Site Comercial
- Landing page profissional e responsiva
- Apresentação de recursos e benefícios
- Planos e preços
- Formulário de contato

### Painel Administrativo
- **Dashboard** com KPIs e gráficos em tempo real
- **Gestão de Produtos** com ficha técnica completa
- **Controle de Estoque** com movimentações e alertas
- **Pedidos de Venda** com planejamento automático
- **Ordens de Produção** com apontamento de chão de fábrica
- **Máquinas e Centros de Trabalho**
- **Roteiros de Produção**
- **Relatórios** de produção, custos e estoque
- **Multiempresa** com controle de acesso por perfil

## 🔐 Contas de Demonstração

### Super Admin (Administrador do Sistema)
- **Email:** superadmin@pcppro.com
- **Senha:** admin123

### Admin da Empresa (Metalúrgica Modelo)
- **Email:** carlos@metalurgica.com
- **Senha:** demo123

### PCP
- **Email:** ana@metalurgica.com
- **Senha:** demo123

### Produção
- **Email:** joao@metalurgica.com
- **Senha:** demo123

### Estoque
- **Email:** maria@metalurgica.com
- **Senha:** demo123

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- SQLite (sql.js - WASM puro, sem dependências nativas)
- JWT para autenticação
- Bcrypt para senhas
- CORS habilitado

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts para gráficos
- Lucide React para ícones

### Banco de Dados
- SQLite (desenvolvimento) - sql.js
- MySQL 8.0+ (produção) - schema incluído

## 📦 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- MySQL 8.0+ (opcional, para produção)

### 1. Clonar o repositório

```bash
git clone https://github.com/octaviano12-prog/Sistema-pcp.git
cd Sistema-pcp
```

### 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente do Backend

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário:
```env
PORT=3001
JWT_SECRET=sua_chave_secreta_aqui
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Instalar dependências do Frontend

```bash
cd ../frontend
npm install
```

### 5. Configurar variáveis de ambiente do Frontend

```bash
cp .env.example .env
```

O arquivo `.env` deve conter:
```env
VITE_API_URL=http://localhost:3001
```

### 6. Iniciar o Backend

```bash
cd ../backend
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

### 7. Iniciar o Frontend (em outro terminal)

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 8. (Opcional) Configurar MySQL para Produção

Se quiser usar MySQL em vez de SQLite:

```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE sistema_pcp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importar schema
mysql -u root -p sistema_pcp < database/schema.sql

# Importar dados de demonstração
mysql -u root -p sistema_pcp < database/seed.sql
```

Depois atualize o `.env` do backend para usar MySQL (requer configuração adicional).

## 📁 Estrutura do Projeto

```
sistema-pcp/
├── frontend/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas do sistema
│   │   ├── contexts/     # Contextos React (Auth)
│   │   └── lib/          # Utilitários (API client)
│   ├── public/           # Arquivos estáticos
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/               # Backend Node.js + Express
│   ├── server.js         # Servidor principal
│   ├── db.js             # Configuração do banco SQLite
│   ├── middleware/       # Middleware de autenticação
│   ├── uploads/          # Arquivos enviados
│   ├── package.json
│   └── .env.example
│
├── database/              # Scripts SQL
│   ├── schema.sql        # Estrutura do banco MySQL
│   ├── seed.sql          # Dados de demonstração
│   └── migrations/       # Migrações futuras
│
├── README.md
├── .gitignore
└── package.json          # (não existe - cada parte tem o seu)
```

## 🔌 API REST

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário autenticado

### Principais Endpoints
- `/api/companies` - Empresas
- `/api/users` - Usuários
- `/api/customers` - Clientes
- `/api/products` - Produtos
- `/api/boms` - Fichas técnicas
- `/api/routes` - Roteiros de produção
- `/api/machines` - Máquinas
- `/api/stock` - Estoque
- `/api/sales-orders` - Pedidos de venda
- `/api/production-orders` - Ordens de produção
- `/api/production-logs` - Apontamentos
- `/api/dashboard/*` - Dashboard
- `/api/reports/*` - Relatórios

## 🎯 Módulos do Sistema

1. **Dashboard** - KPIs e visão geral
2. **Produtos** - Cadastro completo com tipos
3. **Clientes** - Gestão de clientes
4. **Estoque** - Controle com movimentações
5. **Pedidos** - Pedidos de venda
6. **Planejamento PCP** - Planejamento de produção
7. **Ordens de Produção** - OPs com fluxos de trabalho
8. **Apontamento** - Registro de produção
9. **Máquinas** - Centros de trabalho
10. **Ficha Técnica** - Composição de produtos
11. **Roteiros** - Operações de fabricação
12. **Relatórios** - Análises e exportações
13. **Usuários** - Gestão de acessos
14. **Configurações** - Dados da empresa
15. **Assinaturas** - Planos e billing

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Controle de acesso por perfil
- Isolamento multiempresa (company_id)
- Validação de dados
- CORS configurado

## 📊 Perfis de Usuário

- **Super Admin** - Acesso total ao sistema
- **Admin** - Administrador da empresa
- **PCP** - Planejamento e controle
- **Produção** - Apontamento de produção
- **Estoque** - Movimentações de estoque
- **Compras** - Necessidades de compra
- **Financeiro** - Custos e financeiro
- **Visualizador** - Apenas consulta

## 🎨 Design

- Interface moderna e responsiva
- Tema profissional industrial
- Cores: Azul escuro, branco, cinza, verde/laranja
- Componentes reutilizáveis
- Mobile-first

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev      # Inicia em modo desenvolvimento (com watch)
npm start        # Inicia em modo produção
```

### Frontend
```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
```

## 🌐 Deploy

### Produção

1. Build do frontend:
```bash
cd frontend
npm run build
```

2. O backend serve automaticamente os arquivos do `frontend/dist`

3. Inicie o backend:
```bash
cd backend
npm start
```

4. O sistema estará disponível em `http://localhost:3001`

### Variáveis de Ambiente para Produção

Backend (`.env`):
```env
PORT=3001
JWT_SECRET=sua_chave_secreta_muito_forte
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

## 💾 Banco de Dados

### Desenvolvimento (SQLite)
- O banco é criado automaticamente em `backend/pcp_pro.db`
- Dados de demonstração são inseridos automaticamente no primeiro inicio

### Produção (MySQL)
- Use os scripts em `database/`
- `schema.sql` - Cria todas as tabelas
- `seed.sql` - Insere dados de demonstração

## 📦 Dependências Principais

### Backend
- express - Framework web
- sql.js - SQLite em JavaScript (WASM)
- bcryptjs - Hash de senhas
- jsonwebtoken - Autenticação JWT
- cors - Cross-Origin Resource Sharing
- multer - Upload de arquivos
- dotenv - Variáveis de ambiente

### Frontend
- react - Biblioteca UI
- react-router-dom - Roteamento
- recharts - Gráficos
- lucide-react - Ícones
- tailwindcss - Framework CSS
- vite - Build tool

## 🐛 Troubleshooting

### Erro ao iniciar o backend
- Verifique se a porta 3001 está disponível
- Delete `backend/pcp_pro.db` e reinicie para recriar o banco

### Erro ao iniciar o frontend
- Verifique se a porta 5173 está disponível
- Delete `node_modules` e execute `npm install` novamente

### API não responde
- Verifique se o backend está rodando na porta 3001
- Verifique o `VITE_API_URL` no `.env` do frontend

## 📝 Licença

Sistema proprietário - PCP Pro Industrial

## 💼 Contato

Para demonstrações e vendas:
- WhatsApp: (11) 99999-0000
- Email: contato@pcppro.com.br

## 🌟 Demonstração Online

O sistema está disponível para demonstração em:
**https://gmnbbbul.mule.page/**

---

**PCP Pro Industrial** - Controle sua produção do pedido à entrega.
