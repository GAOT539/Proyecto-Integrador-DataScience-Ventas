import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
// Importamos el nuevo componente (fíjate si se llama ClientesComponent en el archivo generado)
import { ClientesComponent } from './pages/clientes/clientes'; 

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'clientes', component: ClientesComponent }, // <--- NUEVA RUTA
    { path: '**', redirectTo: '' }
];