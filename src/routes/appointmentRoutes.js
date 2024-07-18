const express = require('express');
const { createAppointment } = require('../controllers/appointmentController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, createAppointment);

module.exports = router;
