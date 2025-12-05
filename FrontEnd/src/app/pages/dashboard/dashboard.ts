import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // <--- 1. AGREGAR ESTO
import { DashboardService } from '../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  kpis: any = {};
  ventas: any[] = [];
  isBrowser: boolean;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Ventas por Categoría ($)', backgroundColor: '#0d6efd' }]
  };
  public chartLoaded = false;

  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router // <--- 2. INYECTAR EL ROUTER AQUÍ
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarDatos();
    }
  }

  // <--- 3. AGREGAR ESTA FUNCIÓN PARA REDIRIGIR
  irAClientes() {
    this.router.navigate(['/clientes']);
  }

  cargarDatos() {
    // 1. KPIs
    this.dashboardService.getKPIs().subscribe({
      next: (data: any) => this.kpis = data,
      error: (e: any) => console.error('Error KPIs', e)
    });

    // 2. Ventas Tabla
    this.dashboardService.getVentas().subscribe({
      next: (data: any) => this.ventas = data,
      error: (e: any) => console.error('Error Ventas', e)
    });

    // 3. Cargar Gráfico
    this.dashboardService.getVentasPorCategoria().subscribe({
      next: (data: any[]) => {
        this.barChartData.labels = data.map(item => item.categoria);
        this.barChartData.datasets[0].data = data.map(item => item.total_ventas);
        this.chartLoaded = true;
      },
      error: (e: any) => console.error('Error Gráfico', e)
    });
  }
}