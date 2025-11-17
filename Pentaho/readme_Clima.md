
# Importación de Clima a Pentaho (CSV)

## ✅ Requisitos

* PostgreSQL instalado (localhost:5432)
* Pentaho Data Integration (Spoon)
* Archivo `clima.csv`
* Opcional: pgAdmin

---

## 📌 1. Crear Base de Datos y Usuario

Guarda como: **`sql/01_create_db_and_user.sql`**

<pre class="overflow-visible!" data-start="368" data-end="585"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>-- Ejecutar como superusuario postgres</span><span>
</span><span>CREATE</span><span> DATABASE dw_ventas_digitales;

</span><span>CREATE</span><span></span><span>USER</span><span> app_ventas </span><span>WITH</span><span> PASSWORD </span><span>'VentasDigitales2024!'</span><span>;

</span><span>GRANT</span><span></span><span>ALL</span><span> PRIVILEGES </span><span>ON</span><span> DATABASE dw_ventas_digitales </span><span>TO</span><span> app_ventas;
</span></span></code></div></div></pre>

---

## 📌 2. Crear Esquema y Tabla

Guarda como: **`sql/02_create_schema_table.sql`**

<pre class="overflow-visible!" data-start="676" data-end="1021"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>-- Ejecutar dentro de la BD dw_ventas_digitales</span><span>
</span><span>CREATE</span><span> SCHEMA IF </span><span>NOT</span><span></span><span>EXISTS</span><span> staging </span><span>AUTHORIZATION</span><span> app_ventas;

</span><span>CREATE</span><span></span><span>TABLE</span><span> IF </span><span>NOT</span><span></span><span>EXISTS</span><span> staging.stg_clima (
    fecha </span><span>DATE</span><span>,
    ciudad </span><span>VARCHAR</span><span>(</span><span>100</span><span>),
    temp_max </span><span>NUMERIC</span><span>(</span><span>10</span><span>,</span><span>2</span><span>),
    temp_min </span><span>NUMERIC</span><span>(</span><span>10</span><span>,</span><span>2</span><span>),
    humedad </span><span>INT</span><span>,
    precipitacion </span><span>NUMERIC</span><span>(</span><span>10</span><span>,</span><span>2</span><span>),
    condicion </span><span>VARCHAR</span><span>(</span><span>200</span><span>)
);
</span></span></code></div></div></pre>

---

## 📌 3. Permisos adicionales

Guarda como: **`sql/03_grants.sql`**

<pre class="overflow-visible!" data-start="1098" data-end="1237"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>GRANT</span><span> USAGE </span><span>ON</span><span> SCHEMA staging </span><span>TO</span><span> app_ventas;
</span><span>GRANT</span><span></span><span>INSERT</span><span>, </span><span>SELECT</span><span>, </span><span>UPDATE</span><span>, </span><span>DELETE</span><span></span><span>ON</span><span></span><span>ALL</span><span> TABLES </span><span>IN</span><span> SCHEMA staging </span><span>TO</span><span> app_ventas;
</span></span></code></div></div></pre>
