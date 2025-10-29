const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { getBuses, toggleFavorite } = require('../controllers/buses.controller');

const router = express.Router();

router.get('/', authenticateToken, getBuses);
router.patch('/:id/favorite', authenticateToken, toggleFavorite);

module.exports = router;
