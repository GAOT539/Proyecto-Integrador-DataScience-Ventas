import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  kpis: any = {};
  ventas: any[] = [];
  isBrowser: boolean;

  // --- VARIABLES PARA GRÁFICOS AVANZADOS (SQL LIBRE) ---

  // Tanda 1: Básicos
  topProductos: any[] = [];
  topClientes: any[] = [];
  ventasPorCiudad: any[] = [];
  metodosPago: any[] = [];
  socialEngagement: any[] = [];
  socialSentimiento: any[] = [];

  // Tanda 2: Tendencias y Contexto
  ventasMensuales: any[] = [];
  ventasDiaSemana: any[] = [];
  ventasGenero: any[] = [];
  ventasSegmentoEdad: any[] = [];
  ventasRangoPrecio: any[] = [];

  cargandoAvanzado = true; // Spinner para toda la sección avanzada

  // Configuración del Gráfico existente (Chart.js)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Ventas por Categoría ($)', backgroundColor: '#0d6efd' }],
  };
  public chartLoaded = false;

  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarDatos();
      this.cargarGraficosAvanzados(); // <--- Ejecuta las 11 consultas SQL
    }
  }

  irAClientes() {
    this.router.navigate(['/clientes']);
  }

  cargarDatos() {
    // 1. KPIs
    this.dashboardService.getKPIs().subscribe({
      next: (data: any) => (this.kpis = data),
      error: (e: any) => console.error('Error KPIs', e),
    });

    // 2. Ventas Tabla
    this.dashboardService.getVentas().subscribe({
      next: (data: any) => (this.ventas = data),
      error: (e: any) => console.error('Error Ventas', e),
    });

    // 3. Cargar Gráfico (Chart.js existente)
    this.dashboardService.getVentasPorCategoria().subscribe({
      next: (data: any[]) => {
        this.barChartData.labels = data.map((item) => item.categoria);
        this.barChartData.datasets[0].data = data.map((item) => item.total_ventas);
        this.chartLoaded = true;
      },
      error: (e: any) => console.error('Error Gráfico', e),
    });
  }

  // --- LÓGICA SQL AVANZADA (11 CONSULTAS) ---
  cargarGraficosAvanzados() {
    this.cargandoAvanzado = true;

    // 1. TOP PRODUCTOS
    const q1 = `
      SELECT p.nombre, SUM(v.cantidad) as valor 
      FROM dwh.fact_ventas v 
      JOIN dwh.dim_producto p ON v.id_producto_fk = p.id_producto_sk 
      GROUP BY p.nombre ORDER BY valor DESC LIMIT 5`;

    // 2. TOP CLIENTES (MODIFICADO: Muestra EMAIL)
    const q2 = `
      SELECT c.email, c.ciudad, SUM(v.total) as valor 
      FROM dwh.fact_ventas v 
      JOIN dwh.dim_cliente c ON v.id_cliente_fk = c.id_cliente_sk 
      GROUP BY c.email, c.ciudad ORDER BY valor DESC LIMIT 5`;

    // 3. CIUDADES
    const q3 = `
      SELECT s.ciudad, SUM(v.total) as valor 
      FROM dwh.fact_ventas v 
      JOIN dwh.dim_sucursal s ON v.id_sucursal_fk = s.id_sucursal_sk 
      GROUP BY s.ciudad ORDER BY valor DESC LIMIT 5`;

    // 4. MÉTODOS DE PAGO
    const q4 = `
      SELECT metodo_pago, COUNT(*) as valor 
      FROM dwh.fact_ventas GROUP BY metodo_pago ORDER BY valor DESC`;

    // 5. SOCIAL ENGAGEMENT
    const q5 = `
      SELECT d.plataforma, SUM(f.likes + f.shares + f.comentarios) as valor 
      FROM dwh.fact_redes_sociales f 
      JOIN dwh.dim_red_social d ON f.id_red_social_fk = d.id_red_social_sk 
      GROUP BY d.plataforma ORDER BY valor DESC`;

    // 6. SENTIMIENTO
    const q6 = `
      SELECT sentimiento, COUNT(*) as valor 
      FROM dwh.fact_redes_sociales GROUP BY sentimiento`;

    // 7. TENDENCIA MENSUAL (2024)
    const q7 = `
      SELECT t.mes_nombre, SUM(v.total) as valor
      FROM dwh.fact_ventas v
      JOIN dwh.dim_tiempo t ON v.id_tiempo_fk = t.id_tiempo
      WHERE t.anio = 2024
      GROUP BY t.mes_nombre, t.mes
      ORDER BY t.mes ASC`;

    // 8. DÍA MÁS ACTIVO
    const q8 = `
      SELECT t.dia_semana_nombre as dia, COUNT(*) as valor
      FROM dwh.fact_ventas v
      JOIN dwh.dim_tiempo t ON v.id_tiempo_fk = t.id_tiempo
      GROUP BY t.dia_semana_nombre, t.dia_semana
      ORDER BY t.dia_semana ASC`;

    // 9. VENTAS POR GÉNERO
    const q9 = `
      SELECT c.genero, COUNT(DISTINCT v.id_venta_nk) as valor
      FROM dwh.fact_ventas v
      JOIN dwh.dim_cliente c ON v.id_cliente_fk = c.id_cliente_sk
      GROUP BY c.genero`;

    // 10. IMPACTO DEL CLIMA
    const q10 = `
          SELECT c.segmento_edad, SUM(v.total) as valor
          FROM dwh.fact_ventas v
          JOIN dwh.dim_cliente c ON v.id_cliente_fk = c.id_cliente_sk
          WHERE c.segmento_edad IS NOT NULL
          GROUP BY c.segmento_edad
          ORDER BY valor DESC
        `;

    // 11. RANGO DE PRECIOS
    const q11 = `
      SELECT p.rango_precio, SUM(v.total) as valor
      FROM dwh.fact_ventas v
      JOIN dwh.dim_producto p ON v.id_producto_fk = p.id_producto_sk
      GROUP BY p.rango_precio
      ORDER BY valor DESC`;

    // EJECUCIÓN (Usamos setTimeout para dar fluidez a la UI)
    setTimeout(() => {
      // Tanda 1
      this.dashboardService
        .getCustomSQL(q1)
        .subscribe((r) => (this.topProductos = this.calcPercent(r.filas)));
      this.dashboardService.getCustomSQL(q2).subscribe((r) => (this.topClientes = r.filas)); // Sin % porque es lista simple
      this.dashboardService
        .getCustomSQL(q3)
        .subscribe((r) => (this.ventasPorCiudad = this.calcPercent(r.filas)));
      this.dashboardService
        .getCustomSQL(q4)
        .subscribe((r) => (this.metodosPago = this.calcPercent(r.filas)));
      this.dashboardService
        .getCustomSQL(q5)
        .subscribe((r) => (this.socialEngagement = this.calcPercent(r.filas)));
      this.dashboardService.getCustomSQL(q6).subscribe((r) => (this.socialSentimiento = r.filas));

      // Tanda 2
      this.dashboardService
        .getCustomSQL(q7)
        .subscribe((r) => (this.ventasMensuales = this.calcPercent(r.filas)));
      this.dashboardService
        .getCustomSQL(q8)
        .subscribe((r) => (this.ventasDiaSemana = this.calcPercent(r.filas)));
      this.dashboardService
        .getCustomSQL(q9)
        .subscribe((r) => (this.ventasGenero = this.calcPercent(r.filas)));
      this.dashboardService
        .getCustomSQL(q10)
        .subscribe((r) => (this.ventasSegmentoEdad = this.calcPercent(r.filas)));
      this.dashboardService.getCustomSQL(q11).subscribe((r) => {
        this.ventasRangoPrecio = this.calcPercent(r.filas);
        // Al terminar la última, quitamos el spinner
        this.cargandoAvanzado = false;
      });
    }, 500);
  }

  // Ayuda para calcular el ancho de las barras de progreso (%)
  calcPercent(data: any[]) {
    if (!data || data.length === 0) return [];
    // Convertimos a Number para evitar errores si viene como string
    const max = Math.max(...data.map((d) => Number(d.valor)));
    return data.map((d) => ({ ...d, percent: (Number(d.valor) / max) * 100 }));
  }
}
