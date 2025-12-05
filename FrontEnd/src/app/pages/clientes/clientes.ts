import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent {
  
  // --- VARIABLES DE BÚSQUEDA (Tú código original) ---
  terminoBusqueda: string = ''; 
  clientes: any[] = [];         
  buscando = false;             
  errorMsg = '';                

  // --- NUEVAS VARIABLES PARA EL MODAL Y DETALLE ---
  selectedCliente: any = null;
  mostrarModal: boolean = false;
  cargandoCompras: boolean = false; // Spinner para la carga del SQL

  constructor(private dashboardService: DashboardService) { }

  // --- TU FUNCIÓN DE BÚSQUEDA ORIGINAL ---
  buscar() {
    if (!this.terminoBusqueda.trim()) return;

    this.buscando = true;
    this.errorMsg = '';
    this.clientes = [];

    this.dashboardService.buscarCliente(this.terminoBusqueda).subscribe({
      next: (data: any) => {
        this.clientes = data;
        this.buscando = false;
      },
      error: (e: any) => {
        console.error(e);
        this.buscando = false;
        if (e.status === 404) {
            this.errorMsg = 'No se encontraron clientes con ese criterio.';
        } else {
            this.errorMsg = 'Ocurrió un error al buscar.';
        }
      }
    });
  }

  verDetalleCliente(cliente: any) {
    // 1. Datos iniciales (mientras carga)
    this.selectedCliente = {
      ...cliente,
      telefono: 'Cargando...',
      direccion: 'Cargando...',
      ultimasCompras: [],
      totalGastado: 0
    };

    this.mostrarModal = true;
    this.cargandoCompras = true;

    // 2. SQL ADAPTADO A TU ESQUEMA (dwh)
    // Usamos JOINs con las dimensiones porque es un esquema Estrella
    const sql = `
      SELECT 
        p.nombre AS nombre_producto, 
        t.fecha AS fecha_venta, 
        v.cantidad, 
        v.total AS total_ventas
      FROM dwh.fact_ventas v
      JOIN dwh.dim_producto p ON v.id_producto_fk = p.id_producto_sk
      JOIN dwh.dim_tiempo t ON v.id_tiempo_fk = t.id_tiempo
      JOIN dwh.dim_cliente c ON v.id_cliente_fk = c.id_cliente_sk
      WHERE c.id_cliente_nk = ${cliente.id_cliente_nk}
      ORDER BY t.fecha DESC

    `;

    // 3. Petición al Backend
    this.dashboardService.getCustomSQL(sql).subscribe({
      next: (resp: any) => {
        this.selectedCliente.ultimasCompras = resp.filas;
        
        // Calcular total gastado
        const total = resp.filas.reduce((acc: number, item: any) => acc + parseFloat(item.total_ventas), 0);
        this.selectedCliente.totalGastado = total;
        
        // Datos extra (Simulados o podrías sacarlos de dim_cliente si los tuvieras)
        this.selectedCliente.direccion = cliente.ciudad || 'Sin dirección';
        
        this.cargandoCompras = false;
      },
      error: (err) => {
        this.cargandoCompras = false;
        console.error("❌ ERROR SQL:", err);
        alert("Error al obtener compras. Revisa la consola para más detalles.");
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.selectedCliente = null;
  }
  
}