-- 2. CREAR ESQUEMAS
CREATE SCHEMA staging;  -- Para datos temporales/crudos
CREATE SCHEMA dwh;      -- Para el Data Warehouse

-- =============================================
-- ÁREA STAGING (Tablas temporales)
-- =============================================

-- Tabla staging para ventas
CREATE TABLE staging.stg_ventas (
    id_venta INTEGER,
    fecha DATE,
    id_cliente INTEGER,
    id_producto INTEGER,
    id_sucursal INTEGER,
    cantidad INTEGER,
    precio_unitario NUMERIC(10,2),
    total NUMERIC(10,2),
    descuento NUMERIC(5,2),
    metodo_pago VARCHAR(50),
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla staging para clientes
CREATE TABLE staging.stg_clientes (
    id_cliente INTEGER,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(150),
    ciudad VARCHAR(100),
    genero CHAR(1),
    edad INTEGER,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla staging para productos
CREATE TABLE staging.stg_productos (
    id_producto INTEGER,
    nombre VARCHAR(200),
    categoria VARCHAR(100),
    precio NUMERIC(10,2),
    stock INTEGER,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla staging para clima
CREATE TABLE staging.stg_clima (
    fecha DATE,
    ciudad VARCHAR(100),
    temperatura_max NUMERIC(5,2),
    temperatura_min NUMERIC(5,2),
    humedad INTEGER,
    precipitacion NUMERIC(5,2),
    condicion VARCHAR(50),
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla staging para redes sociales
CREATE TABLE staging.stg_redes_sociales (
    fecha DATE,
    plataforma VARCHAR(50),
    menciones INTEGER,
    sentimiento VARCHAR(20),
    likes INTEGER,
    shares INTEGER,
    comentarios INTEGER,
    id_producto INTEGER,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla staging para sucursales
CREATE TABLE staging.stg_sucursales (
    id_sucursal INTEGER,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    --region VARCHAR(50),
    gerente VARCHAR(100),
    area_m2 INTEGER,
    --fecha_apertura DATE,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DATA WAREHOUSE - DIMENSIONES
-- =============================================

-- Dimensión Tiempo
CREATE TABLE dwh.dim_tiempo (
    id_tiempo SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    mes_nombre VARCHAR(20),
    dia INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL,
    dia_semana_nombre VARCHAR(20),
    trimestre INTEGER NOT NULL,
    semana_anio INTEGER NOT NULL,
    es_fin_semana BOOLEAN,
    es_festivo BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensión Cliente
CREATE TABLE dwh.dim_cliente (
    id_cliente_sk SERIAL PRIMARY KEY,
    id_cliente_nk INTEGER NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    nombre_completo VARCHAR(200),
    email VARCHAR(150),
    ciudad VARCHAR(100),
    genero CHAR(1),
    edad INTEGER,
    segmento_edad VARCHAR(20),
    fecha_alta DATE,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_cliente_nk)
);



-- Dimensión Producto
CREATE TABLE dwh.dim_producto (
    id_producto_sk SERIAL PRIMARY KEY,
    id_producto_nk INTEGER NOT NULL,
    nombre VARCHAR(200),
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    precio_actual NUMERIC(10,2),
    rango_precio VARCHAR(20),
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_producto_nk)
);

-- Dimensión Sucursal
CREATE TABLE dwh.dim_sucursal (
    id_sucursal_sk SERIAL PRIMARY KEY,
    id_sucursal_nk INTEGER NOT NULL,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    region VARCHAR(50),
    gerente VARCHAR(100),
    area_m2 INTEGER,
    fecha_apertura DATE,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_sucursal_nk)
);

-- Dimensión Clima
CREATE TABLE dwh.dim_clima (
    id_clima_sk SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    temperatura_max NUMERIC(5,2),
    temperatura_min NUMERIC(5,2),
    temperatura_promedio NUMERIC(5,2),
    humedad INTEGER,
    precipitacion NUMERIC(5,2),
    condicion VARCHAR(50),
    clasificacion_clima VARCHAR(30),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, ciudad)
);

-- Dimensión Redes Sociales
CREATE TABLE dwh.dim_red_social (
    id_red_social_sk SERIAL PRIMARY KEY,
    plataforma VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plataforma)
);

-- =============================================
-- DATA WAREHOUSE - TABLAS DE HECHOS
-- =============================================

-- Tabla de Hechos: Ventas
CREATE TABLE dwh.fact_ventas (
    id_venta_sk SERIAL PRIMARY KEY,
    id_venta_nk INTEGER NOT NULL,
    id_tiempo_fk INTEGER REFERENCES dwh.dim_tiempo(id_tiempo),
    id_cliente_fk INTEGER REFERENCES dwh.dim_cliente(id_cliente_sk),
    id_producto_fk INTEGER REFERENCES dwh.dim_producto(id_producto_sk),
    id_sucursal_fk INTEGER REFERENCES dwh.dim_sucursal(id_sucursal_sk),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    descuento_porcentaje NUMERIC(5,2),
    descuento_monto NUMERIC(10,2),
    subtotal NUMERIC(10,2),
    total NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    fecha_proceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Hechos: Métricas Redes Sociales
CREATE TABLE dwh.fact_redes_sociales (
    id_metrica_sk SERIAL PRIMARY KEY,
    id_tiempo_fk INTEGER REFERENCES dwh.dim_tiempo(id_tiempo),
    id_producto_fk INTEGER REFERENCES dwh.dim_producto(id_producto_sk),
    id_red_social_fk INTEGER REFERENCES dwh.dim_red_social(id_red_social_sk),
    menciones INTEGER DEFAULT 0,
    sentimiento VARCHAR(20),
    score_sentimiento INTEGER, -- -1: Negativo, 0: Neutral, 1: Positivo
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comentarios INTEGER DEFAULT 0,
    engagement_total INTEGER,
    fecha_proceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices en dimensiones
CREATE INDEX idx_dim_tiempo_fecha ON dwh.dim_tiempo(fecha);
CREATE INDEX idx_dim_tiempo_anio_mes ON dwh.dim_tiempo(anio, mes);
CREATE INDEX idx_dim_cliente_ciudad ON dwh.dim_cliente(ciudad);
CREATE INDEX idx_dim_producto_categoria ON dwh.dim_producto(categoria);
CREATE INDEX idx_dim_sucursal_ciudad ON dwh.dim_sucursal(ciudad);
CREATE INDEX idx_dim_clima_fecha_ciudad ON dwh.dim_clima(fecha, ciudad);

-- Índices en hechos
CREATE INDEX idx_fact_ventas_tiempo ON dwh.fact_ventas(id_tiempo_fk);
CREATE INDEX idx_fact_ventas_cliente ON dwh.fact_ventas(id_cliente_fk);
CREATE INDEX idx_fact_ventas_producto ON dwh.fact_ventas(id_producto_fk);
CREATE INDEX idx_fact_ventas_sucursal ON dwh.fact_ventas(id_sucursal_fk);
CREATE INDEX idx_fact_redes_tiempo ON dwh.fact_redes_sociales(id_tiempo_fk);
CREATE INDEX idx_fact_redes_producto ON dwh.fact_redes_sociales(id_producto_fk);

-- =============================================
-- VISTAS PARA CONSULTAS ANALÍTICAS
-- =============================================

-- Vista: Ventas con dimensiones completas
CREATE OR REPLACE VIEW dwh.v_ventas_completas AS
SELECT 
    v.id_venta_nk,
    t.fecha,
    t.anio,
    t.mes_nombre,
    t.dia_semana_nombre,
    c.nombre_completo AS cliente,
    c.ciudad AS ciudad_cliente,
    c.segmento_edad,
    p.nombre AS producto,
    p.categoria,
    p.rango_precio,
    s.nombre AS sucursal,
    s.ciudad AS ciudad_sucursal,
    v.cantidad,
    v.precio_unitario,
    v.total,
    v.metodo_pago,
    cl.temperatura_promedio,
    cl.condicion AS clima
FROM dwh.fact_ventas v
LEFT JOIN dwh.dim_tiempo t ON v.id_tiempo_fk = t.id_tiempo
LEFT JOIN dwh.dim_cliente c ON v.id_cliente_fk = c.id_cliente_sk
LEFT JOIN dwh.dim_producto p ON v.id_producto_fk = p.id_producto_sk
LEFT JOIN dwh.dim_sucursal s ON v.id_sucursal_fk = s.id_sucursal_sk
LEFT JOIN dwh.dim_clima cl ON t.fecha = cl.fecha AND s.ciudad = cl.ciudad;

-- Vista: KPIs principales
CREATE OR REPLACE VIEW dwh.v_kpis AS
SELECT 
    COUNT(DISTINCT id_venta_nk) AS total_ventas,
    COUNT(DISTINCT id_cliente_fk) AS clientes_unicos,
    SUM(total) AS ingresos_totales,
    AVG(total) AS ticket_promedio,
    SUM(cantidad) AS unidades_vendidas
FROM dwh.fact_ventas;

-- =============================================
-- FUNCIONES AUXILIARES
-- =============================================

-- Función para poblar dimensión tiempo
CREATE OR REPLACE FUNCTION dwh.poblar_dim_tiempo(
    fecha_inicio DATE,
    fecha_fin DATE
)
RETURNS INTEGER AS $$
DECLARE
    fecha_actual DATE;
    registros INTEGER := 0;
BEGIN
    fecha_actual := fecha_inicio;
    
    WHILE fecha_actual <= fecha_fin LOOP
        INSERT INTO dwh.dim_tiempo (
            fecha, anio, mes, mes_nombre, dia, dia_semana, 
            dia_semana_nombre, trimestre, semana_anio, es_fin_semana
        )
        VALUES (
            fecha_actual,
            EXTRACT(YEAR FROM fecha_actual),
            EXTRACT(MONTH FROM fecha_actual),
            TO_CHAR(fecha_actual, 'Month'),
            EXTRACT(DAY FROM fecha_actual),
            EXTRACT(DOW FROM fecha_actual),
            TO_CHAR(fecha_actual, 'Day'),
            EXTRACT(QUARTER FROM fecha_actual),
            EXTRACT(WEEK FROM fecha_actual),
            EXTRACT(DOW FROM fecha_actual) IN (0, 6)
        )
        ON CONFLICT (fecha) DO NOTHING;
        
        registros := registros + 1;
        fecha_actual := fecha_actual + INTERVAL '1 day';
    END LOOP;
    
    RETURN registros;
END;
$$ LANGUAGE plpgsql;


--Crear y poblar incremental
CREATE TABLE dwh.etl_control (
    proceso VARCHAR(50) PRIMARY KEY,
    ultima_ejecucion TIMESTAMP NOT NULL
);

INSERT INTO dwh.etl_control VALUES 
('incremental', '2000-01-01 00:00:00');

select * from dwh.dim_sucursal
delete from staging.stg_sucursales
select * from staging.stg_sucursales

-- Poblar dimensión tiempo (2024 completo)
SELECT dwh.poblar_dim_tiempo('2024-01-01', '2024-12-31');

-- Poblar dimensión redes sociales
INSERT INTO dwh.dim_red_social (plataforma, descripcion) VALUES
('Twitter', 'Plataforma de microblogging'),
('Facebook', 'Red social general'),
('Instagram', 'Compartir fotos y videos'),
('TikTok', 'Videos cortos');

-- =============================================
-- GRANTS Y PERMISOS
-- =============================================

-- Crear usuario para la aplicación
CREATE USER app_ventas WITH PASSWORD 'VentasDigitales2024!';

-- Otorgar permisos
-- Otorgar uso de los esquemas
GRANT USAGE ON SCHEMA staging TO app_ventas;
GRANT USAGE ON SCHEMA dwh TO app_ventas;

-- Permisos en staging (LECTURA/ESCRITURA COMPLETA)
GRANT ALL ON ALL TABLES IN SCHEMA staging TO app_ventas;
GRANT ALL ON ALL SEQUENCES IN SCHEMA staging TO app_ventas;

-- Permisos en dwh para ETL
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA dwh TO app_ventas;

-- Permisos en secuencias (necesario para SERIAL)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA dwh TO app_ventas;

-- Para que futuros objetos también tengan permiso automáticamente:
ALTER DEFAULT PRIVILEGES IN SCHEMA dwh GRANT SELECT, INSERT, UPDATE ON TABLES TO app_ventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA dwh GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO app_ventas;
-- Mensaje final
SELECT 'Data Warehouse creado exitosamente!' AS mensaje;


