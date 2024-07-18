const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clientRoutes = require('./routes/clientRoutes');
const authenticateToken = require('./middleware/auth');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de CORS
app.use(cors({
  origin: '*', // Permitir todas las solicitudes desde cualquier origen para pruebas
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir todos los métodos HTTP
  allowedHeaders: ['Content-Type', 'Authorization'] // Permitir los headers necesarios
}));

app.use(express.json());
app.use(express.static('public'));
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/clients', clientRoutes);

io.on('connection', (socket) => {
  console.log('New client connected');
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

module.exports = io;
