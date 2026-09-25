import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-ingreso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="ingreso-container fade-in" data-theme="ingreso">
      <div class="card main-card">
        
        <!-- Cabecera adaptada al esquema del módulo usando var(--primary) -->
        <div class="header-banner">
          <div class="header-icon">
            💊
          </div>
          <div class="header-text">
            <h2>Módulo de Ingreso</h2>
            <p>Registro y Trazabilidad de Lotes de Medicamentos (Público / Privado)</p>
          </div>
        </div>

        <div class="card-body">
          
          <!-- Mensajes de Alerta / Éxito -->
          @if (omniService.mensajeExito()) {
            <div class="alert-box success-box">
              <span>✅ {{ omniService.mensajeExito() }}</span>
              <button type="button" class="close-btn" (click)="omniService.limpiarMensajes()">×</button>
            </div>
          }

          @if (omniService.mensajeError()) {
            <div class="alert-box danger-box">
              <span>⚠️ {{ omniService.mensajeError() }}</span>
              <button type="button" class="close-btn" (click)="omniService.limpiarMensajes()">×</button>
            </div>
          }

          <!-- Formulario de Ingreso -->
          <form [formGroup]="ingresoForm" (ngSubmit)="registrarLote()">
            <div class="form-grid">
              
              <!-- Nombre del Medicamento -->
              <div class="field-group span-6">
                <label class="form-label">Nombre del Medicamento / Presentación</label>
                <input type="text" class="input-control" formControlName="nombre" placeholder="Ej. Ibuprofena 600mg (Tabletas)">
              </div>

              <!-- Registro Sanitario -->
              <div class="field-group span-6">
                <label class="form-label">Registro Sanitario (DRCPFA)</label>
                <input type="text" class="input-control" formControlName="registroSanitario" placeholder="Ej. PF-12345-2026">
              </div>

              <!-- Lote -->
              <div class="field-group span-4">
                <label class="form-label">Número de Lote</label>
                <input type="text" class="input-control" formControlName="lote" placeholder="Ej. LOTE-X99">
              </div>

              <!-- Fecha de Vencimiento -->
              <div class="field-group span-4">
                <label class="form-label">Fecha de Vencimiento</label>
                <input type="date" class="input-control" formControlName="fechaVencimiento">
              </div>

              <!-- Cantidad -->
              <div class="field-group span-4">
                <label class="form-label">Cantidad de Unidades</label>
                <input type="number" class="input-control" formControlName="cantidad" min="1">
              </div>

              <!-- Precio Unitario -->
              <div class="field-group span-4">
                <label class="form-label">Precio Unitario (Q)</label>
                <input type="number" step="0.01" class="input-control" formControlName="precioUnitario" min="0.01">
              </div>

              <!-- Temperatura / Cadena de Frío -->
              <div class="field-group span-4">
                <label class="form-label">Condición / Temperatura</label>
                <input type="text" class="input-control" formControlName="temperatura" placeholder="Ej. 2°C - 8°C (Sensible)">
              </div>

              <!-- Institución Destino -->
              <div class="field-group span-4">
                <label class="form-label">Institución Destino</label>
                <select class="input-control" formControlName="destino">
                  @for (dest of institucionesDestino; track dest) {
                    <option [value]="dest">{{ dest }}</option>
                  }
                </select>
              </div>

              <!-- Departamento Destino -->
              <div class="field-group span-12">
                <label class="form-label">Departamento Destino</label>
                <select class="input-control" formControlName="departamentoDestino">
                  @for (dept of departamentosGuatemala; track dept) {
                    <option [value]="dept">{{ dept }}</option>
                  }
                </select>
              </div>

            </div>

            <!-- Botón de Acción -->
            <div class="form-actions">
              <button type="submit" class="submit-btn" [disabled]="ingresoForm.invalid">
                ➕ Registrar Lote en el Sistema
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .ingreso-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .main-card {
      padding: 0;
      overflow: hidden;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      background: var(--surface);
    }

    .header-banner {
      background-color: var(--primary);
      color: #ffffff;
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: background-color 0.3s ease;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }

    .header-text p {
      margin: 0.25rem 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
      color: #ffffff;
    }

    .card-body {
      padding: 2rem;
    }

    /* Sistema de Grilla CSS flexible estilo 12 columnas */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.25rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .span-12 { grid-column: span 12; }
    .span-6  { grid-column: span 6; }
    .span-4  { grid-column: span 4; }

    @media (max-width: 768px) {
      .span-6, .span-4 { grid-column: span 12; }
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }

    /* Estilos explícitos para inputs y selects dentro del componente */
    .input-control {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background-color: var(--surface);
      color: var(--text-main);
      font-size: 0.9rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--tint);
    }

    .form-actions {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
    }

    /* Botón de envío adaptado al color dinámico del tema */
    .submit-btn {
      background-color: var(--primary);
      color: #ffffff;
      padding: 0.75rem 1.75rem;
      font-size: 1rem;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.15s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Cajas de alerta */
    .alert-box {
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }

    .success-box {
      background-color: var(--success-bg);
      color: var(--success);
      border: 1px solid var(--success);
    }

    .danger-box {
      background-color: var(--danger-bg);
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: inherit;
    }
  `]
})
export class IngresoComponent {
  private fb = inject(FormBuilder);
  public omniService = inject(OmniService);

  public ingresoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    registroSanitario: ['', [Validators.required]],
    lote: ['', [Validators.required]],
    fechaVencimiento: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0.01, [Validators.required, Validators.min(0.01)]],
    temperatura: ['15°C - 25°C', [Validators.required]],
    destino: ['IGSS', [Validators.required]],
    departamentoDestino: ['Guatemala', [Validators.required]]
  });

  public departamentosGuatemala: string[] = [
    'Guatemala', 'Quetzaltenango', 'Escuintla', 'Alta Verapaz', 
    'San Marcos', 'Huehuetenango', 'Chimaltenango', 'Petén'
  ];

  public institucionesDestino: string[] = [
    'IGSS', 'Hospital Público', 'Farmacia Privada'
  ];

  public registrarLote() {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    this.omniService.agregarLote(this.ingresoForm.value);

    this.ingresoForm.reset({
      cantidad: 1,
      precioUnitario: 0.01,
      temperatura: '15°C - 25°C',
      destino: 'IGSS',
      departamentoDestino: 'Guatemala'
    });
  }
}