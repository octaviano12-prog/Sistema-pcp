import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pcp_pro_secret_key_2024';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token nao fornecido' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissao para esta acao' });
    }
    next();
  };
}

export function requireCompany(req, res, next) {
  if (req.user.role === 'super_admin') return next();
  if (!req.user.company_id) return res.status(403).json({ error: 'Empresa nao vinculada' });
  next();
}

export { JWT_SECRET };
