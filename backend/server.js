const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = 'bustrack_secret_key_2024';

// Mock users database
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
    },
    {
        id: 2,
        username: 'operador',
        password: 'operador123',
        name: 'Operador',
        role: 'operator'
    }
];

// Mock buses data
const buses = [
    {
        id: '001',
        licensePlate: 'BUS-001',
        unitName: 'Unidad 001',
        status: 'parked',
        route: '101',
        driver: 'Carlos Rodríguez',
        movingTime: 332,
        parkedTime: 110,
        isFavorite: false
    },
    {
        id: '002',
        licensePlate: 'BUS-002',
        unitName: 'Unidad 002',
        status: 'moving',
        route: '102',
        driver: 'María González',
        movingTime: 245,
        parkedTime: 45,
        isFavorite: true
    },
    {
        id: '003',
        licensePlate: 'BUS-003',
        unitName: 'Unidad 003',
        status: 'parked',
        route: '201',
        driver: 'José López',
        movingTime: 180,
        parkedTime: 90,
        isFavorite: false
    },
    {
        id: '004',
        licensePlate: 'BUS-004',
        unitName: 'Unidad 004',
        status: 'moving',
        route: '205',
        driver: 'Ana Martínez',
        movingTime: 420,
        parkedTime: 30,
        isFavorite: true
    },
    {
        id: '005',
        licensePlate: 'BUS-005',
        unitName: 'Unidad 005',
        status: 'parked',
        route: '301',
        driver: 'Luis Hernández',
        movingTime: 200,
        parkedTime: 120,
        isFavorite: false
    },
    {
        id: '006',
        licensePlate: 'BUS-006',
        unitName: 'Unidad 006',
        status: 'moving',
        route: '305',
        driver: 'Carmen Jiménez',
        movingTime: 380,
        parkedTime: 60,
        isFavorite: true
    },
    {
        id: '007',
        licensePlate: 'BUS-007',
        unitName: 'Unidad 007',
        status: 'parked',
        route: '401',
        driver: 'Roberto Silva',
        movingTime: 150,
        parkedTime: 180,
        isFavorite: false
    },
    {
        id: '008',
        licensePlate: 'BUS-008',
        unitName: 'Unidad 008',
        status: 'moving',
        route: '501',
        driver: 'Patricia Vargas',
        movingTime: 290,
        parkedTime: 75,
        isFavorite: true
    },
    {
        id: '009',
        licensePlate: 'BUS-009',
        unitName: 'Unidad 009',
        status: 'parked',
        route: '101',
        driver: 'Miguel Castillo',
        movingTime: 220,
        parkedTime: 95,
        isFavorite: false
    },
    {
        id: '010',
        licensePlate: 'BUS-010',
        unitName: 'Unidad 010',
        status: 'parked',
        route: '102',
        driver: 'Laura Morales',
        movingTime: 160,
        parkedTime: 140,
        isFavorite: false
    },
    {
        id: '011',
        licensePlate: 'BUS-011',
        unitName: 'Unidad 011',
        status: 'parked',
        route: '201',
        driver: 'Fernando Vega',
        movingTime: 190,
        parkedTime: 110,
        isFavorite: false
    },
    {
        id: '012',
        licensePlate: 'BUS-012',
        unitName: 'Unidad 012',
        status: 'parked',
        route: '205',
        driver: 'Sofía Ramírez',
        movingTime: 170,
        parkedTime: 130,
        isFavorite: false
    }
];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'BusTrack SV Backend Server',
        status: 'running',
        endpoints: ['/api/auth/login', '/api/buses', '/api/test']
    });
});

// Login route
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }
    });
});

// Get buses data
app.get('/api/buses', authenticateToken, (req, res) => {
    res.json(buses);
});

// Update bus favorite status
app.patch('/api/buses/:id/favorite', authenticateToken, (req, res) => {
    const busId = req.params.id;
    const { isFavorite } = req.body;

    const busIndex = buses.findIndex(bus => bus.id === busId);
    if (busIndex === -1) {
        return res.status(404).json({ message: 'Bus no encontrado' });
    }

    buses[busIndex].isFavorite = isFavorite;
    res.json(buses[busIndex]);
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/auth/login');
    console.log('- GET /api/buses (requires authentication)');
    console.log('- PATCH /api/buses/:id/favorite (requires authentication)');
});

