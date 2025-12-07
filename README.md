# Proyecto Integrador: Data Science y Ventas Digitales

Este repositorio aloja una solución integral de **Business Intelligence
y Data Science** aplicada al análisis de ventas minoristas. El sistema
orquesta un flujo completo de datos, desde la extracción y
transformación (ETL) hasta su visualización en un Dashboard interactivo,
pasando por una arquitectura segura de microservicios.

El objetivo principal es correlacionar datos transaccionales de ventas
con factores externos (como el clima y redes sociales) para facilitar la
toma de decisiones estratégicas.

------------------------------------------------------------------------

## 🏗 Arquitectura del Proyecto

El sistema está construido siguiendo una arquitectura modular y
escalable:

### 1. Data Warehousing & ETL (Pentaho)

-   **Herramienta:** Pentaho Data Integration (PDI).
-   **Proceso:** Extracción de fuentes heterogéneas (CSV, APIs),
    limpieza de datos y carga en un Data Warehouse.
-   **Componentes:**
    -   Transformaciones (`.ktr`) para limpieza y normalización.
    -   Jobs (`.kjb`) para la orquestación del flujo de trabajo maestro.
-   **Datos:** Gestión de dimensiones (Clientes, Productos, Sucursales)
    y tablas de hechos (Ventas, Redes Sociales).

### 2. Backend (Node.js & Express)

-   **API RESTful:** Expone los datos procesados del Data Warehouse
    hacia el frontend.
-   **Seguridad:** Implementación de autenticación y autorización
    robusta mediante **Keycloak**.
-   **Base de Datos:** Conexión optimizada a PostgreSQL.

### 3. Frontend (Angular)

-   **Dashboard:** Interfaz de usuario moderna y reactiva para la
    visualización de KPIs.
-   **Reportes:** Visualización de tendencias de ventas, impacto
    climático y métricas de clientes.

------------------------------------------------------------------------

## 🛠 Tecnologías Utilizadas

-   **Lenguajes:** TypeScript, JavaScript, SQL, Python.
-   **Frontend:** Angular (v16+), HTML5, CSS3.
-   **Backend:** Node.js, Express.
-   **Base de Datos:** PostgreSQL.
-   **ETL/BI:** Pentaho Data Integration, Pentaho Report Designer.
-   **Seguridad (IAM):** Keycloak.
-   **Infraestructura/DevOps:** Bash Scripting, Docker (opcional).

------------------------------------------------------------------------

## 📂 Estructura del Repositorio

``` bash
├── BackEnd/             
├── FrontEnd/            
├── Pentaho/             
│   ├── Proyecto/
│   │   ├── 01 csv/      
│   │   ├── 02 Base de datos/
│   │   ├── 03 Pentaho/  
│   │   └── 04 Reportes/ 
├── Script/              
├── sql/                 
└── Files .csv/          
```

------------------------------------------------------------------------

## 🚀 Guía de Instalación y Despliegue

### Prerrequisitos

-   Node.js (v18+)
-   PostgreSQL (v13+)
-   Pentaho Data Integration
-   Java JDK 8
-   Angular CLI

### Paso 1: Configuración de Base de Datos

``` bash
pg_restore -U tu_usuario -d DW_Ventas_Digitales -1 "sql/DW_Ventas_Digitales.backup"
```

### Paso 2: Backend

``` bash
cd BackEnd
npm install
npm start
```

### Paso 3: Frontend

``` bash
cd FrontEnd
npm install
ng serve
```

### Paso 4: ETL en Pentaho

Cargar y ejecutar el job `master_etl.kjb`.

------------------------------------------------------------------------

## 👥 Equipo y Contribución

Proyecto Integrador --- Estado: Finalizado / En Mantenimiento.
