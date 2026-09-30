import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-modulo-alertas-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="alertas-container fade-in">
      <header class="alertas-header">
        <div class="title-section">
          <h1>Alertas de Stock</h1>
          <p>Monitoreo de inventario en instituciones y hospitales</p>
        </div>
        <div class="header-badges">
          <span class="badge badge-auto">Detecciones: {{ omni.alertasAutomaticas().length }}</span>
          <span class="badge badge-manual">Reportes: {{ omni.alertasStockPendientes() }}</span>
        </div>
      </header>

      <!-- Mensajes -->
      @if (omni.mensajeExito()) {
        <div class="message success">
          <span>{{ omni.mensajeExito() }}</span>
          <button class="close-btn" (click)="omni.limpiarMensajes()">&times;</button>
        </div>
      }
      @if (omni.mensajeError()) {
        <div class="message error">
          <span>{{ omni.mensajeError() }}</span>
          <button class="close-btn" (click)="omni.limpiarMensajes()">&times;</button>
        </div>
      }

      <!-- SECCIÓN 1: ALERTAS AUTOMÁTICAS -->
      <section class="section-card">
        <div class="section-header">
          <h2>Detección Automática de Stock Bajo</h2>
          <span class="section-desc">El sistema analiza el inventario y detecta medicamentos con niveles bajos</span>
        </div>

        <div class="umbrales-info">
          <span class="umbral critica">Crítico: &le; 200 uds.</span>
          <span class="umbral alta">Alto: &le; 500 uds.</span>
          <span class="umbral media">Moderado: &le; 1,000 uds.</span>
        </div>

        @if (omni.alertasAutomaticas().length > 0) {
          <div class="auto-alerts-grid">
            @for (alerta of omni.alertasAutomaticas(); track alerta.lote) {
              <div class="auto-alert-card" [class.critica]="alerta.prioridad === 'Crítica'" [class.alta]="alerta.prioridad === 'Alta'" [class.media]="alerta.prioridad === 'Media'">
                <div class="auto-alert-top">
                  <span class="prioridad-tag" [class.tag-critica]="alerta.prioridad === 'Crítica'" [class.tag-alta]="alerta.prioridad === 'Alta'" [class.tag-media]="alerta.prioridad === 'Media'">
                    {{ alerta.prioridad }}
                  </span>
                  <span class="auto-alert-stock">{{ alerta.cantidad }} uds.</span>
                </div>
                <h3>{{ alerta.medicamento }}</h3>
                <div class="auto-alert-meta">
                  <span>Lote: {{ alerta.lote }}</span>
                  <span>{{ alerta.destino }} &middot; {{ alerta.departamento }}</span>
                </div>
                <div class="stock-bar-container">
                  <div class="stock-bar" 
                       [style.width.%]="getAutoBarWidth(alerta.cantidad)"
                       [class.bar-critica]="alerta.prioridad === 'Crítica'"
                       [class.bar-alta]="alerta.prioridad === 'Alta'"
                       [class.bar-media]="alerta.prioridad === 'Media'">
                  </div>
                </div>
                <p class="auto-alert-msg">{{ alerta.mensaje }}</p>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <p>Todos los medicamentos tienen niveles de stock adecuados.</p>
          </div>
        }
      </section>

      <!-- SECCIÓN 2: REPORTES MANUALES DE HOSPITALES -->
      <section class="section-card">
        <div class="section-header">
          <h2>Reportes de Instituciones</h2>
          <span class="section-desc">Alertas reportadas manualmente por hospitales e instituciones</span>
        </div>

        <div class="manual-layout">
          <!-- Formulario (colapsable) -->
          <div class="form-toggle">
            <button class="btn-toggle" (click)="mostrarForm = !mostrarForm">
              {{ mostrarForm ? 'Ocultar formulario' : 'Nuevo reporte manual' }}
            </button>
          </div>

          @if (mostrarForm) {
            <form [formGroup]="alertaForm" (ngSubmit)="onSubmit()" class="alerta-form fade-in">
              <div class="form-grid">
                <div class="form-group">
                  <label>Institución</label>
                  <input type="text" formControlName="institucion" placeholder="Ej. Hospital Roosevelt">
                </div>

                <div class="form-group">
                  <label>Tipo de Institución</label>
                  <select formControlName="tipoInstitucion">
                    <option value="" disabled>Seleccione...</option>
                    <option value="IGSS">IGSS</option>
                    <option value="Hospital Público">Hospital Público</option>
                    <option value="Farmacia Privada">Farmacia Privada</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Departamento</label>
                  <select formControlName="departamento">
                    <option value="" disabled>Seleccione...</option>
                    @for (dep of departamentos; track dep) {
                      <option [value]="dep">{{ dep }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label>Medicamento Necesitado</label>
                  <input type="text" formControlName="medicamentoSolicitado" placeholder="Ej. Paracetamol 500mg">
                </div>

                <div class="form-group">
                  <label>Stock Actual</label>
                  <input type="number" formControlName="cantidadActual" min="0">
                </div>

                <div class="form-group">
                  <label>Stock Mínimo Requerido</label>
                  <input type="number" formControlName="cantidadMinima" min="1">
                </div>

                <div class="form-group">
                  <label>Prioridad</label>
                  <select formControlName="prioridad">
                    <option value="" disabled>Seleccione...</option>
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                  </select>
                </div>

                <div class="form-group span-full">
                  <label>Notas (Opcional)</label>
                  <textarea formControlName="notas" rows="2" placeholder="Detalles adicionales..."></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="alertaForm.invalid">
                  Reportar Alerta
                </button>
              </div>
            </form>
          }

          <!-- Lista de reportes manuales -->
          @if (omni.alertasStock().length > 0) {
            <div class="manual-alerts-grid">
              @for (alerta of omni.alertasStock(); track alerta.id) {
                <div class="manual-alert-card" [class.border-critica]="alerta.prioridad === 'Crítica'" [class.border-alta]="alerta.prioridad === 'Alta'" [class.border-media]="alerta.prioridad === 'Media'">
                  <div class="manual-card-top">
                    <span class="estado-badge" [class.estado-pendiente]="alerta.estado === 'Pendiente'" [class.estado-proceso]="alerta.estado === 'En Proceso'" [class.estado-resuelta]="alerta.estado === 'Resuelta'">
                      {{ alerta.estado }}
                    </span>
                    <span class="prioridad-tag" [class.tag-critica]="alerta.prioridad === 'Crítica'" [class.tag-alta]="alerta.prioridad === 'Alta'" [class.tag-media]="alerta.prioridad === 'Media'">
                      {{ alerta.prioridad }}
                    </span>
                  </div>

                  <h3>{{ alerta.institucion }}</h3>
                  <p class="meta">{{ alerta.tipoInstitucion }} &middot; {{ alerta.departamento }}</p>
                  <p><strong>Medicamento:</strong> {{ alerta.medicamentoSolicitado }}</p>

                  <div class="stock-level">
                    <div class="stock-level-text">
                      <span>Stock: {{ alerta.cantidadActual }} / {{ alerta.cantidadMinima }}</span>
                    </div>
                    <div class="stock-bar-container">
                      <div class="stock-bar" 
                           [style.width.%]="getPorcentaje(alerta.cantidadActual, alerta.cantidadMinima)"
                           [class.bar-critica]="getPorcentaje(alerta.cantidadActual, alerta.cantidadMinima) < 25"
                           [class.bar-alta]="getPorcentaje(alerta.cantidadActual, alerta.cantidadMinima) >= 25 && getPorcentaje(alerta.cantidadActual, alerta.cantidadMinima) < 50"
                           [class.bar-media]="getPorcentaje(alerta.cantidadActual, alerta.cantidadMinima) >= 50">
                      </div>
                    </div>
                  </div>

                  @if (alerta.notas) {
                    <p class="notas"><strong>Notas:</strong> {{ alerta.notas }}</p>
                  }

                  <div class="card-actions">
                    <span class="fecha">{{ alerta.fechaReporte }}</span>
                    @if (alerta.estado === 'Pendiente') {
                      <button class="btn btn-atender" (click)="omni.atenderAlertaStock(alerta.id)">Atender</button>
                    } @else if (alerta.estado === 'En Proceso') {
                      <button class="btn btn-resolver" (click)="omni.resolverAlertaStock(alerta.id)">Resolver</button>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>No hay reportes manuales registrados.</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .alertas-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .alertas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-section h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .title-section p {
      margin: 0.25rem 0 0 0;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .header-badges {
      display: flex;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-auto {
      background: var(--danger-bg);
      color: var(--danger);
    }

    .badge-manual {
      background: var(--tint);
      color: var(--primary);
    }

    /* Messages */
    .message {
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }

    .message.success { background: var(--success-bg); color: var(--success); border: 1px solid var(--success); }
    .message.error { background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger); }

    .close-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.3rem;
      line-height: 1;
    }

    /* Sections */
    .section-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow);
    }

    .section-header {
      margin-bottom: 1.25rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .section-desc {
      display: block;
      margin-top: 0.2rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Umbrales info */
    .umbrales-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .umbral {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.6rem;
      border-radius: 999px;
    }

    .umbral.critica { background: var(--danger-bg); color: var(--danger); }
    .umbral.alta { background: #fff7ed; color: #c2760c; }
    .umbral.media { background: var(--tint); color: var(--primary); }

    /* Auto alerts grid */
    .auto-alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .auto-alert-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s ease;
    }

    .auto-alert-card:hover { transform: translateY(-2px); }

    .auto-alert-card.critica { border-left: 4px solid var(--danger); }
    .auto-alert-card.alta { border-left: 4px solid #c2760c; }
    .auto-alert-card.media { border-left: 4px solid var(--primary); }

    .auto-alert-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .auto-alert-stock {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .auto-alert-card h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .auto-alert-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .auto-alert-msg {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Prioridad tags */
    .prioridad-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .tag-critica { background: var(--danger-bg); color: var(--danger); }
    .tag-alta { background: #fff7ed; color: #c2760c; }
    .tag-media { background: var(--tint); color: var(--primary); }

    /* Stock bar */
    .stock-bar-container {
      height: 5px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }

    .stock-bar {
      height: 100%;
      transition: width 0.4s ease;
      border-radius: 3px;
    }

    .bar-critica { background: var(--danger); }
    .bar-alta { background: #c2760c; }
    .bar-media { background: var(--primary); }

    /* Form toggle */
    .form-toggle {
      margin-bottom: 1rem;
    }

    .btn-toggle {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      color: var(--primary);
      font-weight: 500;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background 0.15s;
    }

    .btn-toggle:hover {
      background: var(--tint);
    }

    /* Form */
    .alerta-form {
      background: var(--bg-color, #f8faf9);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .span-full { grid-column: 1 / -1; }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    input, select, textarea {
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--tint);
    }

    .form-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Buttons */
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      transition: transform 0.15s, filter 0.15s;
    }

    .btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }

    .btn-atender { background: var(--tint); color: var(--primary); }
    .btn-resolver { background: var(--success-bg); color: var(--success); }

    /* Manual alerts grid */
    .manual-alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .manual-alert-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s;
    }

    .manual-alert-card:hover { transform: translateY(-2px); }

    .border-critica { border-left: 4px solid var(--danger); }
    .border-alta { border-left: 4px solid #c2760c; }
    .border-media { border-left: 4px solid var(--border); }

    .manual-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .estado-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }

    .estado-pendiente { background: var(--danger-bg); color: var(--danger); }
    .estado-proceso { background: var(--tint); color: var(--primary); }
    .estado-resuelta { background: var(--success-bg); color: var(--success); }

    .manual-alert-card h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
    }

    .meta {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .manual-alert-card p {
      margin: 0;
      font-size: 0.9rem;
    }

    .stock-level {
      margin-top: 0.25rem;
    }

    .stock-level-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.3rem;
    }

    .notas {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: rgba(0,0,0,0.02);
      padding: 0.4rem 0.5rem;
      border-radius: 4px;
    }

    .card-actions {
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .fecha {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      border: 1px dashed var(--border);
      border-radius: var(--radius);
    }

    .empty-state p { margin: 0; }
  `]
})
export class ModuloAlertasStockComponent {
  omni = inject(OmniService);
  private fb = inject(FormBuilder);

  mostrarForm = false;

  departamentos = [
    'Guatemala', 'Quetzaltenango', 'Escuintla', 'Alta Verapaz', 
    'San Marcos', 'Huehuetenango', 'Chimaltenango', 'Petén'
  ];

  alertaForm: FormGroup = this.fb.group({
    institucion: ['', Validators.required],
    tipoInstitucion: ['', Validators.required],
    departamento: ['', Validators.required],
    medicamentoSolicitado: ['', Validators.required],
    cantidadActual: [0, [Validators.required, Validators.min(0)]],
    cantidadMinima: [1, [Validators.required, Validators.min(1)]],
    prioridad: ['', Validators.required],
    notas: ['']
  });

  onSubmit() {
    if (this.alertaForm.valid) {
      this.omni.reportarAlertaStock(this.alertaForm.value);
      this.alertaForm.reset({
        cantidadActual: 0,
        cantidadMinima: 1,
        tipoInstitucion: '',
        departamento: '',
        prioridad: ''
      });
      this.mostrarForm = false;
    }
  }

  getPorcentaje(actual: number, minima: number): number {
    if (minima <= 0) return 100;
    return Math.min(Math.max((actual / minima) * 100, 0), 100);
  }

  // Para las alertas automáticas, calcula el ancho de la barra relativo al umbral máximo (1000)
  getAutoBarWidth(cantidad: number): number {
    return Math.min(Math.max((cantidad / 1000) * 100, 2), 100);
  }
}
