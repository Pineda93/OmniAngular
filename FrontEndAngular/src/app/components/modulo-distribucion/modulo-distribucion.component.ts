import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-modulo-distribucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="distribucion-container">
      <header class="module-header">
        <h1>Distribución de Lotes</h1>
        <p>Fraccionamiento y asignación de medicamentos a instituciones</p>
      </header>

      <!-- Alertas -->
      <div class="alert alert-success" *ngIf="omni.mensajeExito() as exito">
        <span>{{ exito }}</span>
        <button class="btn-close" (click)="omni.limpiarMensajes()">Cerrar</button>
      </div>
      <div class="alert alert-danger" *ngIf="omni.mensajeError() as error">
        <span>{{ error }}</span>
        <button class="btn-close" (click)="omni.limpiarMensajes()">Cerrar</button>
      </div>

      <!-- Formulario de Distribución -->
      <section class="card form-section">
        <h2 class="section-title">Nueva Distribución</h2>
        
        <div class="form-group mb">
          <label>Seleccionar Medicamento (Stock Disponible)</label>
          <select class="form-control" [(ngModel)]="medicamentoSeleccionadoId" (change)="onMedicamentoChange()">
            <option [ngValue]="null">-- Seleccione un medicamento --</option>
            <option *ngFor="let med of medicamentosDisponibles" [ngValue]="med.id">
              {{ med.nombre }} (Lote: {{ med.lote }}) - Stock: {{ med.cantidad }}
            </option>
          </select>
        </div>

        <div *ngIf="medicamentoSeleccionadoId !== null" class="asignaciones-container">
          <div class="stock-info">
            <span>Stock Inicial: <strong>{{ stockInicial }}</strong></span>
            <span>Por Asignar: <strong>{{ totalAsignado }}</strong></span>
            <span>Stock Restante: <strong [class.text-danger]="stockRestante < 0">{{ stockRestante }}</strong></span>
          </div>

          <div class="asignacion-row" *ngFor="let asig of asignaciones; let i = index">
            <div class="form-group">
              <label>Cantidad</label>
              <input type="number" class="form-control" [(ngModel)]="asig.cantidad" min="1" (ngModelChange)="calcularTotales()">
            </div>
            
            <div class="form-group">
              <label>Destino (Institución)</label>
              <select class="form-control" [(ngModel)]="asig.destino">
                <option *ngFor="let inst of instituciones" [value]="inst">{{ inst }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Departamento</label>
              <select class="form-control" [(ngModel)]="asig.departamento">
                <option *ngFor="let dep of departamentos" [value]="dep">{{ dep }}</option>
              </select>
            </div>

            <button class="btn btn-icon btn-danger" (click)="removerFila(i)" [disabled]="asignaciones.length === 1" title="Eliminar fila">Eliminar</button>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-secondary" (click)="agregarFila()">+ Agregar Fila</button>
            <button class="btn btn-primary" (click)="procesarDistribucion()" [disabled]="!esValido()">Procesar Distribución</button>
          </div>
        </div>
      </section>

      <!-- Tabla de Distribuciones -->
      <section class="card table-section">
        <h2 class="section-title">Historial de Distribuciones</h2>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Lote Origen</th>
                <th>Cantidad</th>
                <th>Destino Institución</th>
                <th>Departamento</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dist of omni.distribuciones()">
                <td>{{ dist.nombreMedicamento }}</td>
                <td>{{ dist.loteOrigen }}</td>
                <td>{{ dist.cantidadAsignada }}</td>
                <td>{{ dist.destinoInstitucion }}</td>
                <td>{{ dist.departamentoDestino }}</td>
                <td>{{ dist.fechaDistribucion | date:'shortDate' }}</td>
                <td>
                  <span class="badge" [ngClass]="getBadgeClass(dist.estado)">{{ dist.estado }}</span>
                </td>
                <td>
                  <select class="form-control status-select" [ngModel]="dist.estado" (ngModelChange)="cambiarEstado(dist.id, $event)">
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Tránsito">En Tránsito</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="omni.distribuciones().length === 0">
                <td colspan="8" class="text-center text-muted p-4">No hay distribuciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .distribucion-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .module-header {
      margin-bottom: 2rem;
    }

    .module-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0 0 0.5rem 0;
    }

    .module-header p {
      color: var(--text-muted);
      margin: 0;
      font-size: 1rem;
    }

    /* Cards */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 0;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }

    /* Alerts */
    .alert {
      padding: 1rem 1.25rem;
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid;
    }

    .alert-success {
      background-color: var(--success-bg, #f0fdf4);
      color: var(--success, #166534);
      border-left-color: var(--success, #166534);
    }

    .alert-danger {
      background-color: var(--danger-bg, #fef2f2);
      color: var(--danger, #991b1b);
      border-left-color: var(--danger, #991b1b);
    }

    /* Forms */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mb {
      margin-bottom: 1.5rem;
    }

    label {
      font-weight: 500;
      color: var(--text-main);
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.95rem;
      background: var(--surface);
      color: var(--text-main);
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Form Rows */
    .asignaciones-container {
      margin-top: 1.5rem;
    }

    .stock-info {
      display: flex;
      gap: 2rem;
      background: var(--tint, #f8fafc);
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      border: 1px solid var(--border);
      font-size: 0.95rem;
    }

    .text-danger {
      color: var(--danger);
    }

    .asignacion-row {
      display: grid;
      grid-template-columns: 1fr 2fr 2fr auto;
      gap: 1rem;
      align-items: end;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border);
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }

    /* Buttons */
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius);
      font-weight: 500;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background-color 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
    }

    .btn-primary:not(:disabled):hover {
      background-color: var(--primary-hover);
    }

    .btn-secondary {
      background-color: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-main);
    }

    .btn-secondary:not(:disabled):hover {
      background-color: var(--tint, #f1f5f9);
    }

    .btn-danger {
      background-color: var(--danger-bg, #fee2e2);
      color: var(--danger, #991b1b);
      border: 1px solid var(--danger, #991b1b);
    }

    .btn-close {
      background: none;
      border: 1px solid currentColor;
      color: inherit;
      border-radius: var(--radius);
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      opacity: 0.8;
    }
    
    .btn-close:hover {
      opacity: 1;
    }

    .btn-icon {
      padding: 0.5rem;
    }

    /* Tables */
    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .data-table th, .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    .data-table th {
      font-weight: 600;
      color: var(--text-muted);
      background-color: var(--tint, #f8fafc);
    }

    .text-center { text-align: center; }
    .p-4 { padding: 1.5rem; }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge-pending {
      background-color: var(--tint, #fef3c7);
      color: #92400e;
    }

    .badge-transit {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-delivered {
      background-color: var(--success-bg, #dcfce7);
      color: var(--success, #166534);
    }

    .status-select {
      padding: 0.25rem 0.5rem;
      font-size: 0.85rem;
    }
  `]
})
export class ModuloDistribucionComponent implements OnInit {
  omni = inject(OmniService);

  medicamentosDisponibles: any[] = [];
  medicamentoSeleccionadoId: number | null = null;
  stockInicial: number = 0;
  totalAsignado: number = 0;
  stockRestante: number = 0;

  departamentos = ['Guatemala', 'Quetzaltenango', 'Escuintla', 'Alta Verapaz', 'San Marcos', 'Huehuetenango', 'Chimaltenango', 'Petén'];
  instituciones = ['IGSS', 'Hospital Público', 'Farmacia Privada'];

  asignaciones: {cantidad: number, destino: string, departamento: string}[] = [];

  ngOnInit() {
    this.cargarMedicamentos();
    this.resetForm();
  }

  cargarMedicamentos() {
    this.medicamentosDisponibles = this.omni.getMedicamentosDisponibles();
  }

  onMedicamentoChange() {
    if (this.medicamentoSeleccionadoId) {
      const med = this.medicamentosDisponibles.find(m => m.id === this.medicamentoSeleccionadoId);
      this.stockInicial = med ? med.cantidad : 0;
      this.resetForm();
    } else {
      this.stockInicial = 0;
      this.asignaciones = [];
    }
    this.calcularTotales();
  }

  resetForm() {
    this.asignaciones = [{cantidad: 0, destino: 'IGSS', departamento: 'Guatemala'}];
    this.calcularTotales();
  }

  agregarFila() {
    this.asignaciones.push({cantidad: 0, destino: 'IGSS', departamento: 'Guatemala'});
  }

  removerFila(index: number) {
    if (this.asignaciones.length > 1) {
      this.asignaciones.splice(index, 1);
      this.calcularTotales();
    }
  }

  calcularTotales() {
    this.totalAsignado = this.asignaciones.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
    this.stockRestante = this.stockInicial - this.totalAsignado;
  }

  esValido(): boolean {
    return this.medicamentoSeleccionadoId !== null && 
           this.totalAsignado > 0 && 
           this.stockRestante >= 0 &&
           this.asignaciones.every(a => a.cantidad > 0);
  }

  procesarDistribucion() {
    if (!this.esValido() || !this.medicamentoSeleccionadoId) return;

    this.omni.dividirLote(this.medicamentoSeleccionadoId, this.asignaciones as any);
    
    this.medicamentoSeleccionadoId = null;
    this.stockInicial = 0;
    this.asignaciones = [];
    this.cargarMedicamentos();
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    this.omni.actualizarEstadoDistribucion(id, nuevoEstado as 'Pendiente' | 'En Tránsito' | 'Entregado');
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge-pending';
      case 'En Tránsito': return 'badge-transit';
      case 'Entregado': return 'badge-delivered';
      default: return '';
    }
  }
}
