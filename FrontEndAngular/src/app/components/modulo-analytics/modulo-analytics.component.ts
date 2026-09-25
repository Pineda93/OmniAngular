import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modulo-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container fade-in">
      <div class="analytics-header">
        <h2>📈 Dashboard Analytics & KPI Ejecutivos</h2>
        <p class="text-muted">Proyección de impacto financiero, control FEFO y cobertura nacional.</p>
      </div>

      <div class="kpi-grid">
        <div class="card kpi-card">
          <span class="kpi-title">Valor Total del Inventario</span>
          <span class="kpi-value">Q 1,250,000.00</span>
          <span class="kpi-subtitle">Monitoreado en Bodegas y Tránsito</span>
        </div>

        <div class="card kpi-card kpi-warning">
          <span class="kpi-title">Valor en Riesgo (&lt; 90 días)</span>
          <span class="kpi-value text-orange">Q 185,400.00</span>
          <span class="kpi-subtitle">Lotes prioritarios para salida FEFO</span>
        </div>

        <div class="card kpi-card kpi-success">
          <span class="kpi-title">Ahorro Proyectado FEFO</span>
          <span class="kpi-value text-success">Q 157,590.00</span>
          <span class="kpi-subtitle">Pérdidas reducidas este mes</span>
        </div>

        <div class="card kpi-card alerta">
          <span class="kpi-title">Inventario Inmovilizado</span>
          <span class="kpi-value text-danger">Q 21,600.00</span>
          <span class="kpi-subtitle">Lotes bajo Alerta Sanitaria (DRCPFA)</span>
        </div>
      </div>

      <div class="charts-grid">
        <div class="card chart-card">
          <div class="chart-header">
            <h3>📊 Cobertura Institucional (% Unidades)</h3>
            <span class="badge">Nacional</span>
          </div>
          <p class="chart-desc">Distribución porcentual por sector receptor en Guatemala.</p>

          <div class="bar-chart">
            <div class="bar-row">
              <div class="bar-info"><span>IGSS</span> <strong>45%</strong></div>
              <div class="bar-track">
                <div class="bar-fill bg-primary" style="width: 45%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-info"><span>Hospitales Públicos (MSPAS)</span> <strong>35%</strong></div>
              <div class="bar-track">
                <div class="bar-fill bg-success" style="width: 35%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-info"><span>Farmacias Privadas</span> <strong>20%</strong></div>
              <div class="bar-track">
                <div class="bar-fill bg-orange" style="width: 20%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="chart-header">
            <h3>⚡ Índice de Eficiencia Logística FEFO</h3>
            <span class="badge">Algoritmo Activo</span>
          </div>
          <p class="chart-desc">Cumplimiento estricto de expiración para evitar desperdicio.</p>

          <div class="gauge-box">
            <div class="gauge-value">98.4%</div>
            <p class="gauge-label">Cumplimiento FEFO Activo</p>
            <div class="gauge-progress">
              <div class="gauge-fill" style="width: 98.4%"></div>
            </div>
            <small class="text-muted">1.6% Bloqueos preventivos automáticos antes del despacho.</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .analytics-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .analytics-header h2 { color: var(--text-main); font-size: 1.3rem; margin-bottom: 0.2rem; }
    .text-muted { color: var(--text-muted); font-size: 0.85rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; }
    .kpi-card { display: flex; flex-direction: column; gap: 0.3rem; border-left: 4px solid var(--primary); }
    .kpi-card.kpi-warning { border-left-color: #c2760c; background-color: rgba(194, 118, 12, 0.04); }
    .kpi-card.kpi-success { border-left-color: var(--success); background-color: var(--success-bg); }
    .kpi-title { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
    .kpi-subtitle { font-size: 0.75rem; color: var(--text-muted); }
    .text-orange { color: #c2760c; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 850px) { .charts-grid { grid-template-columns: 1fr; } }
    .chart-card { display: flex; flex-direction: column; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
    .chart-header h3 { font-size: 1.05rem; color: var(--text-main); }
    .chart-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .bar-chart { display: flex; flex-direction: column; gap: 1.2rem; }
    .bar-row { display: flex; flex-direction: column; gap: 0.4rem; }
    .bar-info { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-main); font-weight: 500; }
    .bar-track { background: var(--bg-color); border: 1px solid var(--border); height: 12px; border-radius: var(--radius); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: var(--radius); transition: width 0.6s ease; }
    .bg-primary { background-color: var(--primary); }
    .bg-success { background-color: var(--success); }
    .bg-orange { background-color: #c2760c; }
    .gauge-box { text-align: center; padding: 1rem 0; }
    .gauge-value { font-size: 3rem; font-weight: 800; color: var(--primary); }
    .gauge-label { font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-top: 0.2rem; }
    .gauge-progress { background: var(--bg-color); border: 1px solid var(--border); height: 10px; border-radius: var(--radius); margin: 1rem 0 0.8rem 0; overflow: hidden; }
    .gauge-fill { background: var(--primary); height: 100%; }
  `]
})
export class ModuloAnalyticsComponent {
  @HostBinding('attr.data-theme') theme = 'analytics';
}