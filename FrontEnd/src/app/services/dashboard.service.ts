import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getKPIs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/kpis`);
  }

  getVentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas`);
  }

  // Nuevo método para el gráfico
  getVentasPorCategoria(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grafico-categorias`);
  }
  
  // Agreguemos de una vez los de clientes para la Fase 2
  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  buscarCliente(termino: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/buscar?termino=${termino}`);
  }
}