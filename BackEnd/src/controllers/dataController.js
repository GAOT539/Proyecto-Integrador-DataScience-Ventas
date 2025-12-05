// Controladores para manejar las solicitudes relacionadas con los datos de ventas y KPIs
const pool = require('../db');

// 1. Obtener KPIs principales (Tarjetas superiores del dashboard)
const getKPIs = async (req, res) => {
    try {
        // Consultamos la vista v_kpis definida en tu SQL
        const result = await pool.query('SELECT * FROM dwh.v_kpis');
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener KPIs' });
    }
};

// 2. Obtener Ventas Recientes (Tabla de detalles)
const getVentas = async (req, res) => {
    try {
        // Consultamos la vista completa con un límite para no saturar el front
        const result = await pool.query('SELECT * FROM dwh.v_ventas_completas ORDER BY fecha DESC LIMIT 100');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
};

// 3. Obtener Gráfico de Barras: Ventas por Categoría (Consulta directa a la tabla de hechos)
const getVentasPorCategoria = async (req, res) => {
    try {
        const query = `
            SELECT p.categoria, SUM(f.total) as total_ventas
            FROM dwh.fact_ventas f
            JOIN dwh.dim_producto p ON f.id_producto_fk = p.id_producto_sk
            GROUP BY p.categoria
            ORDER BY total_ventas DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener gráfico' });
    }
};

// 4. Obtener todos los clientes (Con paginación simple para no saturar)
const getClientes = async (req, res) => {
    try {
        const query = 'SELECT * FROM dwh.dim_cliente ORDER BY id_cliente_sk ASC LIMIT 100';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

// 5. Buscar cliente por Nombre Completo o Correo
const buscarCliente = async (req, res) => {
    const { termino } = req.query; // Recibiremos el término por URL (ej: ?termino=Gabriel)

    if (!termino) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    try {
        // Usamos ILIKE para búsqueda insensible a mayúsculas/minúsculas
        // Buscamos coincidencia en nombre_completo O en email
        const query = `
            SELECT * FROM dwh.dim_cliente 
            WHERE nombre_completo ILIKE $1 OR email ILIKE $1
        `;
        const values = [`%${termino}%`]; // Los % permiten buscar coincidencias parciales

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes con ese criterio' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar cliente' });
    }
};

// 6. ENDPOINTS PARA FILTROS (DIMENSIONES)
// Obtener datos de Tiempo (Agrupados para filtros de Año/Mes)
const getDimTiempo = async (req, res) => {
    try {
        // Traemos solo combinaciones únicas de Año y Mes para llenar selectores
        const query = `
            SELECT DISTINCT anio, mes, mes_nombre 
            FROM dwh.dim_tiempo 
            ORDER BY anio DESC, mes DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener dimensión tiempo' });
    }
};

// Obtener Sucursales (Para filtrar por ciudad o nombre)
const getDimSucursal = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM dwh.dim_sucursal ORDER BY ciudad, nombre');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener sucursales' });
    }
};

// Obtener Productos (Categorías y Nombres)
const getDimProducto = async (req, res) => {
    try {
        // Si la lista es muy grande, podrías querer traer solo categorías
        // Por ahora traemos todo para que tú decidas en el Front
        const result = await pool.query('SELECT * FROM dwh.dim_producto ORDER BY categoria, nombre');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// Obtener Redes Sociales (Dimensiones y Hechos combinados o separados)
const getDataRedes = async (req, res) => {
    try {
        // Aquí hacemos un JOIN útil para ver qué red social tiene qué métrica
        const query = `
            SELECT f.*, d.plataforma 
            FROM dwh.fact_redes_sociales f
            JOIN dwh.dim_red_social d ON f.id_red_social_fk = d.id_red_social_sk
            ORDER BY f.fecha_proceso DESC LIMIT 100
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos sociales' });
    }
};


// 7. ENDPOINT ADICIONAL: CONSULTA SQL LIBRE
// ¡ADVERTENCIA!: Esto es peligroso en producción (SQL Injection). 
// Úsalo solo para tu proyecto académico/local o modo administrador.
const ejecutarSQL = async (req, res) => {
    const { consulta } = req.body; // Esperamos un JSON { "consulta": "SELECT..." }

    if (!consulta) {
        return res.status(400).json({ error: 'Falta la consulta SQL' });
    }

    // Bloqueo simple de seguridad para evitar BORRADOS accidentales desde el front
    if (consulta.toLowerCase().includes('drop') || consulta.toLowerCase().includes('delete')) {
        return res.status(403).json({ error: 'Operaciones destructivas no permitidas por seguridad básica.' });
    }

    try {
        const result = await pool.query(consulta);
        res.json({
            columnas: result.fields.map(f => f.name), 
            filas: result.rows,
            total: result.rowCount
        });
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getKPIs,
    getVentas,
    getVentasPorCategoria,
    getClientes,
    buscarCliente,
    getDimTiempo,
    getDimSucursal,
    getDimProducto,
    getDataRedes,
    ejecutarSQL
};