import { Component, inject } from '@angular/core';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-modulo-farmacovigilancia',
  standalone: true,
  template: `
    <div class="header-farma">
      <h2>Panel de Farmacovigilancia (DRCPFA)</h2>
      <div class="stats-badge">Alertas Activas: {{ omni.alertasActivas() }}</div>
    </div>

  
    @if (omni.mensajeError()) {
      <div class="alert-box error fade-in">{{ omni.mensajeError() }}</div>
    }
    @if (omni.mensajeExito()) {
      <div class="alert-box success fade-in">{{ omni.mensajeExito() }}</div>
    }

    <div class="grid-cards">
      @for (item of omni.inventarioFEFO(); track item.id) {
        <div class="card fade-in" [class.alerta]="item.estado === 'Alerta Sanitaria'">
          <div class="card-header">
            <h3>{{ item.nombre }}</h3>
            <span class="badge" [class.badge-alerta]="item.estado === 'Alerta Sanitaria'">{{ item.estado }}</span>
          </div>
          
          <div class="card-body">
            <p><strong>Lote:</strong> {{ item.lote }}</p>
            <p><strong>Registro:</strong> {{ item.registroSanitario }}</p>
            <p><strong>Destino:</strong> {{ item.destino }} ({{ item.departamentoDestino }})</p>
            
            <hr class="divider">

            @if (item.estado === 'Alerta Sanitaria') {
              <p class="motivo-texto"><strong>Motivo:</strong> {{ item.motivoAlerta }}</p>
              <button class="btn btn-success" (click)="resolver(item.id)">Resolver y Liberar Lote</button>
            } @else if (item.estado === 'Disponible') {
              <div class="action-box">
                <input type="text" class="input-control" #motivo placeholder="Especifique motivo de la alerta..." />
                <button class="btn btn-danger" (click)="alertar(item.lote, motivo.value); motivo.value=''">
                  Inmovilizar Lote
                </button>
              </div>
            } @else {
              <p class="text-muted">Lote ya despachado. Monitoreo pasivo.</p>
            }
          </div>
        </div>
      } @empty {
        <p>No hay medicamentos registrados en el sistema.</p>
      }
    </div>
  `,
  styles: [`
    .header-farma { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .stats-badge { background: var(--danger); color: white; padding: 0.5rem 1rem; border-radius: var(--radius); font-weight: bold; box-shadow: var(--shadow); }
    .alert-box { padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; font-weight: 500; }
    .alert-box.error { background: var(--danger); color: white; }
    .alert-box.success { background: var(--success); color: white; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .card-header h3 { font-size: 1.1rem; color: var(--primary); margin: 0; }
    .card-body p { margin-bottom: 0.5rem; font-size: 0.9rem; }
    .divider { border: 0; border-top: 1px solid var(--border); margin: 1rem 0; }
    .motivo-texto { color: var(--danger); font-weight: 500; margin-bottom: 1rem !important; }
    .action-box { display: flex; flex-direction: column; gap: 0.5rem; }
  `]
})
export class ModuloFarmacovigilanciaComponent {
  omni = inject(OmniService);

  alertar(lote: string, motivo: string) {
    if (!motivo.trim()) return; 
    this.omni.emitirAlertaSanitaria(lote, motivo);
    setTimeout(() => this.omni.limpiarMensajes(), 5000); 
  }

  resolver(id: number) {
    this.omni.resolverAlerta(id);
    setTimeout(() => this.omni.limpiarMensajes(), 5000);
  }
}