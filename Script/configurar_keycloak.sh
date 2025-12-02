#!/bin/bash

# Configuración
CONTAINER="keycloak_ventas"
KCADM="/opt/keycloak/bin/kcadm.sh"
REALM="ventas-realm"
CLIENT_ID="ventas-backend"
USER="usuario1"
USER_PASS="12345"

echo "=== 1. Autenticándose en Keycloak CLI ==="
docker exec -i $CONTAINER $KCADM config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

echo "=== 2. Creando el Realm '$REALM' ==="
# Intentamos crear, si falla es porque ya existe (ignoramos error)
docker exec -i $CONTAINER $KCADM create realms -s realm=$REALM -s enabled=true 2>/dev/null || echo "El realm ya existe o hubo un error menor."

echo "=== 3. Creando el Cliente '$CLIENT_ID' ==="
# Usamos JSON para configuración compleja (Confidencial, Service Accounts, Redirects)
docker exec -i $CONTAINER $KCADM create clients -r $REALM -f - <<EOF
{
  "clientId": "$CLIENT_ID",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true,
  "redirectUris": ["*"],
  "webOrigins": ["*"],
  "publicClient": false,
  "standardFlowEnabled": true,
  "directAccessGrantsEnabled": true
}
EOF

echo "=== 4. Creando Usuario de prueba '$USER' ==="
docker exec -i $CONTAINER $KCADM create users -r $REALM \
  -s username=$USER \
  -s email="test@ventas.com" \
  -s enabled=true 2>/dev/null || echo "El usuario ya existe."

echo "=== 5. Asignando contraseña al usuario ==="
docker exec -i $CONTAINER $KCADM set-password -r $REALM \
  --username $USER \
  --new-password $USER_PASS

echo ""
echo "============================================="
echo "   CONFIGURACIÓN FINALIZADA CON ÉXITO"
echo "============================================="
echo ""
echo "Necesitas el CLIENT SECRET para tu Node.js."
echo "Aquí están las credenciales:"
echo ""

# Obtener el ID interno del cliente para poder pedir su secreto
CLIENT_UUID=$(docker exec -i $CONTAINER $KCADM get clients -r $REALM --fields id,clientId | grep -B 1 "$CLIENT_ID" | head -n 1 | cut -d '"' -f 4)

# Obtener el Secreto usando el UUID
SECRET=$(docker exec -i $CONTAINER $KCADM get clients/$CLIENT_UUID/client-secret -r $REALM | grep "value" | cut -d '"' -f 4)

echo "------------------------------------------------"
echo "Realm:         $REALM"
echo "Client ID:     $CLIENT_ID"
echo "Client Secret: $SECRET"
echo "------------------------------------------------"
echo ""
echo "Copia ese 'Client Secret' en tu archivo .env y keycloak-config.js"