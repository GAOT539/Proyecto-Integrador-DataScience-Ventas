const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde Angular
app.use(express.json());

// Log para confirmar que el script inicia
console.log('Iniciando configuración del servicio Backend...');

// Rutas
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API Ventas Digitales funcionando');
    console.log('Ruta raíz accedida');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend corriendo en el puerto ${PORT}`);
});