import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { KeycloakService, KeycloakBearerInterceptor } from 'keycloak-angular';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';
// Importamos withFetch para mejor rendimiento y compatibilidad con SSR
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';

// Importaciones para Gráficos
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

function initializeKeycloak(keycloak: KeycloakService, platformId: Object) {
  return () => {
    // Verificamos si estamos en el navegador antes de iniciar Keycloak
    if (isPlatformBrowser(platformId)) {
      return keycloak.init({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        },
        initOptions: {
          onLoad: 'login-required',
          checkLoginIframe: false
        },
        enableBearerInterceptor: true,
        bearerPrefix: 'Bearer',
      });
    }
    // Si es SSR (Servidor), retornamos promesa vacía
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // CORRECCIÓN AQUÍ: Agregamos withFetch() dentro de los paréntesis
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    
    // Proveedor de Gráficos
    provideCharts(withDefaultRegisterables()),

    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, PLATFORM_ID] 
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ]
};