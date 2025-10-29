function root(req, res) {
  res.json({
    message: 'BusTrack SV Backend Server',
    status: 'running',
    endpoints: ['/api/v1/auth/login', '/api/v1/buses', '/health']
  });
}

function health(req, res) {
  res.json({ message: 'Backend is working!', status: 'success', timestamp: new Date().toISOString() });
}

module.exports = { root, health };
