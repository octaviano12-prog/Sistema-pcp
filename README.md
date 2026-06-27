# Sistema PCP

Sistema de gestao PCP para controle de producao, produtos, clientes, estoque, ordens de venda, ordens de producao, apontamentos, maquinas, roteiros, usuarios, assinaturas, dashboard e relatorios.

## Tecnologias

- React 18
- Vite
- Node.js
- Express
- JWT
- Tailwind CSS
- sql.js para banco local em arquivo
- SQL de referencia em `database/`

## Estrutura

```txt
sistema-pcp/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env.example
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── data/
│   ├── package.json
│   └── .env.example
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Como rodar localmente

### 1. Clonar o repositorio

```bash
git clone https://github.com/octaviano12-prog/Sistema-pcp.git
cd Sistema-pcp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar ambiente

Copie os exemplos se quiser customizar variaveis:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Variaveis principais do backend:

```env
PORT=3000
JWT_SECRET=troque_esta_chave_em_producao
FRONTEND_URL=http://localhost:5173
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Backend: `http://localhost:3000`  
Frontend: `http://localhost:5173`

### 5. Gerar build de producao

```bash
npm run build
npm start
```

O backend Express serve o frontend compilado em `frontend/dist`.

## Deploy na Hostinger

Use a opcao Node.js/Express com:

```txt
Framework: Express
Branch: main
Node: 22.x
Diretorio raiz: ./
Install command: npm install
Build command: npm run build
Start command: npm start
```

Adicione variaveis de ambiente na Hostinger:

```env
NODE_ENV=production
JWT_SECRET=coloque_uma_chave_grande_e_secreta
```

## Banco de dados

O app atual usa `sql.js`, que grava o banco em `backend/data/pcp_pro.db`. Esse arquivo nao deve ser enviado ao GitHub.

A pasta `database/` contem SQL de referencia:

- `database/schema.sql`: estrutura das tabelas
- `database/seed.sql`: dados iniciais basicos
- `database/migrations/`: futuras migracoes

Para a demo completa, o backend popula dados automaticamente quando o banco ainda esta vazio.

## Usuarios de demonstracao

```txt
Super Admin: superadmin@pcppro.com / admin123
Admin: carlos@metalurgica.com / demo123
PCP: ana@metalurgica.com / demo123
Producao: joao@metalurgica.com / demo123
Estoque: maria@metalurgica.com / demo123
```

## Scripts

Raiz:

```bash
npm run dev
npm run build
npm start
npm run seed
```

Frontend:

```bash
npm --workspace frontend run dev
npm --workspace frontend run build
```

Backend:

```bash
npm --workspace backend run dev
npm --workspace backend start
```

## Observacoes de seguranca

- Nao subir `.env`.
- Trocar `JWT_SECRET` em producao.
- Nao versionar `backend/data/*.db`.
- Nao versionar `frontend/dist`.
- As senhas acima sao apenas para ambiente de demonstracao.
