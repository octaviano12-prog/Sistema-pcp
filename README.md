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

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts para gráficos
- Lucide React para ícones

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Instalar dependências:**
```bash
npm install
```

2. **Build do frontend:**
```bash
npm run build
```

3. **Iniciar servidor:**
```bash
npm start
```

O sistema estará disponível em: `http://localhost:3000`

### Modo Desenvolvimento

Para desenvolvimento com hot reload:

```bash
npm run dev
```

Isso iniciará:
- Backend em `http://localhost:3000`
- Frontend em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
sistema-pcp/
├── server/              # Backend Node.js + Express
│   ├── index.js        # Servidor e rotas API
│   ├── db.js           # Configuração do banco SQLite (sql.js)
│   └── middleware/     # Middleware de autenticação
├── client/             # Frontend React
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── pages/      # Páginas do sistema
│   │   ├── contexts/   # Contextos React (Auth)
│   │   └── lib/        # Utilitários (API client)
│   └── dist/           # Build de produção
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
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

## 📝 Licença

Sistema proprietário - PCP Pro Industrial

## 💼 Contato

Para demonstrações e vendas:
- WhatsApp: (11) 99999-0000
- Email: contato@pcppro.com.br

---

**PCP Pro Industrial** - Controle sua produção do pedido à entrega.
