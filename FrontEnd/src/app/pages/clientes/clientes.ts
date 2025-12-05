import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Vital para leer el input
import { RouterModule } from '@angular/router'; // <--- Para el botón de volver
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent {
  
  terminoBusqueda: string = ''; // Lo que escribe el usuario
  clientes: any[] = [];         // Resultados
  buscando = false;             // Para mostrar spinner
  errorMsg = '';                // Mensajes de error

  constructor(private dashboardService: DashboardService) { }

  buscar() {
    // Validación: No buscar si está vacío
    if (!this.terminoBusqueda.trim()) return;

    this.buscando = true;
    this.errorMsg = '';
    this.clientes = [];

    // Llamada al Backend
    this.dashboardService.buscarCliente(this.terminoBusqueda).subscribe({
      next: (data: any) => {
        this.clientes = data;
        this.buscando = false;
      },
      error: (e: any) => {
        console.error(e);
        this.buscando = false;
        // Manejo de errores (ej: 404 No encontrado)
        if (e.status === 404) {
            this.errorMsg = 'No se encontraron clientes con ese criterio.';
        } else {
            this.errorMsg = 'Ocurrió un error al buscar.';
        }
      }
    });
  }
  
}