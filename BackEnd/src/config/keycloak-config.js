var keycloakConfig = {
    clientId: 'ventas-backend',
    bearerOnly: true,
    serverUrl: process.env.KEYCLOAK_URL,
    realm: 'ventas-realm',
    credentials: {
        secret: process.env.KEYCLOAK_SECRET // <--- TU CÓDIGO AQUÍ
    }
};