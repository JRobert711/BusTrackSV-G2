const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: 'BusTrack SV Backend Server',
        status: 'running',
        endpoints: ['/api']
    });
});

// Ruta API principal
app.get('/api', (req, res) => {
    res.json({ 
        message: 'BusTrack SV API',
        users: ['userOne', 'userTwo', 'userThree'],
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        status: 'success'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

