const { validateCredentials } = require('../services/auth.service');
const { sign } = require('../config/jwt');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  const user = validateCredentials(username, password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = sign({ id: user.id, username: user.username, role: user.role });
  return res.json({ token, user });
}

module.exports = { login };
