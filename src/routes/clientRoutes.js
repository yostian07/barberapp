const express = require('express');
const { registerClient, loginClient, getClientData } = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerClient);
router.post('/login', loginClient);
router.get('/me', authenticateToken, getClientData); // Nuevo endpoint para obtener datos del cliente

module.exports = router;
