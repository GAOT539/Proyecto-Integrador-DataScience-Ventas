const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// --- Rutas de Dashboard y Ventas ---
//router.get('/kpis', dataController.getKPIs);
router.get('/ventas', dataController.getVentas);
router.get('/grafico-categorias', dataController.getVentasPorCategoria);

// --- Rutas de Clientes ---
router.get('/clientes', dataController.getClientes);
router.get('/clientes/buscar', dataController.buscarCliente);

// --- Rutas de Filtros / Dimensiones ---
router.get('/filtros/tiempo', dataController.getDimTiempo);
router.get('/filtros/sucursales', dataController.getDimSucursal);
router.get('/filtros/productos', dataController.getDimProducto);
router.get('/social/data', dataController.getDataRedes);

// --- Ruta Avanzada (SQL Dinámico) ---
router.post('/admin/sql', dataController.ejecutarSQL);

// router.get('/kpis', keycloak.protect(), dataController.getKPIs); <--- COMENTA ESTA
router.get('/kpis', dataController.getKPIs); // <--- DEJA ESTA SIN PROTECCIÓN


module.exports = router;