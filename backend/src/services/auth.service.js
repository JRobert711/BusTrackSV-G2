// Mock users database
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
  { id: 2, username: 'operador', password: 'operador123', name: 'Operador', role: 'operator' }
];

function validateCredentials(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return null;
  }
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

module.exports = { validateCredentials };
