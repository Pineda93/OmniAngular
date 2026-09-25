import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OmniService } from '../../services/omni.service';

@Component({
  selector: 'app-modulo-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="inventory-panel">
      <header class="topbar">
        <div>
          <p class="eyebrow">Control de inventario</p>
          <h2>Inventario FEFO</h2>
        </div>
        <div class="pill">Trazabilidad activa</div>
      </header>

      @if (omni.mensajeError()) {
        <div class="alert error">{{ omni.mensajeError() }}</div>
      }

      @if (omni.mensajeExito()) {
        <div class="alert success">{{ omni.mensajeExito() }}</div>
      }

      <div class="stats-grid">
        <article class="stat-card accent-blue">
          <span>Total</span>
          <strong>{{ omni.totalRegistros() }}</strong>
          <small>lotes registrados</small>
        </article>
        <article class="stat-card accent-green">
          <span>Disponibles</span>
          <strong>{{ omni.disponibles() }}</strong>
          <small>listos para salida</small>
        </article>
        <article class="stat-card accent-red">
          <span>Alertas</span>
          <strong>{{ omni.alertasActivas() }}</strong>
          <small>con revisión sanitaria</small>
        </article>
      </div>

      <div class="toolbar">
        <label class="search-box">
          <span>Buscar</span>
          <input type="text" placeholder="Medicamento o lote..." [(ngModel)]="textoBusqueda" />
        </label>
      </div>

      <div class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Lote</th>
                <th>Vence</th>
                <th>Destino</th>
                <th>Cantidad</th>
                <th>Temp.</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (item of inventarioFiltrado; track item.id) {
                <tr>
                  <td>
                    <div class="med-name">{{ item.nombre }}</div>
                    <small>{{ item.registroSanitario }}</small>
                  </td>
                  <td>{{ item.lote }}</td>
                  <td>{{ item.fechaVencimiento }}</td>
                  <td>{{ item.departamentoDestino }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>{{ item.temperatura }}</td>
                  <td>
                    <span class="badge" [class.disponible]="item.estado === 'Disponible'"
                      [class.alerta]="item.estado === 'Alerta Sanitaria'"
                      [class.despachado]="item.estado === 'Despachado'">
                      {{ item.estado }}
                    </span>
                  </td>
                  <td>
                    @if (item.estado === 'Disponible') {
                      <button class="btn-primary" (click)="despachar(item)">Despachar</button>
                    } @else {
                      <span class="muted">Sin acción</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">No hay resultados para la búsqueda actual.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Chewy&display=swap');

    :host {
      display: block;
      width: 100%; font-family: 'Chewy', 'Comic Sans MS', 'Trebuchet MS', cursive;
      --inv-bg: #ffffff;
      --inv-panel: #ffffff;
      --inv-panel-2: #ffffff;
      --inv-card: #fdfdfc;
      --inv-ink: #2f3b37;
      --inv-muted: #5d6d66;
      --inv-main: #c2760c;
      --inv-main-dark: #8e5a10;
      --inv-accent: #0f9d78;
      --inv-accent-dark: #0c7d5f;
      --inv-line: #2f3b37;
      --inv-surface: #fffdf7;
      --inv-shadow: 0 8px 0 rgba(34, 42, 38, 0.9), 0 18px 26px rgba(32, 38, 36, 0.12);
    }

    .inventory-panel {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      position: relative;
      overflow: hidden;
      padding: 1rem 1rem 1.15rem;
      border-radius: 24px;
      border: 4px solid var(--inv-line);
      background: linear-gradient(180deg, var(--inv-panel-2), var(--inv-panel));
      box-shadow: var(--inv-shadow);
      font-family: 'Chewy', 'Comic Sans MS', 'Trebuchet MS', cursive;
    }

    .inventory-panel::before {
      content: "";
      position: absolute;
      inset: 8px;
      border: 3px solid rgba(47, 59, 55, 0.6);
      border-radius: 18px;
      pointer-events: none;
    }

    .topbar,
    .stats-grid,
    .toolbar,
    .table-card,
    .alert {
      position: relative;
      z-index: 1;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.15rem 0.1rem 0;
    }

    .eyebrow {
      margin: 0 0 0.2rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.72rem;
      color: var(--inv-muted);
      font-weight: 900;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    h2 {
      margin: 0;
      color: var(--inv-ink);
      font-size: clamp(1.7rem, 2vw, 2.3rem);
      letter-spacing: 0.04em;
      line-height: 1.1;
      font-family: 'Chewy', 'Comic Sans MS', cursive;
      text-shadow: 2px 2px 0 rgba(255,255,255,0.7), 4px 4px 0 rgba(194,118,12,0.15);
    }

    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.72rem 1rem;
      border-radius: 999px;
      border: 3px solid var(--inv-line);
      background: linear-gradient(180deg, #f5d370, #e7b44d);
      color: var(--inv-ink);
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
      box-shadow: inset 0 -4px 0 rgba(0,0,0,0.12), 0 4px 0 rgba(47, 59, 55, 0.8);
      white-space: nowrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.9rem;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      position: relative;
      overflow: hidden;
      padding: 0.95rem 1rem 1rem;
      border-radius: 18px;
      border: 4px solid var(--inv-line);
      background: linear-gradient(180deg, #f7f6f3, #eef5ee);
      box-shadow: 0 6px 0 rgba(47, 59, 55, 0.9);
    }

    .stat-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 7px;
      background: currentColor;
      box-shadow: 3px 0 0 rgba(255,255,255,0.4);
    }

    .stat-card span,
    .stat-card small {
      color: var(--inv-muted);
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    .stat-card small {
      display: block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .stat-card strong {
      color: var(--inv-ink);
      font-size: clamp(1.85rem, 2vw, 2.6rem);
      line-height: 1.1;
      font-weight: 900;
      font-family: 'Chewy', 'Comic Sans MS', cursive;
      text-shadow: 2px 2px 0 rgba(255,255,255,0.7);
    }

    .accent-blue { color: #2d7ae6; }
    .accent-green { color: var(--inv-accent); }
    .accent-red { color: #d85a5a; }

    .alert {
      margin: 0.05rem 0;
      padding: 0.8rem 0.9rem;
      border-radius: 12px;
      border: 3px solid var(--inv-line);
      font-weight: 800;
      letter-spacing: 0.02em;
      box-shadow: inset 0 -4px 0 rgba(0,0,0,0.08);
    }

    .alert.error {
      background: linear-gradient(180deg, #ffd5d5, #f8b2b2);
      color: #4f2020;
    }

    .alert.success {
      background: linear-gradient(180deg, #dffce8, #b9f0d0);
      color: #214b3f;
    }

    .toolbar {
      display: flex;
      justify-content: flex-start;
    }

    .search-box {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      width: min(100%, 380px);
      font-size: 0.7rem;
      color: var(--inv-muted);
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    .search-box input {
      width: 100%;
      padding: 0.8rem 0.9rem;
      border-radius: 12px;
      border: 4px solid var(--inv-line);
      background: linear-gradient(180deg, #fdfbf8, #c8f0e5);
      color: var(--inv-ink);
      font-weight: 700;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
      outline: none;
      box-shadow: inset 0 3px 0 rgba(255,255,255,0.55), 0 4px 0 rgba(47, 59, 55, 0.7);
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }

    .search-box input:focus {
      transform: translateY(-1px);
      box-shadow: inset 0 3px 0 rgba(255,255,255,0.55), 0 0 0 4px rgba(15,157,120,0.18), 0 4px 0 rgba(47, 59, 55, 0.7);
    }

    .table-card {
      overflow: hidden;
      border-radius: 18px;
      border: 4px solid var(--inv-line);
      background: linear-gradient(180deg, #fdfaf0, #d1f4e7);
      box-shadow: 0 7px 0 rgba(47, 59, 55, 0.9);
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 920px;
    }

    th, td {
      padding: 0.8rem 1rem;
      text-align: left;
      border-bottom: 3px solid rgba(47, 59, 55, 0.22);
      vertical-align: middle;
    }

    th {
      background: rgba(255,255,255,0.28);
      color: var(--inv-ink);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 900;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    tbody tr {
      transition: background 0.15s ease;
    }

    tbody tr:hover {
      background: rgba(15,157,120,0.05);
    }

    .med-name {
      color: var(--inv-ink);
      font-weight: 900;
      font-family: 'Chewy', 'Comic Sans MS', cursive;
      text-shadow: 1px 1px 0 rgba(255,255,255,0.8);
    }

    td small {
      display: block;
      margin-top: 0.12rem;
      color: var(--inv-muted);
      font-weight: 700;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.42rem 0.8rem;
      border-radius: 999px;
      border: 3px solid var(--inv-line);
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
      box-shadow: inset 0 -3px 0 rgba(0,0,0,0.08);
    }

    .badge.disponible {
      background: linear-gradient(180deg, #b9f0d0, #8bd9b4);
      color: #1d4938;
    }

    .badge.alerta {
      background: linear-gradient(180deg, #ffd3d3, #f4b0b0);
      color: #4f2020;
    }

    .badge.despachado {
      background: linear-gradient(180deg, #dfe9ff, #bfd1ff);
      color: #2a3c6d;
    }

    .btn-primary {
      padding: 0.7rem 1rem;
      border: 4px solid var(--inv-line);
      border-radius: 12px;
      background: linear-gradient(180deg, #f7df8c, #e7b447);
      color: var(--inv-ink);
      font-weight: 900;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
      cursor: pointer;
      box-shadow: 0 5px 0 rgba(47, 59, 55, 0.9);
      transition: transform 0.15s ease, filter 0.15s ease;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      filter: brightness(1.02);
    }

    .btn-primary:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 rgba(47, 59, 55, 0.9);
    }

    .muted {
      color: var(--inv-muted);
      font-weight: 800;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--inv-muted);
      font-weight: 800;
      font-family: 'Baloo 2', 'Chewy', 'Comic Sans MS', cursive;
    }

    @media (max-width: 720px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class ModuloInventarioComponent {
  omni = inject(OmniService);
  textoBusqueda = '';

  get inventarioFiltrado() {
    const buscar = this.textoBusqueda.trim().toLowerCase();

    if (!buscar) {
      return this.omni.inventarioFEFO();
    }

    return this.omni.inventarioFEFO().filter(item => {
      return item.nombre.toLowerCase().includes(buscar) || item.lote.toLowerCase().includes(buscar);
    });
  }

  despachar(item: any) {
    this.omni.despacharLoteFEFO(item);
  }
}