# 📊 Proyecto Integrador Data Science - Ventas

El sistema implementa una **arquitectura de tres capas principales** y una **capa de despliegue**, utilizando tecnologías *open source* y *enterprise*.

---

## 🧱 Arquitectura del Sistema

### 🗂️ Capa ETL / Data Layer (Pentaho PDI & PostgreSQL)

**Función:**  
Ingesta de datos desde diversas fuentes (bases de datos, archivos CSV y APIs externas), incluyendo validación, limpieza y transformación.

**Tecnologías:**  
- Pentaho Data Integration (PDI / Spoon)  
- PostgreSQL como motor del *Data Warehouse* bajo un modelo estrella (*Star Schema*)

---

### ⚙️ Capa Backend (Spring Boot)

**Función:**  
Exposición segura de los datos analíticos mediante **APIs REST** para KPIs, series temporales y dimensiones.

**Tecnologías:**  
- Spring Boot (Java 17+)  
- Seguridad implementada con **Keycloak** (autenticación y gestión de roles: analista, administrador)

---

### 💻 Capa Frontend (Angular)

**Función:**  
Proporcionar una **interfaz de usuario interactiva** para la visualización y exploración de datos.

**Tecnologías:**  
- Angular 18+  
- Dashboards con filtros dinámicos (fecha, sucursal, producto)  
- Visualizaciones clave: barras, líneas y dispersión

---

### 🐳 Capa DevOps / Despliegue

**Función:**  
Empaquetado y orquestación de los componentes del sistema.

**Tecnologías:**  
- **Docker Compose** para un despliegue integrado, reproducible y portable del sistema completo.

---

## 🎯 Objetivos Específicos

- Diseñar e implementar un **Data Warehouse** bajo el modelo estrella.  
- Desarrollar procesos **ETL de carga incremental** en Pentaho PDI.  
- Crear **APIs REST seguras** en Spring Boot para alimentar el frontend.  
- Construir un **frontend interactivo con autenticación** y dashboards analíticos.  
- *(Opcional / Bonus)*: Integrar un modelo de **Machine Learning (ML)** para la predicción de ventas (usando Orange Data Mining o Python).

---

## 📅 Alcance y Fechas Clave

- **Inicio de la Planificación:** 25 de octubre de 2025  
- **Entrega y Defensa Final:** 5 de diciembre de 2025  

**Metodología:**  
Gestión ágil mediante **Azure DevOps (Scrum)** para planificación, seguimiento de tareas y control de versiones.

---

## 🧩 Diagrama General

```mermaid
graph TD
    A[Fuentes de Datos: DB, CSV, API] --> B[ETL - Pentaho PDI]
    B --> C[Data Warehouse - PostgreSQL]
    C --> D[Backend - Spring Boot]
    D --> E[Frontend - Angular]
    E --> F[Usuario Final]
    D -->|APIs REST| E
    A -->|Carga Incremental| B
    G[Docker Compose] --> B
    G --> C
    G --> D
    G --> E
