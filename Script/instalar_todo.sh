#!/bin/bash

# ==========================================
# SCRIPT DE DESPLIEGUE AUTOMATICO
# Proyecto: Data Warehouse Ventas
# OS: Rocky Linux 8 Minimal
# ==========================================

# Variables de Configuración
DB_PASSWORD="password_seguro_123"
KEYCLOAK_ADMIN_PASSWORD="admin"
VM_IP="192.168.100.71" # Ajustar a la ip de la VM
BACKUP_URL="https://github.com/GAOT539/Proyecto-Integrador-DataScience-Ventas/raw/main/sql/DW_Ventas_Digitales.backup"

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> INICIANDO INSTALACIÓN AUTOMATIZADA...${NC}"

# 1. ACTUALIZACIÓN DEL SISTEMA Y HERRAMIENTAS
echo -e "${GREEN}[1/8] Actualizando sistema e instalando utilidades...${NC}"
dnf update -y
dnf install -y yum-utils device-mapper-persistent-data lvm2 wget nano git

# 2. INSTALACIÓN DE DOCKER
echo -e "${GREEN}[2/8] Instalando Docker y Docker Compose...${NC}"
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Habilitar servicio para arranque automático
systemctl start docker
systemctl enable docker
echo "Docker activo."

# 3. CONFIGURACIÓN DEL FIREWALL
echo -e "${GREEN}[3/8] Configurando Firewall (Puertos 5432 y 8080)...${NC}"
firewall-cmd --permanent --zone=public --add-port=5432/tcp
firewall-cmd --permanent --zone=public --add-port=8080/tcp
firewall-cmd --reload

# 4. PREPARACIÓN DE DIRECTORIOS Y BACKUP
echo -e "${GREEN}[4/8] Descargando Backup de la Base de Datos...${NC}"
mkdir -p /root/infraestructura/backups
cd /root/infraestructura

# Descargar el archivo .backup (Sobrescribe si existe)
wget $BACKUP_URL -O ./backups/DW_Ventas_Digitales.backup

# 5. GENERACIÓN DEL DOCKER-COMPOSE.YML
echo -e "${GREEN}[5/8] Creando archivo de orquestación (Postgres 17 + Keycloak)...${NC}"
cat <<EOF > docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:17
    container_name: db_ventas
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password_seguro_123
      POSTGRES_DB: ventas_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/tmp/backups

  keycloak:
    image: quay.io/keycloak/keycloak:24.0.1
    container_name: keycloak_ventas
    restart: always
    command: start-dev
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/ventas_db
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: password_seguro_123
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_HOSTNAME: 192.168.56.101
      KC_HTTP_ENABLED: "true"
      KC_HOSTNAME_STRICT: "false"
      KC_HOSTNAME_STRICT_HTTPS: "false"
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
EOF

# 6. DESPLIEGUE DE CONTENEDORES
echo -e "${GREEN}[6/8] Levantando servicios...${NC}"
# Forzamos recreación para asegurar limpieza
docker compose down -v 2>/dev/null
docker compose up -d

echo "Esperando 30 segundos para que la Base de Datos inicie correctamente..."
sleep 30

# 7. RESTAURACIÓN DE BASE DE DATOS
echo -e "${GREEN}[7/8] Restaurando Backup...${NC}"
# Ejecutamos pg_restore. Puede arrojar warnings, por eso el "|| true" para que el script no se detenga.
docker exec -i db_ventas pg_restore -U postgres -d ventas_db -v "/tmp/backups/DW_Ventas_Digitales.backup" || true
echo "Restauración finalizada (ignorar advertencias de roles faltantes)."

# 8. CORRECCIÓN DE PERMISOS Y USUARIOS
echo -e "${GREEN}[8/8] Creando usuario 'app_ventas' y asignando permisos...${NC}"

docker exec -i db_ventas psql -U postgres -d ventas_db <<EOF
-- Crear usuario si no existe
DO
\$\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_ventas') THEN
      CREATE USER app_ventas WITH PASSWORD 'Ventas2024';
   END IF;
END
\$\$;

-- Asignar permisos
-- 1. Crear usuario (si no existe) con el escape correcto para el signo !
DO
\$\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_ventas') THEN
      CREATE USER app_ventas WITH PASSWORD 'Ventas2024';
   END IF;
END
\$\$;

-- 2. Dar permisos TOTALES sobre la base de datos
GRANT CONNECT ON DATABASE ventas_db TO app_ventas;

-- 3. Dar permisos TOTALES sobre los esquemas (Poder crear/borrar tablas)
GRANT ALL PRIVILEGES ON SCHEMA staging TO app_ventas;
GRANT ALL PRIVILEGES ON SCHEMA dwh TO app_ventas;
GRANT ALL PRIVILEGES ON SCHEMA public TO app_ventas;

-- 4. Dar permisos TOTALES sobre todas las tablas actuales (Leer, Escribir, Borrar, Truncar)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA staging TO app_ventas;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dwh TO app_ventas;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_ventas;

-- 5. Dar permisos TOTALES sobre secuencias (Para los ID autoincrementables)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA staging TO app_ventas;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA dwh TO app_ventas;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_ventas;

-- 6. Configurar para el FUTURO (Que las tablas nuevas también tengan permisos automáticos)
ALTER DEFAULT PRIVILEGES IN SCHEMA dwh GRANT ALL PRIVILEGES ON TABLES TO app_ventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA staging GRANT ALL PRIVILEGES ON TABLES TO app_ventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_ventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA dwh GRANT ALL PRIVILEGES ON SEQUENCES TO app_ventas;
ALTER DEFAULT PRIVILEGES IN SCHEMA staging GRANT ALL PRIVILEGES ON SEQUENCES TO app_ventas;

EOF

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   INSTALACIÓN COMPLETADA EXITOSAMENTE    ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "Estado de los servicios:"
docker ps
echo -e "Datos en clientes:"
docker exec -i db_ventas psql -U postgres -d ventas_db -c "SELECT count(*) as total_clientes FROM dwh.dim_cliente;"