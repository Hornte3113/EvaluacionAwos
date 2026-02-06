#!/bin/bash
set -e

# migrate.sh: Orquesta la ejecución de todos los scripts en orden correcto
# Usa variables de entorno para credenciales (no hardcoded)

echo "Ejecutando migraciones..."

# 1. Crear tablas
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /sql/schema.sql

# 2. Insertar datos de prueba
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /sql/seed.sql

# 3. Crear VIEWS de reportes
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /sql/reports_vw.sql

# 4. Crear índices para optimización
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /sql/indexes.sql

# 5. Crear rol de seguridad con permisos mínimos
# Se pasa APP_CLIENT_PASSWORD como variable psql para evitar hardcodear credenciales
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_client_password="${APP_CLIENT_PASSWORD}" \
  -f /sql/roles.sql

echo "Migraciones completadas."
